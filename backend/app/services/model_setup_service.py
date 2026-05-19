import httpx
from fastapi import HTTPException, status
from google import genai
from google.genai import errors as gemini_errors
from openai import (
  APIConnectionError,
  AsyncOpenAI,
  AuthenticationError,
  BadRequestError,
  PermissionDeniedError,
  RateLimitError,
)
from openai import (
  NotFoundError as OpenAINotFoundError,
)

from app.config.schemas import ModelProvider

TEST_PROMPT = 'Reply with exactly: ok'
TEST_MAX_OUTPUT_TOKENS = 16


class ModelSetupService:
  async def test_provider(
    self,
    provider: ModelProvider,
    api_key: str,
    model: str,
  ) -> str:
    if provider == 'gemini':
      return await self._test_gemini(api_key, model)

    return await self._test_openai(api_key, model)

  async def _test_openai(self, api_key: str, model: str) -> str:
    client = AsyncOpenAI(api_key=api_key, timeout=20.0, max_retries=0)

    try:
      await client.responses.create(
        model=model,
        input=TEST_PROMPT,
        max_output_tokens=TEST_MAX_OUTPUT_TOKENS,
        store=False,
      )
      return 'OpenAI responded successfully.'
    except AuthenticationError:
      raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=(
          'OpenAI rejected that API key. Check that it was copied correctly and has not '
          'been revoked.'
        ),
      ) from None
    except PermissionDeniedError:
      raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=(
          'OpenAI accepted the key, but this project does not have access to the selected '
          'model. Try the default model or check the project permissions.'
        ),
      ) from None
    except OpenAINotFoundError:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=(
          'OpenAI could not find that model for this key. Try the default model, or choose a '
          'model available to your OpenAI project.'
        ),
      ) from None
    except RateLimitError:
      raise HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=(
          'OpenAI reported a rate limit or quota issue. Check billing, usage limits, and '
          'project quotas.'
        ),
      ) from None
    except BadRequestError:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail='OpenAI rejected the test request. Try a different model or check project settings.',
      ) from None
    except APIConnectionError:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail='Atto could not reach OpenAI. Check your internet connection or firewall settings.',
      ) from None
    except Exception:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail='OpenAI returned an unknown error. Try again later.',
      ) from None

  async def _test_gemini(self, api_key: str, model: str) -> str:
    client = genai.Client(api_key=api_key)

    try:
      await client.aio.models.generate_content(
        model=model,
        contents=TEST_PROMPT,
        config={'temperature': 0, 'max_output_tokens': TEST_MAX_OUTPUT_TOKENS},
      )
      return 'Gemini responded successfully.'
    except gemini_errors.APIError as exc:
      if exc.code == 401:
        raise HTTPException(
          status_code=status.HTTP_401_UNAUTHORIZED,
          detail='Gemini rejected that API key. Check that it was copied correctly and is enabled.',
        ) from None
      if exc.code == 403:
        raise HTTPException(
          status_code=status.HTTP_403_FORBIDDEN,
          detail=(
            'Gemini accepted the key, but it does not have access to the selected model or '
            'API. Check Google AI Studio permissions and API restrictions.'
          ),
        ) from None
      if exc.code == 404:
        raise HTTPException(
          status_code=status.HTTP_400_BAD_REQUEST,
          detail=(
            'Gemini could not find that model for this key. Try the default model, or choose a '
            'model available in your region.'
          ),
        ) from None
      if exc.code == 429:
        raise HTTPException(
          status_code=status.HTTP_429_TOO_MANY_REQUESTS,
          detail=(
            'Gemini reported a rate limit or quota issue. Check billing, usage limits, and '
            'project quotas.'
          ),
        ) from None
      if 400 <= exc.code < 500:
        raise HTTPException(
          status_code=status.HTTP_400_BAD_REQUEST,
          detail=(
            'Gemini rejected the test request. Try a different model or check API restrictions.'
          ),
        ) from None

      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail='Gemini returned an unknown error. Try again later.',
      ) from None
    except httpx.HTTPError:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail='Atto could not reach Gemini. Check your internet connection or firewall settings.',
      ) from None
    except Exception:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail='Gemini returned an unknown error. Try again later.',
      ) from None
