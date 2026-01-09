import sqlite3
from contextlib import contextmanager
from contextvars import ContextVar

from app.config import settings
from app.utils.errors import ServiceError

_db_ctx: ContextVar[sqlite3.Connection | None] = ContextVar('_db_ctx', default=None)


class DatabaseRepository:
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

  @contextmanager
  def transaction(self):
    """
    Creates a transaction context. Nested calls use the same connection.

    All database operations within the transaction block will be committed
    together or rolled back on error.

    Example:
    ```
    with self.transaction():
      self.execute("INSERT INTO users VALUES (?, ?)", (1, "Alice"))
      # Some logic here
      self.execute("INSERT INTO logs VALUES (?, ?)", (1, "Created user"))
    ```
    """
    token = None
    conn = _db_ctx.get()

    # If no connection exists in this context, create one
    if conn is None:
      conn = sqlite3.connect(settings.paths.db_path)
      conn.row_factory = sqlite3.Row
      token = _db_ctx.set(conn)

    try:
      yield conn
      # Only the "owner" of the connection should commit
      if token:
        conn.commit()
    except Exception:
      if token:
        conn.rollback()
      raise
    finally:
      if token:
        conn.close()
        _db_ctx.reset(token)

  def _get_conn(self):
    """Internal helper to get the active connection or a new one."""
    conn = _db_ctx.get()
    if conn is not None:
      return conn, False  # (connection, is_manual)

    # Fallback for one-off queries outside a transaction() block
    one_off = sqlite3.connect(settings.paths.db_path)
    one_off.row_factory = sqlite3.Row
    return one_off, True

  def fetch_one(self, query: str, params: tuple = ()) -> sqlite3.Row | None:
    """
    Fetch one result from a query.

    Args:
      query: SQL query string.
      params: Query parameters.

    Returns:
      Single row or None.

    Raises:
      ServiceError: If database operation fails.
    """
    conn, is_one_off = self._get_conn()
    try:
      return conn.execute(query, params).fetchone()
    except sqlite3.Error as e:
      raise ServiceError(f'Database fetchone failed: {str(e)}') from e
    finally:
      if is_one_off:
        conn.close()

  def fetch_all(self, query: str, params: tuple = ()) -> list[sqlite3.Row]:
    """
    Fetch all results from a query.

    Args:
      query: SQL query string.
      params: Query parameters.

    Returns:
      List of rows.

    Raises:
      ServiceError: If database operation fails.
    """
    conn, is_one_off = self._get_conn()
    try:
      cursor = conn.execute(query, params)
      return cursor.fetchall()
    except sqlite3.Error as e:
      raise ServiceError(f'Database fetchall failed: {str(e)}') from e
    finally:
      if is_one_off:
        conn.close()

  def execute(self, query: str, params: tuple = ()) -> sqlite3.Cursor:
    """
    Execute a query and return cursor.

    Args:
      query: SQL query string.
      params: Query parameters.

    Returns:
      Cursor with results.

    Raises:
      ServiceError: If database operation fails.
    """
    conn, is_one_off = self._get_conn()
    try:
      cursor = conn.execute(query, params)
      if is_one_off:
        conn.commit()
      return cursor
    except sqlite3.Error as e:
      if is_one_off:
        conn.rollback()
      raise ServiceError(f'Database execute failed: {str(e)}') from e
    finally:
      if is_one_off:
        conn.close()

  def execute_many(self, query: str, params_list: list[tuple]) -> None:
    """
    Execute a query with multiple parameter sets.

    Args:
      query: SQL query string.
      params_list: List of parameter tuples.

    Raises:
      ServiceError: If database operation fails.
    """
    conn, is_one_off = self._get_conn()
    try:
      conn.executemany(query, params_list)
      if is_one_off:
        conn.commit()
    except sqlite3.Error as e:
      if is_one_off:
        conn.rollback()
      raise ServiceError(f'Database executemany failed: {str(e)}') from e
    finally:
      if is_one_off:
        conn.close()
