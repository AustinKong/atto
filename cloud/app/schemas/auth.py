from pydantic import BaseModel


class AuthenticatedUser(BaseModel):
  user_id: str  # Clerk sub claim (opaque string)
