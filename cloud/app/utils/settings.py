from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


class RedisSettings(BaseModel):
  url: str = 'redis://localhost:6379/0'


# TODO: Why are these have default. remove
class PostgresSettings(BaseModel):
  url: str


class ClerkSettings(BaseModel):
  secret_key: str


class StripeSettings(BaseModel):
  secret_key: str
  webhook_secret: str
  lite_price_id: str = 'lite_monthly'
  standard_price_id: str = 'standard_monthly'
  premium_price_id: str = 'premium_monthly'


class GlassdoorProviderSettings(BaseModel):
  api_key: str
  base_url: str = 'https://api.glassdoor.com/api/api.htm'


class SalaryProviderSettings(BaseModel):
  api_key: str
  base_url: str = 'https://api.salaryapi.com/v1/salary'


class MarketProviderSettings(BaseModel):
  api_key: str
  base_url: str = 'https://newsapi.org/v2/everything'


class GeminiProviderSettings(BaseModel):
  api_key: str
  base_url: str = 'https://generativelanguage.googleapis.com'
  model: str = 'gemini-3.1-flash-lite-preview'
  embedding_model: str = 'gemini-embedding-001'
  temperature: float = 0.2


class ProviderSettings(BaseModel):
  glassdoor: GlassdoorProviderSettings
  salary: SalaryProviderSettings
  market: MarketProviderSettings
  gemini: GeminiProviderSettings


# TODO: should move x_price_id from StripeSettings to here; and rename this to plan_settings
class PlanRequestLimit(BaseModel):
  rpm: int
  per_day: int


class PlanRequestLimits(BaseModel):
  basic: PlanRequestLimit = PlanRequestLimit(rpm=20, per_day=1500)
  standard: PlanRequestLimit = PlanRequestLimit(rpm=60, per_day=10000)
  premium: PlanRequestLimit = PlanRequestLimit(rpm=180, per_day=50000)


class CloudSettings(BaseSettings):
  model_config = SettingsConfigDict(env_nested_delimiter='__', env_file='.env')

  redis: RedisSettings = RedisSettings()
  postgres: PostgresSettings
  clerk: ClerkSettings
  stripe: StripeSettings
  providers: ProviderSettings
  plan_request_limits: PlanRequestLimits = PlanRequestLimits()

  default_token_budget: int = 1000
  token_window: int = 2592000  # 30 days in seconds
  queue_timeout: float = 30.0  # seconds to wait for a rate limit token before 504


settings = CloudSettings()  # type: ignore[call-arg]
