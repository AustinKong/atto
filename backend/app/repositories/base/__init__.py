from .database_repository import DatabaseRepository
from .file_repository import FileRepository
from .json_repository import JSONRepository
from .vector_repository import VectorRepository

# TODO: We could move repositories/base/*_repository.py to clients/data_access/*_client.py
# and use DI of db_repository = Annotated[DatabaseRepository, Depends(get_db_repository)]
# to maintain parity with cloud codebase. This could also allow us to share connections
# between requests (by adding the db in request.app.state)
__all__ = [
  'DatabaseRepository',
  'FileRepository',
  'JSONRepository',
  'VectorRepository',
]
