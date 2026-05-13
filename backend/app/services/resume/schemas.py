from shared.schemas.types import CamelModel


class OptimizedDetailedItem(CamelModel):
  title: str
  subtitle: str = ''
  bullets: list[str]


class OptimizedSimpleSection(CamelModel):
  content: list[str]


class OptimizedParagraphSection(CamelModel):
  content: str
