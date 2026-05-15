import os
import shutil

from fastapi import APIRouter

from app.config import settings

router = APIRouter(prefix='/dev', tags=['developer'])


@router.post('/nuke')
async def nuke_database():
  try:
    active_paths = settings.active_paths

    # Get all the paths to delete
    db_path = active_paths.db_path
    vectors_path = active_paths.vector_path
    profile_path = active_paths.profile_path
    templates_dir = active_paths.templates_dir

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
