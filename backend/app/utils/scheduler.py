# backend/app/utils/scheduler.py

import asyncio
from datetime import datetime
from ..database import async_session
from ..models import Device, Interface, InterfaceStats, Alert
from .snmp_engine import get_snmp_interface_stats, get_snmp_device_status
from sqlalchemy.future import select

async def poll_devices(interval: int = 1):
    """
    Poll all devices periodically:
    - Update interface stats (in_bps, out_bps)
    - Update device status (up/down)
    - Generate alerts if interface goes down
    """
    while True:
        async with async_session() as session:
            # Get all devices
            query = await session.execute(select(Device))
            devices = query.scalars().all()

            for device in devices:
                # Get SNMP device status
                device_status = await get_snmp_device_status(device.ip_address, device.snmp_community, device.snmp_version)
                device.status = "up" if device_status else "down"
                device.last_seen = datetime.utcnow()

                # Poll interfaces
                interface_stats = await get_snmp_interface_stats(device.ip_address, device.snmp_community, device.snmp_version)
                for iface_name, stats in interface_stats.items():
                    # Find interface in DB or create
                    iface = next((i for i in device.interfaces if i.interface_name == iface_name), None)
                    if not iface:
                        iface = Interface(device_id=device.id, interface_name=iface_name)
                        session.add(iface)
                        await session.flush()  # To get ID

                    # Update interface stats
                    iface.status = stats.get("status", "down")
                    iface.mac_address = stats.get("mac", iface.mac_address)

                    # Insert interface_stats record
                    stat = InterfaceStats(interface_id=iface.id,
                                          in_bps=stats.get("in_bps", 0),
                                          out_bps=stats.get("out_bps", 0))
                    session.add(stat)

                    # Generate alert if interface is down
                    if iface.status == "down":
                        alert_msg = f"Interface {iface.interface_name} of {device.hostname} is DOWN"
                        alert = Alert(device_id=device.id,
                                      interface_id=iface.id,
                                      message=alert_msg,
                                      severity="critical")
                        session.add(alert)

            await session.commit()

        await asyncio.sleep(interval)

async def start_scheduler(interval: int = 1):
    """
    Start the background polling scheduler
    """
    asyncio.create_task(poll_devices(interval))
