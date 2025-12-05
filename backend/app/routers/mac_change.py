# backend/app/routers/mac_change.py

from typing import AsyncGenerator, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..database import async_session
from ..models import MacChangeLog, Device
from ..schemas import MacChangeLog as MacChangeLogSchema

router = APIRouter(prefix="/mac-change", tags=["MAC Change Logs"])

# Dependency: DB session
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session

# ---------------------------------------------------------
# 1️⃣ Get all MAC change logs
# ---------------------------------------------------------
@router.get("/", response_model=List[MacChangeLogSchema])
async def get_all_mac_changes(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(MacChangeLog))
    logs = result.scalars().all()
    return logs

# ---------------------------------------------------------
# 2️⃣ Get MAC change logs for a specific device
# ---------------------------------------------------------
@router.get("/device/{device_id}", response_model=List[MacChangeLogSchema])
async def get_mac_changes_by_device(device_id: int, session: AsyncSession = Depends(get_session)):
    device_check = await session.execute(select(Device).where(Device.id == device_id))
    device = device_check.scalars().first()

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    result = await session.execute(
        select(MacChangeLog).where(MacChangeLog.device_id == device_id)
    )
    return result.scalars().all()

# ---------------------------------------------------------
# 3️⃣ Add new MAC change log (called by SNMP/LLDP engine)
# ---------------------------------------------------------
@router.post("/", response_model=MacChangeLogSchema)
async def add_mac_change_log(
    log: MacChangeLogSchema,
    session: AsyncSession = Depends(get_session)
):
    new_log = MacChangeLog(
        device_id=log.device_id,
        interface_id=log.interface_id,  # use interface_id instead of interface
        old_mac=log.old_mac,
        new_mac=log.new_mac,
        timestamp=log.timestamp
    )

    session.add(new_log)
    await session.commit()
    await session.refresh(new_log)
    return new_log

# ---------------------------------------------------------
# 4️⃣ Delete a MAC change log entry (COMMENTED OUT)
# ---------------------------------------------------------
# @router.delete("/{log_id}")
# async def delete_mac_change(log_id: int, session: AsyncSession = Depends(get_session)):
#     result = await session.execute(select(MacChangeLog).where(MacChangeLog.id == log_id))
#     log = result.scalars().first()
#
#     if not log:
#         raise HTTPException(status_code=404, detail="Log not found")
#
#     await session.delete(log)
#     await session.commit()
#
#     return {"message": f"MAC change log {log_id} deleted successfully"}
