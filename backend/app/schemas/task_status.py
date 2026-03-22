from enum import StrEnum

from pydantic import BaseModel


class TaskStatus(StrEnum):
  PENDING = 'pending'
  RUNNING = 'running'
  SUCCEEDED = 'succeeded'
  FAILED = 'failed'


class TaskStatusEntry(BaseModel):
  status: TaskStatus
  error: str | None = None
