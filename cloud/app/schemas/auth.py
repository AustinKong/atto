from pydantic import BaseModel


# TODO: cloud shouldnt differentiate between authenticated and unauthenticated users.
# Because all valid cloud users are authenticated
class AuthenticatedUser(BaseModel):
  user_id: str  # Clerk sub claim (opaque string)
