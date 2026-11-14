from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel


class ArtifactUpsert(BaseModel):
    requirement_id: UUID
    file_path: str


class ArtifactResponse(BaseModel):
    id: UUID
    requirement_id: UUID
    type: Literal["spec", "plan", "tasks"]
    file_path: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
