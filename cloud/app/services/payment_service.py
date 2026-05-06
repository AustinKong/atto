import asyncio
from typing import Any

import stripe

from app.repositories.user_repository import UserRepository
from app.utils.settings import settings


# TODO: Check if code here is legit. i think webhook fn doesnt verify integrity
class PaymentService:
  def __init__(self, user_repository: UserRepository) -> None:
    self._user_repository = user_repository
    stripe.api_key = settings.stripe.secret_key

  @staticmethod
  def _price_id_for_plan(plan_tier: str) -> str:
    if plan_tier == 'basic':
      return settings.stripe.lite_price_id
    if plan_tier == 'standard':
      return settings.stripe.standard_price_id
    return settings.stripe.premium_price_id

  @staticmethod
  def _plan_for_price_id(price_id: str | None) -> str:
    if not price_id:
      return 'none'
    if price_id == settings.stripe.lite_price_id:
      return 'basic'
    if price_id == settings.stripe.standard_price_id:
      return 'standard'
    if price_id == settings.stripe.premium_price_id:
      return 'premium'
    return 'none'

  async def create_checkout_session(
    self,
    user_id: str,
    stripe_customer_id: str | None,
    plan_tier: str,
    success_url: str,
    cancel_url: str,
  ) -> str:
    if not settings.stripe.secret_key:
      raise ValueError('Stripe secret key is not configured')

    price_id = self._price_id_for_plan(plan_tier)
    if not price_id:
      raise ValueError(f'Stripe price id is not configured for plan: {plan_tier}')

    customer_id = stripe_customer_id

    if not customer_id:
      customer = await asyncio.to_thread(stripe.Customer.create, metadata={'user_id': user_id})
      customer_id = customer.id
      await self._user_repository.set_stripe_customer_id(user_id, customer_id)

    session = await asyncio.to_thread(
      stripe.checkout.Session.create,
      customer=customer_id,
      mode='subscription',
      line_items=[{'price': price_id, 'quantity': 1}],
      success_url=success_url,
      cancel_url=cancel_url,
      metadata={'user_id': user_id, 'plan_tier': plan_tier},
    )

    return str(session.url)

  @staticmethod
  def construct_webhook_event(payload: bytes, signature: str) -> stripe.Event:
    if not settings.stripe.webhook_secret:
      raise ValueError('Stripe webhook secret is not configured')

    return stripe.Webhook.construct_event(payload, signature, settings.stripe.webhook_secret)

  async def process_webhook_event(self, event: stripe.Event) -> None:
    event_type = event['type']

    if event_type == 'checkout.session.completed':
      await self._handle_checkout_completed(event)
      return

    if event_type in {
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
    }:
      await self._handle_subscription_event(event)

  async def _handle_checkout_completed(self, event: stripe.Event) -> None:
    session: dict[str, Any] = event['data']['object']
    metadata = session.get('metadata') or {}
    user_id = metadata.get('user_id')
    customer_id = session.get('customer')
    subscription_id = session.get('subscription')
    plan_tier = metadata.get('plan_tier', 'none')

    if not user_id:
      return

    await self._user_repository.set_subscription_for_user(
      user_id=user_id,
      customer_id=str(customer_id) if customer_id else None,
      subscription_id=str(subscription_id) if subscription_id else None,
      subscription_status='active',
      plan_tier=plan_tier,
    )

  async def _handle_subscription_event(self, event: stripe.Event) -> None:
    subscription: dict[str, Any] = event['data']['object']
    customer_id = subscription.get('customer')
    if not customer_id:
      return

    status = str(subscription.get('status') or 'none')
    if event['type'] == 'customer.subscription.deleted':
      status = 'canceled'

    items = (subscription.get('items') or {}).get('data') or []
    price_id = None
    if items and items[0].get('price'):
      price_id = items[0]['price'].get('id')

    await self._user_repository.set_subscription_for_customer(
      customer_id=str(customer_id),
      subscription_id=str(subscription.get('id')) if subscription.get('id') else None,
      subscription_status=status,
      plan_tier=self._plan_for_price_id(str(price_id) if price_id else None),
    )
