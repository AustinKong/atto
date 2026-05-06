from typing import Literal

from pydantic import BaseModel


# TODO: Should we get rid of schemas/ dir and move all to models/ dir?
class CheckoutSessionRequest(BaseModel):
  plan_tier: Literal['basic', 'standard', 'premium']
  success_url: str
  cancel_url: str


class CheckoutSessionResponse(BaseModel):
  checkout_url: str


class WebhookResponse(BaseModel):
  received: bool
