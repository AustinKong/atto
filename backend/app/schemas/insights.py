from pydantic import Field

from app.schemas.types import CamelModel


class LinkSelectionResponse(CamelModel):
  links: list[str] = Field(
    max_length=3,
    min_length=1,
    description='List of 3 full URLs that are most relevant for understanding the company',
  )
