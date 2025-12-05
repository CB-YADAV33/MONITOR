# backend/app/utils/alerts.py

from typing import AsyncGenerator
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..database import async_session
from ..models import Alert, Device
from ..schemas import Alert as AlertSchema

router = APIRouter()

# Dependency: get DB session
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session

# List all alerts
@router.get("/", response_model=List[AlertSchema])
async def list_alerts(session: AsyncSession = Depends(get_session)):
    query = await session.execute(select(Alert))
    alerts = query.scalars().all()
    return alerts

# Get alerts for a specific device
@router.get("/device/{device_id}", response_model=List[AlertSchema])
async def device_alerts(device_id: int, session: AsyncSession = Depends(get_session)):
    query = await session.execute(select(Device).where(Device.id == device_id))
    device = query.scalars().first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    query = await session.execute(select(Alert).where(Alert.device_id == device_id))
    alerts = query.scalars().all()
    return alerts

# Optional: Mark alert as resolved (delete)
@router.delete("/{alert_id}", response_model=dict)
async def delete_alert(alert_id: int, session: AsyncSession = Depends(get_session)):
    query = await session.execute(select(Alert).where(Alert.id == alert_id))
    alert = query.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    await session.delete(alert)
    await session.commit()
    return {"message": f"Alert {alert_id} deleted successfully"}
