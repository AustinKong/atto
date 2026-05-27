from .application_router import router as application_router
from .config_router import router as config_router
from .dashboard_router import router as dashboard_router
from .listing_router import router as listing_router
from .paper_mode_router import router as paper_mode_router
from .profile_router import router as profile_router
from .resume_router import router as resume_router
from .template_router import router as template_router

__all__ = [
  'application_router',
  'config_router',
  'dashboard_router',
  'listing_router',
  'paper_mode_router',
  'profile_router',
  'resume_router',
  'template_router',
]
