from typing import AsyncGenerator, List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import async_session
from ..models import Site as SiteModel
from ..schemas import Site as SiteSchema, SiteBase

router = APIRouter()

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session

@router.post("/", response_model=SiteSchema)
async def add_site(site: SiteBase, session: AsyncSession = Depends(get_session)):
    new_site = SiteModel(**site.dict())
    session.add(new_site)
    await session.commit()
    await session.refresh(new_site)
    return new_site

@router.get("/", response_model=List[SiteSchema])
async def list_sites(session: AsyncSession = Depends(get_session)):
    query = await session.execute(select(SiteModel))
    return query.scalars().all()

@router.get("/{site_id}", response_model=SiteSchema)
async def get_site(site_id: int, session: AsyncSession = Depends(get_session)):
    query = await session.execute(select(SiteModel).where(SiteModel.id == site_id))
    site = query.scalars().first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site

@router.put("/{site_id}", response_model=SiteSchema)
async def update_site(site_id: int, site: SiteBase, session: AsyncSession = Depends(get_session)):
    query = await session.execute(select(SiteModel).where(SiteModel.id == site_id))
    db_site = query.scalars().first()
    if not db_site:
        raise HTTPException(status_code=404, detail="Site not found")
    for key, value in site.dict().items():
        setattr(db_site, key, value)
    await session.commit()
    await session.refresh(db_site)
    return db_site

@router.delete("/{site_id}", response_model=dict)
async def delete_site(site_id: int, session: AsyncSession = Depends(get_session)):
    query = await session.execute(select(SiteModel).where(SiteModel.id == site_id))
    db_site = query.scalars().first()
    if not db_site:
        raise HTTPException(status_code=404, detail="Site not found")
    await session.delete(db_site)
    await session.commit()
    return {"message": f"Site {db_site.site_name} deleted successfully"}
