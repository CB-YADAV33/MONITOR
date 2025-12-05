import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from .routers import devices, interfaces, alerts, sites, topology, auth, stats, mac_change
from .websocket import real_time
from .database import init_db
from .utils import snmp_engine

app = FastAPI(title="Advanced NMS Tool", version="1.0")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update to frontend origin if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(devices.router, prefix="/devices", tags=["Devices"])
app.include_router(interfaces.router, prefix="/interfaces", tags=["Interfaces"])
app.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
app.include_router(sites.router, prefix="/sites", tags=["Sites"])
app.include_router(topology.router, prefix="/topology", tags=["Topology"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(stats.router, prefix="/stats", tags=["Stats"])
app.include_router(mac_change.router, prefix="/mac-change", tags=["MAC Change Logs"])

# Websocket router
app.include_router(real_time.router, prefix="/ws", tags=["WebSocket"])

# --------------------------------------------------------------------------
# Startup Event
# --------------------------------------------------------------------------
@app.on_event("startup")
async def startup_event():
    # Initialize database tables
    await init_db()
    print("Database initialized!")

    # Get event loop
    loop = asyncio.get_event_loop()

    # Start SNMP engine (with LLDP polling) in background
    loop.create_task(run_snmp_loop())
    print("SNMP Engine (with LLDP) started in background")

    # Start WebSocket push in background
    loop.create_task(real_time.realtime_push(interval=1))
    print("WebSocket real-time push started")

# --------------------------------------------------------------------------
# Run SNMP + LLDP polling in a single loop safely
# --------------------------------------------------------------------------
async def run_snmp_loop():
    """Continuously poll all devices using SNMP (includes LLDP)."""
    interval = 5  # seconds
    while True:
        try:
            await snmp_engine.poll_all_devices(interval=interval)
        except Exception as e:
            print(f"[SNMP Engine Error] {e}")
        await asyncio.sleep(interval)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Advanced NMS Tool Backend is running!"}

# Run:
# uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
