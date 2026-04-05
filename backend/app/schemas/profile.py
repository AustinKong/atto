from shared.schemas.types import CamelModel


class Profile(CamelModel):
  full_name: str = ''
  email: str = ''
  phone: str = ''
  location: str = ''
  website: str = ''
