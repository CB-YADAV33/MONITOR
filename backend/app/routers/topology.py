# backend/app/routers/topology.py

from typing import AsyncGenerator, List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_

from app.database import async_session
from app.models import TopologyLink, Device
from app.schemas import TopologyLink as TopologyLinkSchema

router = APIRouter()


# Dependency: get DB session
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session


# --- List all topology links ---
@router.get("/", response_model=List[TopologyLinkSchema])
async def list_links(session: AsyncSession = Depends(get_session)):
    query = await session.execute(select(TopologyLink))
    links = query.scalars().all()
    result = []
    for link in links:
        src_device = await session.get(Device, link.src_device_id)
        dst_device = await session.get(Device, link.dst_device_id)
        link_data = TopologyLinkSchema.from_orm(link).dict()
        link_data["src_device_name"] = src_device.hostname if src_device else None
        link_data["dst_device_name"] = dst_device.hostname if dst_device else None
        result.append(link_data)
    return result


# --- Get topology links for a specific device ---
@router.get("/device/{device_id}", response_model=List[TopologyLinkSchema])
async def device_links(device_id: int, session: AsyncSession = Depends(get_session)):
    device_result = await session.execute(select(Device).where(Device.id == device_id))
    device = device_result.scalars().first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    query = await session.execute(
        select(TopologyLink).where(
            or_(
                TopologyLink.src_device_id == device_id,
                TopologyLink.dst_device_id == device_id
            )
        )
    )
    links = query.scalars().all()

    result = []
    for link in links:
        src_device = await session.get(Device, link.src_device_id)
        dst_device = await session.get(Device, link.dst_device_id)
        link_data = TopologyLinkSchema.from_orm(link).dict()
        link_data["src_device_name"] = src_device.hostname if src_device else None
        link_data["dst_device_name"] = dst_device.hostname if dst_device else None
        result.append(link_data)

    return result
