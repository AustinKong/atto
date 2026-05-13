from uuid import UUID

from pydantic import BaseModel, Field


class AIUnitSuggestionResponse(BaseModel):
  id: str
  unit_id: UUID
  suggestion: str
  replacement_text: str | None = None


class AISuggestionsResponse(BaseModel):
  summary: str
  suggestions: list[AIUnitSuggestionResponse] = Field(default_factory=list)
