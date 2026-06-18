from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .routers import habits, logs


@asynccontextmanager
async def lifespan(app: FastAPI):
    # For local dev convenience; production should use Alembic migrations.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="HabitIQ API",
    description="Anonymous, device-based habit tracking backend for HabitIQ.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(habits.router, prefix=settings.api_v1_prefix)
app.include_router(logs.router, prefix=settings.api_v1_prefix)


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "app": "HabitIQ"}
