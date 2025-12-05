# backend/app/utils/snmp_engine.py
import asyncio
import logging
from datetime import datetime
from pysnmp.hlapi import (
    SnmpEngine,
    CommunityData,
    UdpTransportTarget,
    ContextData,
    ObjectType,
    ObjectIdentity,
    getCmd,
    nextCmd,
)
from ..database import async_session
from ..models import Device, Interface, InterfaceStats, TopologyLink
from sqlalchemy.future import select

# --------------------------------------------------------------------------
# Logging
# --------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("SNMP_ENGINE")

# --------------------------------------------------------------------------
# SNMP OIDs
# --------------------------------------------------------------------------
IF_DESCR_OID = "1.3.6.1.2.1.2.2.1.2"
IF_OPER_STATUS_OID = "1.3.6.1.2.1.2.2.1.8"
IF_IN_OCTETS_OID = "1.3.6.1.2.1.2.2.1.10"
IF_OUT_OCTETS_OID = "1.3.6.1.2.1.2.2.1.16"
IF_MAC_OID = "1.3.6.1.2.1.2.2.1.6"

# LLDP MIB OIDs (standard)
LLDP_REM_SYS_NAME = "1.0.8802.1.1.2.1.4.1.1.9"
LLDP_REM_PORT_DESC = "1.0.8802.1.1.2.1.4.1.1.8"
LLDP_REM_MAN_ADDR = "1.0.8802.1.1.2.1.4.2.1.4"

# --------------------------------------------------------------------------
# Utility Functions
# --------------------------------------------------------------------------
def calc_bps(old, new, interval):
    try:
        return max((new - old) * 8 / interval, 0)
    except Exception:
        return 0


def oid_index(oid_string):
    try:
        return oid_string.rsplit(".", 1)[-1]
    except Exception:
        return None


# --------------------------------------------------------------------------
# Async SNMP GET
# --------------------------------------------------------------------------
async def snmp_get(target, oid, community="public", port=161):
    def run_get():
        iterator = getCmd(
            SnmpEngine(),
            CommunityData(community, mpModel=0),
            UdpTransportTarget((target, port), timeout=2, retries=1),
            ContextData(),
            ObjectType(ObjectIdentity(oid)),
        )
        return next(iterator)

    try:
        errorIndication, errorStatus, errorIndex, varBinds = await asyncio.to_thread(run_get)
    except Exception as e:
        log.error(f"snmp_get exception on {target} oid={oid} -> {e}")
        return None

    if errorIndication or errorStatus:
        log.debug(f"SNMP GET failed {target} OID={oid} Error={errorIndication or errorStatus}")
        return None
    try:
        return varBinds[0][1]
    except Exception:
        return None


# --------------------------------------------------------------------------
# Async SNMP WALK
# --------------------------------------------------------------------------
async def snmp_walk(target, oid, community="public", port=161):
    results = {}

    def run_walk():
        iterator = nextCmd(
            SnmpEngine(),
            CommunityData(community, mpModel=0),
            UdpTransportTarget((target, port), timeout=2, retries=1),
            ContextData(),
            ObjectType(ObjectIdentity(oid)),
            lexicographicMode=False,
        )
        return list(iterator)

    try:
        walk_results = await asyncio.to_thread(run_walk)
    except Exception as e:
        log.error(f"snmp_walk exception on {target} oid={oid} -> {e}")
        return None

    for errInd, errStat, errIdx, varBinds in walk_results:
        if errInd or errStat:
            log.debug(f"SNMP WALK error on {target} OID={oid} => {errInd or errStat}")
            return None
        for oid_val, value in varBinds:
            results[str(oid_val)] = value
    return results


