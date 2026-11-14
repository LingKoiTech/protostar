from typing import Optional

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    db: str
    worker_last_seen: Optional[str] = None
