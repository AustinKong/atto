import os
import sys
from pathlib import Path

import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from playwright.sync_api import sync_playwright

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


if getattr(sys, 'frozen', False):
  base_path = Path(getattr(sys, '_MEIPASS'))  # noqa: B009
  dist_path = base_path / 'frontend' / 'dist'
else:
  dist_path = Path(__file__).parent.parent / 'frontend' / 'dist'

if dist_path.exists():
  app.mount('/assets', StaticFiles(directory=str(dist_path / 'assets')), name='assets')

  @app.get('/{full_path:path}')
  async def serve_ui(full_path: str):
    # Prevent UI from swallowing API 404s
    if full_path.startswith('api'):
      return JSONResponse(status_code=404, content={'detail': 'API Route Not Found'})
    return FileResponse(str(dist_path / 'index.html'))


def install_playwright_browsers():
  try:
    with sync_playwright() as p:
      browser = p.chromium.launch(headless=True)
      browser.close()
  except Exception:
    # Avoid using subprocess.run to install browsers as it breaks in frozen context.
    print('Downloading Chromium... please wait.')
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
