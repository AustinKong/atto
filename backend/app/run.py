import os
import sys
from pathlib import Path

import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db_init import create_tables
from app.main import create_app

app = create_app()

app.add_middleware(
  CORSMiddleware,
  allow_origins=['http://localhost:5173'],
  allow_credentials=True,
  allow_methods=['*'],
  allow_headers=['*'],
)


@app.get('/api/health')
async def health() -> dict[str, str]:
  return {'status': 'ok'}


def _resolve_frontend_dist_path() -> Path | None:
  if getattr(sys, 'frozen', False):
    base_path = Path(getattr(sys, '_MEIPASS'))  # noqa: B009
    frozen_dist_path = base_path / 'frontend' / 'dist'
    return frozen_dist_path if frozen_dist_path.exists() else None

  backend_local_dist_path = Path(__file__).parent.parent / 'frontend' / 'dist'
  repo_root_dist_path = Path(__file__).parents[2] / 'frontend' / 'dist'
  installed_package_dist_path = Path(__file__).parent / 'frontend_dist'

  for candidate in [backend_local_dist_path, repo_root_dist_path, installed_package_dist_path]:
    if candidate.exists():
      return candidate

  return None


dist_path = _resolve_frontend_dist_path()

if dist_path and (dist_path / 'assets').exists():
  app.mount('/assets', StaticFiles(directory=str(dist_path / 'assets')), name='assets')

if dist_path:
  @app.get('/{full_path:path}')
  async def serve_ui(full_path: str):
    # Prevent UI from swallowing API 404s
    if full_path.startswith('api'):
      return JSONResponse(status_code=404, content={'detail': 'API Route Not Found'})

    # Resolve static files (images etc.)
    requested_path = (dist_path / full_path).resolve()
    if requested_path.is_file() and requested_path.is_relative_to(dist_path.resolve()):
      return FileResponse(str(requested_path))

    return FileResponse(str(dist_path / 'index.html'))


def install_playwright_browsers():
  browsers_path = Path(settings.active_paths.playwright_browsers_path)
  browsers_path.mkdir(parents=True, exist_ok=True)
  os.environ['PLAYWRIGHT_BROWSERS_PATH'] = str(browsers_path)

  try:
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
      browser = p.chromium.launch(headless=True)
      browser.close()
  except Exception:
    # Avoid using subprocess.run to install browsers as it breaks in frozen context.
    print(f'Downloading Chromium to {browsers_path}... please wait.')
    from playwright.__main__ import main as playwright_main

    original_argv = sys.argv
    try:
      sys.argv = ['playwright', 'install', 'chromium']
      try:
        playwright_main()
      except SystemExit as exc:
        if exc.code not in (0, None):
          print(
            'Failed to download Chromium. Browser-backed features may be unavailable '
            'until Playwright browsers are installed.'
          )
    finally:
      sys.argv = original_argv


def main():
  host = os.environ.get('ATTO_HOST', '127.0.0.1')
  port = int(os.environ.get('ATTO_PORT', '8000'))

  install_playwright_browsers()
  create_tables()

  frozen = getattr(sys, 'frozen', False)

  uvicorn_config = {
    'app': 'app.run:app',
    'host': host,
    'port': port,
    'log_level': 'info',
    'reload': not frozen,
    'reload_dirs': [str(Path(__file__).parent)],
  }

  uvicorn.run(**uvicorn_config)
