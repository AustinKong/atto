from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Request

from app.schemas.auth import AuthContext
from app.schemas.payment import (
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  WebhookResponse,
)
from app.services.auth_service import get_authenticated_user
from app.services.payment_service import PaymentService

router = APIRouter(prefix='/cloud/payment', tags=['Payment'])


@router.post('/checkout-session', response_model=CheckoutSessionResponse)
async def create_checkout_session(
  payload: CheckoutSessionRequest,
  user_context: Annotated[AuthContext, Depends(get_authenticated_user)],
  payment_service: Annotated[PaymentService, Depends()],
) -> CheckoutSessionResponse:
  try:
    checkout_url = await payment_service.create_checkout_session(
      user_id=user_context.user.id,
      stripe_customer_id=user_context.user.stripe_customer_id,
      plan_tier=payload.plan_tier,
      success_url=payload.success_url,
      cancel_url=payload.cancel_url,
    )
  except ValueError as exc:
    raise HTTPException(status_code=503, detail=str(exc)) from exc
  except Exception as exc:
    raise HTTPException(status_code=502, detail='Stripe checkout session creation failed') from exc

  return CheckoutSessionResponse(checkout_url=checkout_url)


@router.post('/webhook', response_model=WebhookResponse)
async def stripe_webhook(
  request: Request,
  payment_service: Annotated[PaymentService, Depends()],
  stripe_signature: Annotated[str | None, Header(alias='Stripe-Signature')] = None,
) -> WebhookResponse:
  if not stripe_signature:
    raise HTTPException(status_code=400, detail='Missing Stripe-Signature header')

  payload = await request.body()

  try:
    event = payment_service.construct_webhook_event(payload=payload, signature=stripe_signature)
  except ValueError as exc:
    message = str(exc)
    status_code = 503 if 'not configured' in message else 400
    raise HTTPException(status_code=status_code, detail=message) from exc

  try:
    await payment_service.process_webhook_event(event)
  except Exception as exc:
    raise HTTPException(status_code=502, detail='Stripe webhook processing failed') from exc

  return WebhookResponse(received=True)
