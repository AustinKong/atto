from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
  """Base model with camelCase aliases for JSON serialization."""

  model_config = ConfigDict(
    alias_generator=to_camel,
    populate_by_name=True,
  )
