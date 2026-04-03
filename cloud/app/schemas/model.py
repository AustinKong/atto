from app.schemas.types import CamelModel


# TODO: Possibly move to shard package
class CallStructuredRequest(CamelModel):
  input: str
  response_schema: dict


class CallStructuredResult(CamelModel):
  output: str


class CallUnstructuredRequest(CamelModel):
  input: str


class CallUnstructuredResult(CamelModel):
  output: str
