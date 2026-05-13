from shared.schemas.types import CamelModel


class DeepCrawlResult(CamelModel):
  url: str
  content: str
  screenshot: str | None = None
  depth: int
  success: bool
  error_message: str | None = None