# --------------------------------------------------------------------------
# Fetch LLDP neighbors
# --------------------------------------------------------------------------
async def get_lldp_neighbors(target, community="public"):
    """
    Returns dict: {local_iface_index: {"neighbor_ip": str, "neighbor_iface": str, "neighbor_name": str}}
    Note: local_iface_index is the LLDP index suffix. Mapping index -> ifDescr may be needed if you require human
    interface names (we keep index here and match to ifDescr loop).
    """
    neighbors = {}
    sysnames = await snmp_walk(target, LLDP_REM_SYS_NAME, community)
    portdesc = await snmp_walk(target, LLDP_REM_PORT_DESC, community)
    manaddr = await snmp_walk(target, LLDP_REM_MAN_ADDR, community)

    if not sysnames:
        return neighbors

    for oid, sysname in sysnames.items():
        index = oid_index(oid)
        if index is None:
            continue
        # sanitize values
        neighbor_name = str(sysname).replace("\x00", "").strip()
        neighbor_ip = ""
        if manaddr:
            neighbor_ip = str(manaddr.get(f"{LLDP_REM_MAN_ADDR}.{index}", "")).replace("\x00", "").strip()
        neighbor_iface = ""
        if portdesc:
            neighbor_iface = str(portdesc.get(f"{LLDP_REM_PORT_DESC}.{index}", "")).replace("\x00", "").strip()

        neighbors[index] = {
            "neighbor_name": neighbor_name,
            "neighbor_ip": neighbor_ip,
            "neighbor_iface": neighbor_iface,
        }

    return neighbors


