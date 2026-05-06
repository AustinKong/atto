from datetime import datetime

from sqlalchemy import DateTime, func
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
  __tablename__ = 'users'

  id: str = Field(primary_key=True)
  subscription_status: str = Field(default='none')
  plan_tier: str = Field(default='none')
  stripe_customer_id: str | None = Field(default=None, index=True)
  stripe_subscription_id: str | None = Field(default=None)
  created_at: datetime = Field(
    sa_type=DateTime(timezone=True),
    sa_column_kwargs={'server_default': func.now(), 'nullable': False},
  )
