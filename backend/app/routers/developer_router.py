import os
import shutil
import sys

from fastapi import APIRouter

from app.config import settings

router = APIRouter(prefix='/dev', tags=['developer'])


@router.post('/seed')
async def seed_demo_data():
  try:
    # Use subprocess to call the seed script
    import subprocess

    # Navigate from app/routers to backend/scripts
    current_dir = os.path.dirname(os.path.abspath(__file__))
    seed_script = os.path.join(current_dir, '..', '..', 'scripts', 'seed', 'run.py')
    result = subprocess.run(
      [sys.executable, seed_script],
      capture_output=True,
      text=True,
    )

    if result.returncode != 0:
      raise Exception(result.stderr) from None
  except Exception as e:
    raise Exception(f'Failed to seed database: {str(e)}') from e


@router.post('/nuke')
async def nuke_database():
  try:
    # Get all the paths to delete
    db_path = settings.config.paths.db_path
    vectors_path = settings.config.paths.vector_path
    profile_path = settings.config.paths.profile_path
    templates_dir = settings.config.paths.templates_dir

    # Delete database
    if os.path.exists(db_path):
      os.remove(db_path)

    # Delete vectors directory
    if os.path.exists(vectors_path):
      shutil.rmtree(vectors_path)

    # Delete profile
    if os.path.exists(profile_path):
      os.remove(profile_path)

    # Delete templates directory
    if os.path.exists(templates_dir):
      shutil.rmtree(templates_dir)

    # Schedule process shutdown after response is sent
    # Using os._exit() to forcefully terminate the process
    import threading

    threading.Timer(0.5, lambda: os._exit(0)).start()
  except Exception as e:
    raise Exception(f'Failed to nuke database: {str(e)}') from e
