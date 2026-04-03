from typing import Annotated

from fastapi import Depends

from app.clients.salary_client import SalaryClient
from app.endpoints.base_endpoint import BaseEndpoint
from app.schemas.research import SalaryRangeResult


class SalaryRangeEndpoint(BaseEndpoint[SalaryRangeResult, SalaryClient]):
  token_cost = 8
  cache_enabled = True
  cache_ttl = 86400  # 24h
  key = 'salary-range'
  response_model = SalaryRangeResult

  def __init__(self, client: Annotated[SalaryClient, Depends()]) -> None:
    self.provider_client = client

  def get_cache_key(self, params: dict[str, str]) -> str:
    role = params.get('role', '').lower().strip()
    company = params.get('company', '').lower().strip()
    location = params.get('location', '').lower().strip()
    return f'{role}:{company}:{location}'

  async def execute(self, params: dict[str, str]) -> SalaryRangeResult:
    data = await self.provider_client.get_salary_range(
      role=params['role'],
      company=params.get('company', ''),
      location=params.get('location'),
    )
    return SalaryRangeResult(
      industry_min=data.industry_min,
      industry_q1=data.industry_q1,
      industry_median=data.industry_median,
      industry_q3=data.industry_q3,
      industry_max=data.industry_max,
      currency=data.currency,
    )
