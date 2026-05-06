from pydantic import BaseModel

from app.models.user import User


class AccessContext(BaseModel):
  access_mode: str
  has_subscription: bool
  has_byok: bool
  access_denial_code: str | None


class AuthContext(BaseModel):
  user: User
  access: AccessContext