# --------------------------------------------------------------------------
# Poll a single device (interfaces + LLDP)
# --------------------------------------------------------------------------
async def poll_device(device_info: dict, interval=5):
    """
    device_info is a plain dict (not a SQLAlchemy instance):
      { "id": int, "hostname": str, "ip_address": str, "snmp_community": str }
    This avoids DetachedInstance errors when sessions are closed.
    """
    try:
        target = device_info.get("ip_address")
        community = device_info.get("snmp_community") or "public"
        device_id = device_info.get("id")
        device_name = device_info.get("hostname") or str(device_id)

        if not target:
            log.error(f"Device {device_name} has no IP configured - skipping")
            return

        log.info(f"Polling device {device_name} ({target})")

        # SNMP interface data
        if_descr = await snmp_walk(target, IF_DESCR_OID, community)
        if_oper = await snmp_walk(target, IF_OPER_STATUS_OID, community)
        if_in = await snmp_walk(target, IF_IN_OCTETS_OID, community)
        if_out = await snmp_walk(target, IF_OUT_OCTETS_OID, community)
        if_mac = await snmp_walk(target, IF_MAC_OID, community)

        if not if_descr:
            log.info(f"{target}: no ifDescr (SNMP may be unreachable)")
            # mark device down in DB if present
            async with async_session() as session:
                try:
                    q = await session.execute(select(Device).where(Device.id == device_id))
                    db_dev = q.scalars().first()
                    if db_dev:
                        db_dev.status = "down"
                        db_dev.last_seen = None
                        await session.commit()
                except Exception:
                    await session.rollback()
            return

        # SNMP LLDP neighbors
        neighbors = await get_lldp_neighbors(target, community)

        async with async_session() as session:
            try:
                # Load existing interface rows for this device, keyed by interface_name
                q = await session.execute(select(Interface).where(Interface.device_id == device_id))
                existing_ifaces = { (i.interface_name or "").strip(): i for i in q.scalars().all() }

                # iterate ifDescr results
                for full_oid, name_val in if_descr.items():
                    try:
                        name = str(name_val).replace("\x00", "").strip()
                        index = oid_index(full_oid)
                        if index is None:
                            continue

                        # build keys for other walks
                        oper_key = f"{IF_OPER_STATUS_OID}.{index}"
                        in_key = f"{IF_IN_OCTETS_OID}.{index}"
                        out_key = f"{IF_OUT_OCTETS_OID}.{index}"
                        mac_key = f"{IF_MAC_OID}.{index}"

                        oper_raw = if_oper.get(oper_key) if if_oper else None
                        oper_status_val = int(oper_raw) if oper_raw is not None else 2
                        oper_status = "up" if oper_status_val == 1 else "down"

                        in_oct = int(if_in.get(in_key, 0)) if if_in else 0
                        out_oct = int(if_out.get(out_key, 0)) if if_out else 0
                        mac = str(if_mac.get(mac_key, "")).replace("\x00", "").strip() if if_mac else None
                        if mac == "":
                            mac = None

                        # compute bps and convert to integer for BigInteger DB column
                        in_bps = int((in_oct * 8 / interval)) if in_oct is not None else 0
                        out_bps = int((out_oct * 8 / interval)) if out_oct is not None else 0
                        speed_bps = int(calc_bps(0, in_oct, interval)) if in_oct else None

                        log.info(f"IF={name} STATUS={oper_status} IN={in_bps}bps OUT={out_bps}bps MAC=({mac})")

                        # Find or create interface ORM row
                        intf = existing_ifaces.get(name)
                        if intf:
                            intf.status = oper_status
                            if mac:
                                intf.mac_address = mac
                            if speed_bps is not None:
                                intf.speed_bps = speed_bps
                        else:
                            intf = Interface(
                                device_id=device_id,
                                interface_name=name,
                                status=oper_status,
                                mac_address=mac or None,
                                speed_bps=speed_bps,
                            )
                            session.add(intf)
                            # flush to get intf.id for InterfaceStats FK
                            await session.flush()
                            existing_ifaces[name] = intf

                        # Insert interface stats (integers only)
                        stats = InterfaceStats(
                            interface_id=intf.id,
                            timestamp=datetime.utcnow(),
                            in_bps=in_bps,
                            out_bps=out_bps,
                        )
                        session.add(stats)

                        # Process LLDP neighbor for this index (if any)
                        neighbor_info = neighbors.get(index)
                        if neighbor_info:
                            neighbor_ip = neighbor_info.get("neighbor_ip")
                            neighbor_iface = neighbor_info.get("neighbor_iface")
                            neighbor_name = neighbor_info.get("neighbor_name")

                            # Lookup neighbor device by IP (if present in DB)
                            neighbor_device = None
                            if neighbor_ip:
                                qdev = await session.execute(select(Device).where(Device.ip_address == neighbor_ip))
                                neighbor_device = qdev.scalars().first()

                            # Only create topology link if neighbor_device exists (your TopologyLink model stores device ids)
                            if neighbor_device:
                                qlink = await session.execute(
                                    select(TopologyLink).where(
                                        (TopologyLink.src_device_id == device_id)
                                        & (TopologyLink.src_interface == name)
                                        & (TopologyLink.dst_device_id == neighbor_device.id)
                                        & (TopologyLink.dst_interface == neighbor_iface)
                                    )
                                )
                                link = qlink.scalars().first()
                                if link:
                                    link.last_seen = datetime.utcnow()
                                else:
                                    new_link = TopologyLink(
                                        src_device_id=device_id,
                                        src_interface=name,
                                        dst_device_id=neighbor_device.id,
                                        dst_interface=neighbor_iface,
                                        last_seen=datetime.utcnow(),
                                    )
                                    session.add(new_link)
                            else:
                                # If neighbor not in DB, we skip storing the link (alternatively you could store
                                # an "unknown" link row if you expand your model later)
                                log.debug(f"{target} IF={name}: neighbor ({neighbor_name} {neighbor_ip}) not in DB - skipping link storage")

                    except Exception as e:
                        log.exception(f"Error processing interface {full_oid} on {target}: {e}")
                        # continue with other interfaces

                # Update device status in DB (fetch the DB row and update)
                qdev = await session.execute(select(Device).where(Device.id == device_id))
                db_dev = qdev.scalars().first()
                if db_dev:
                    db_dev.status = "up"
                    db_dev.last_seen = datetime.utcnow()

                # commit everything for this device
                try:
                    await session.commit()
                    log.info(f"{target}: interfaces, stats, and LLDP committed")
                except Exception as e:
                    log.exception(f"{target}: DB commit failed: {e}")
                    await session.rollback()

            except Exception as e:
                # rollback if something inside the session block blows up
                log.exception(f"Session-level error for {target}: {e}")
                try:
                    await session.rollback()
                except Exception:
                    pass

    except Exception as e:
        log.exception(f"Unexpected error polling device {device_info.get('hostname', device_info.get('id'))}: {e}")


# --------------------------------------------------------------------------
# Poll all devices continuously
# --------------------------------------------------------------------------
async def poll_all_devices(interval=5):
    log.info(f"Starting continuous SNMP polling every {interval} seconds...")
    while True:
        try:
            async with async_session() as session:
                q = await session.execute(select(Device))
                devices = q.scalars().all()

            # build simple device_info dicts to avoid passing ORM instances between tasks
            device_infos = []
            for d in devices:
                device_infos.append({
                    "id": d.id,
                    "hostname": d.hostname,
                    "ip_address": d.ip_address,
                    "snmp_community": d.snmp_community,
                })

            log.info(f"Polling {len(device_infos)} devices...")

            tasks = [poll_device(info, interval) for info in device_infos]
            # gather tasks but don't let one failing task cancel others
            await asyncio.gather(*tasks, return_exceptions=False)
        except Exception as e:
            log.exception(f"poll_all_devices top-level error: {e}")

        await asyncio.sleep(interval)
