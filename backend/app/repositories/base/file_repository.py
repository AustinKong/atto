from itertools import count
from pathlib import Path

from app.utils.errors import NotFoundError, ServiceError


class FileRepository:
  def _ensure_directory(self, filepath: Path) -> None:
    filepath.parent.mkdir(parents=True, exist_ok=True)

  def read_text(self, filepath: Path) -> str:
    """
    Reads raw text from a file.

    Args:
      filepath: Full path to the file.

    Returns:
      The content of the file as a string.

    Raises:
      NotFoundError: If the file does not exist.
      ServiceError: If reading the file fails.
    """
    if not filepath.exists():
      raise NotFoundError(f'File {filepath} not found')

    try:
      return filepath.read_text(encoding='utf-8')
    except Exception as e:
      raise ServiceError(f'Failed to read file {filepath}: {str(e)}') from e

  def read_bytes(self, filepath: Path) -> bytes:
    """
    Reads raw bytes from a file.

    Args:
      filepath: Full path to the file.

    Returns:
      The content of the file as bytes.

    Raises:
      NotFoundError: If the file does not exist.
      ServiceError: If reading the file fails.
    """
    if not filepath.exists():
      raise NotFoundError(f'File {filepath} not found')

    try:
      return filepath.read_bytes()
    except Exception as e:
      raise ServiceError(f'Failed to read file {filepath}: {str(e)}') from e

  def write_text(self, filepath: Path, content: str, dedup: bool = False) -> Path:
    """
    Writes raw text to a file and returns the filepath.

    Args:
      filepath: Full path to the file.
      content: The text content to write.
      dedup: Whether to deduplicate existing files.

    Returns:
      The filepath of the written file.

    Raises:
      ServiceError: If writing the file fails.
    """
    try:
      self._ensure_directory(filepath)

      # Add suffix -N (e.g. file-1.txt, file-2.txt) until available filename found
      target_path = filepath
      if dedup and target_path.exists():
        for counter in count(1):
          candidate = filepath.with_name(f'{target_path.stem}-{counter}{target_path.suffix}')
          if not candidate.exists():
            target_path = candidate
            break

      target_path.write_text(content, encoding='utf-8')
      return target_path
    except Exception as e:
      raise ServiceError(f'Failed to write file {filepath}: {str(e)}') from e

  def delete(self, filepath: Path) -> None:
    """
    Deletes a file if it exists.

    Args:
      filepath: Full path to the file.

    Raises:
      ServiceError: If deleting the file fails.
    """
    try:
      if filepath.exists():
        filepath.unlink()
    except Exception as e:
      raise ServiceError(f'Failed to delete file {filepath}: {str(e)}') from e

  def list_directory(self, dirpath: Path, file_extensions: list[str] | None = None) -> list[Path]:
    """
    Lists all files in a directory, optionally filtered by extension.

    Args:
      dirpath: Path to the directory to list.
      file_extensions: Optional list of file extensions to filter by (e.g.,
        ['.html', '.htm']). If None, all files are included. Extensions should
        include the leading dot and be lowercase.

    Returns:
      A sorted list of Path objects for files matching the criteria. Returns an
      empty list if the directory doesn't exist.

    Raises:
      ServiceError: If listing the directory fails.
    """
    if not dirpath.exists() or not dirpath.is_dir():
      return []

    try:
      files: list[Path] = []
      for p in dirpath.iterdir():
        if p.is_file():
          if file_extensions is None or p.suffix.lower() in file_extensions:
            files.append(p)
      files.sort()
      return files
    except Exception as e:
      raise ServiceError(f'Failed to list directory {dirpath}: {str(e)}') from e
