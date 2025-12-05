# backend/app/utils/lldp.py

from ..database import async_session
from ..models import Device, Interface, TopologyLink
from sqlalchemy.future import select
from datetime import datetime
from .snmp_engine import get_lldp_neighbors

async def discover_topology():
    """
    Discover network topology using LLDP for all devices
    """
    async with async_session() as session:
        # Get all devices
        query = await session.execute(select(Device))
        devices = query.scalars().all()

        for device in devices:
            # Get LLDP neighbors from SNMP
            neighbors = await get_lldp_neighbors(device.ip_address, device.snmp_community, device.snmp_version)
            # neighbors: dict {local_iface: {"neighbor_ip": ip, "neighbor_iface": iface_name}}

            for local_iface, neighbor_info in neighbors.items():
                neighbor_ip = neighbor_info.get("neighbor_ip")
                neighbor_iface = neighbor_info.get("neighbor_iface")

                # Find neighbor device in DB
                neighbor_query = await session.execute(select(Device).where(Device.ip_address == neighbor_ip))
                neighbor_device = neighbor_query.scalars().first()
                if not neighbor_device:
                    continue  # neighbor device not in DB yet

                # Check if link already exists
                link_query = await session.execute(
                    select(TopologyLink).where(
                        (TopologyLink.src_device_id == device.id) &
                        (TopologyLink.src_interface == local_iface) &
                        (TopologyLink.dst_device_id == neighbor_device.id) &
                        (TopologyLink.dst_interface == neighbor_iface)
                    )
                )
                existing_link = link_query.scalars().first()
                if existing_link:
                    existing_link.last_seen = datetime.utcnow()
                else:
                    # Add new topology link
                    new_link = TopologyLink(
                        src_device_id=device.id,
                        src_interface=local_iface,
                        dst_device_id=neighbor_device.id,
                        dst_interface=neighbor_iface,
                        last_seen=datetime.utcnow()
                    )
                    session.add(new_link)

        await session.commit()
