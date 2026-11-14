import asyncio
import sys

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import health, auth, requirements, artifacts, approvals, runs, worker

app = FastAPI(title="Protostar Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(requirements.router, prefix="/api/v1")
app.include_router(artifacts.router, prefix="/api/v1")
app.include_router(approvals.router, prefix="/api/v1")
app.include_router(runs.router, prefix="/api/v1")
app.include_router(worker.router, prefix="/api/v1")
