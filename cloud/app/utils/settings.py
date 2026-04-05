from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


class RedisSettings(BaseModel):
  url: str = 'redis://localhost:6379/0'


# TODO: Why are these have default. remove
class PostgresSettings(BaseModel):
  url: str = 'postgresql+asyncpg://postgres:postgres@localhost:5432/atto_cloud'


class ClerkSettings(BaseModel):
  secret_key: str


class CloudSettings(BaseSettings):
  model_config = SettingsConfigDict(env_nested_delimiter='__', env_file='.env')

  redis: RedisSettings = RedisSettings()
  postgres: PostgresSettings = PostgresSettings()
  clerk: ClerkSettings

  # TODO: Should probably nest these as well
  glassdoor_api_key: str = ''
  salary_api_key: str = ''
  market_api_key: str = ''
  gemini_api_key: str = ''
  gemini_model: str = 'gemini-3.1-flash-lite-preview'
  gemini_embedding_model: str = 'gemini-embedding-001'
  gemini_temperature: float = 0.2

  default_token_budget: int = 1000
  token_window: int = 2592000  # 30 days in seconds
  queue_timeout: float = 30.0  # seconds to wait for a rate limit token before 504


settings = CloudSettings()
