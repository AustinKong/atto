from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware

from app.exception_handlers import (
  application_error_exception_handler,
  duplicate_error_exception_handler,
  not_found_exception_handler,
  service_error_exception_handler,
)
from app.middleware import exception_logging_middleware
from app.repositories import ResumeRepository
from app.routers import (
  application_router,
  config_router,
  developer_router,
  experience_router,
  listing_router,
  profile_router,
  resume_router,
  template_router,
)
from app.utils.errors import (
  ApplicationError,
  DuplicateError,
  NotFoundError,
  ServiceError,
)


def create_app() -> FastAPI:
  app = FastAPI()

  # Ensure default global resume exists on startup
  @app.on_event('startup')
  async def startup_event():
    # TODO: Why does database seeding run in a different place?
    # Should standardize all startup initialization in one place
    resume_repository = ResumeRepository()
    resume_repository.ensure_default_global_resume_exists()

  app.include_router(application_router, prefix='/api')
  app.include_router(config_router, prefix='/api')
  app.include_router(developer_router, prefix='/api')
  app.include_router(experience_router, prefix='/api')
  app.include_router(listing_router, prefix='/api')
  app.include_router(profile_router, prefix='/api')
  app.include_router(resume_router, prefix='/api')
  app.include_router(template_router, prefix='/api')

  app.add_exception_handler(NotFoundError, not_found_exception_handler)
  app.add_exception_handler(DuplicateError, duplicate_error_exception_handler)
  app.add_exception_handler(ServiceError, service_error_exception_handler)
  app.add_exception_handler(ApplicationError, application_error_exception_handler)

  app.add_middleware(BaseHTTPMiddleware, dispatch=exception_logging_middleware)

  return app
