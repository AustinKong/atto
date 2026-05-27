from typing import Annotated, Any

from fastapi import APIRouter, Body, Depends
from fastapi.responses import PlainTextResponse

from app.config import settings
from app.config.schemas import (
  EMBEDDING_OPTIONS_BY_PROVIDER,
  MODEL_OPTIONS_BY_PROVIDER,
  AppConfig,
  ModelProvider,
)
from app.services.model_setup_service import ModelSetupService
from app.utils.errors import ApplicationError, ValidationError, user_facing_error_message

router = APIRouter(prefix='/config', tags=['Config'])


# TODO: Remove this logic if not used anymore
# (category_key, field_key) -> provider function
DYNAMIC_ENUM_PROVIDERS = {
  # ('resume', 'default_template'): templates_service.list_local_templates,
}


@router.get('')
def get_settings():
  # No need to censor values because the app is fully local
  values = settings.config.model_dump(mode='json')
  schema = AppConfig.model_json_schema()
  defs = schema.get('$defs', {})

  ui_structure = {}

  for category_key, category_meta in schema.get('properties', {}).items():
    ref_path = category_meta.get('$ref', '')
    ref_name = ref_path.split('/')[-1]
    category_def = defs.get(ref_name, {})

    category_values = values.get(category_key, {})
    fields_config = {}

    for field_key, field_meta in category_def.get('properties', {}).items():
      exposure = field_meta.get('exposure', 'normal')

      if exposure == 'hidden':
        continue

      fields_config[field_key] = {
        'value': category_values.get(field_key),
        'title': field_meta.get('title', field_key),
        'description': field_meta.get('description', ''),
        'type': get_field_type(field_meta),
        'exposure': exposure,
        'minimum': field_meta.get('minimum'),
        'maximum': field_meta.get('maximum'),
        'enum': get_enum_values(field_meta),
        'disabledMessage': field_meta.get('disabledMessage'),
      }

      if (provider := DYNAMIC_ENUM_PROVIDERS.get((category_key, field_key))) is not None:
        try:
          dynamic_enum = provider()
          fields_config[field_key]['enum'] = dynamic_enum
        except Exception:
          pass

      if category_key == 'model' and field_key == 'llm':
        fields_config[field_key]['enumByProvider'] = MODEL_OPTIONS_BY_PROVIDER
      elif category_key == 'model' and field_key == 'embedding':
        fields_config[field_key]['enumByProvider'] = EMBEDDING_OPTIONS_BY_PROVIDER

    if fields_config:
      ui_structure[category_key] = {
        'title': category_meta.get('title', category_key),
        'description': category_meta.get('description', ''),
        'fields': fields_config,
      }

  return ui_structure


def get_enum_values(field_meta: dict[str, Any]) -> list[str] | None:
  if enum_values := field_meta.get('enum'):
    return enum_values

  values = []
  for option in field_meta.get('anyOf', []):
    values.extend(option.get('enum', []))
    if const_value := option.get('const'):
      values.append(const_value)

  return values or None


def get_field_type(field_meta: dict[str, Any]) -> str | None:
  if field_type := field_meta.get('type'):
    return field_type

  option_types = {
    option.get('type') for option in field_meta.get('anyOf', []) if option.get('type') is not None
  }
  if len(option_types) == 1:
    return option_types.pop()

  return None


@router.patch('')
def update_settings(updates: dict[str, Any] = Body(...)):  # noqa: B008
  try:
    settings.save(updates)
  except Exception as exc:
    raise ValidationError(
      'Those settings could not be saved. Check the values and try again.'
    ) from exc
  return get_settings()


@router.post('/model/test')
async def test_model_provider(
  provider: Annotated[ModelProvider, Body()],
  api_key: Annotated[str, Body(alias='apiKey', min_length=1)],
  model: Annotated[str, Body(min_length=1)],
  model_setup_service: Annotated[ModelSetupService, Depends()],
) -> PlainTextResponse:
  try:
    message = await model_setup_service.test_provider(provider, api_key, model)
  except ApplicationError as exc:
    return PlainTextResponse(user_facing_error_message(exc), status_code=400)

  return PlainTextResponse(message)
