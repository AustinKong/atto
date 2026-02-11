import asyncio
import signal
from collections import deque
from collections.abc import Callable


class ServerManager:
  """Manage a server subprocess with async start/stop and output capture."""
  def __init__(
    self,
    command: list[str],
    on_line: Callable[[str], None] | None = None,
    log_buffer_size: int = 500,
  ):
    """
    Initialize the server manager.

    Args:
      command: List of command and args (e.g., ["uvicorn", "app.main:app", ...]).
      on_line: Optional callback(line) invoked for each captured output line.
      log_buffer_size: Max lines to keep in ring buffer (prevents unbounded memory).
    """
    self.command = command
    self.on_line = on_line
    self.log_buffer = deque(maxlen=log_buffer_size)
    self.proc: asyncio.subprocess.Process | None = None
    self._read_task: asyncio.Task | None = None

  @property
  def running(self) -> bool:
    return self.proc is not None and self.proc.returncode is None

  @property
  def returncode(self) -> int | None:
    return self.proc.returncode if self.proc else None

  async def start(self) -> bool:
    if self.running:
      return False

    self.proc = await asyncio.create_subprocess_exec(
      *self.command,
      stdout=asyncio.subprocess.PIPE,
      stderr=asyncio.subprocess.PIPE
    )
    self._read_task = asyncio.create_task(self._read_output_loop())

    return True

  async def stop(self, timeout: float = 5.0) -> bool:
    if not self.proc:
      return False

    try:
      self.proc.send_signal(signal.SIGINT)
      await asyncio.wait_for(self.proc.wait(), timeout=timeout)
    except TimeoutError:
      self.proc.kill()
      await self.proc.wait()
    except ProcessLookupError:
      # Process already exited
      pass
    finally:
      self.proc = None

      if self._read_task:
        self._read_task.cancel()

        try:
          await self._read_task
        except asyncio.CancelledError:
          pass

        self._read_task = None

    return True

  async def _read_stream(self, stream: asyncio.StreamReader, prefix: str) -> None:
    """Read lines from a stream and emit via on_line callback."""
    try:
      while True:
        line = await stream.readline()

        if not line:
          break

        text = line.decode(errors='ignore').rstrip()
        self.log_buffer.append(text)

        if self.on_line:
          self.on_line(text)
    except asyncio.CancelledError:
      return

  async def _read_output_loop(self) -> None:
    """Concurrently read stdout and stderr until stream ends."""
    try:
      assert self.proc is not None
      assert self.proc.stdout is not None
      assert self.proc.stderr is not None

      await asyncio.gather(
        self._read_stream(self.proc.stdout, ''),
        self._read_stream(self.proc.stderr, ''),
      )
    except asyncio.CancelledError:
      return
    finally:
      if self.proc and self.proc.returncode is None:
        await self.proc.wait()

  def get_logs(self) -> list[str]:
    return list(self.log_buffer)
