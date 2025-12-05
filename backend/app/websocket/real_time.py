from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
from ..database import async_session
from ..models import Device, Interface
from sqlalchemy.future import select

router = APIRouter()
clients = []  # Connected WebSocket clients

# WebSocket endpoint
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    try:
        while True:
            await asyncio.sleep(5)  # Keep connection alive
    except WebSocketDisconnect:
        clients.remove(websocket)

# Send JSON to all connected clients
async def send_to_clients(message: dict):
    disconnected = []
    for client in clients:
        try:
            await client.send_json(message)
        except:
            disconnected.append(client)
    for d in disconnected:
        clients.remove(d)

# Prepare real-time device/interface data
async def collect_device_data():
    async with async_session() as session:
        query = await session.execute(select(Device))
        devices = query.scalars().all()
        data = []
        for d in devices:
            device_data = {
                "device_id": d.id,
                "hostname": d.hostname,
                "ip": d.ip_address,
                "status": d.status,
                "interfaces": []
            }
            query2 = await session.execute(select(Interface).where(Interface.device_id==d.id))
            interfaces = query2.scalars().all()
            for intf in interfaces:
                device_data["interfaces"].append({
                    "name": intf.interface_name,
                    "status": intf.status,
                    "speed_bps": intf.speed_bps,
                    "mac": intf.mac_address
                })
            data.append(device_data)
        return data

# Push updates every interval
async def realtime_push(interval=1):
    while True:
        data = await collect_device_data()
        await send_to_clients({"type": "device_update", "data": data})
        await asyncio.sleep(interval)

# Start real-time WebSocket push
def start_realtime(interval=1):
    asyncio.run(realtime_push(interval))
