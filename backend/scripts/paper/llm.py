from prompts import LISTING_PROMPT, LISTING_TARGETS_PROMPT
from schemas import (
  PaperListingResponse,
  PaperListingTargetResponse,
  PaperListingTargetsResponse,
)

from app.clients.cloud_api_client import CloudApiClient
from app.clients.model import ModelClient, get_model_client


async def generate_listing_targets(
  *,
  model_client: ModelClient,
  count: int,
) -> list[PaperListingTargetResponse]:
  response = await model_client.call_structured(
    input=LISTING_TARGETS_PROMPT.format(count=count),
    response_model=PaperListingTargetsResponse,
  )

  # Non-strict: duplicate pairs are dropped, so the final fixture can be slightly under count.
  unique_targets = {
    (target.company.lower(), target.title.lower()): target for target in response.items
  }
  targets = list(unique_targets.values())

  print(f'Generated {len(targets)}/{count} unique listing targets.')
  return targets


async def generate_listings(
  *,
  count: int,
) -> list[PaperListingResponse]:
  model_client = get_runtime_model_client()
  targets = await generate_listing_targets(model_client=model_client, count=count)
  listings: list[PaperListingResponse] = []

  for index, target in enumerate(targets):
    try:
      listing = await model_client.call_structured(
        input=LISTING_PROMPT.format(
          company=target.company,
          title=target.title,
          listing_number=index + 1,
        ),
        response_model=PaperListingResponse,
      )
    except Exception as exc:
      print(f'Skipped {target.company} / {target.title}: {exc}')
      continue

    listing = listing.model_copy(
      update={
        'company': target.company,
        'title': target.title,
      }
    )
    listings.append(listing)
    print(f'Generated {len(listings)}/{len(targets)} listing responses.')

  return listings


def get_runtime_model_client() -> ModelClient:
  return get_model_client(CloudApiClient())
