import asyncio
import os
import socket
import sys
import urllib.error
import urllib.request
import webbrowser
from typing import TypeGuard

from textual import on
from textual.app import App, ComposeResult
from textual.containers import Container, Horizontal
from textual.widgets import Button, RichLog, Static

from app.config import settings

from .server_manager import ServerManager

HOST = '127.0.0.1'
DEFAULT_DEV_PORT = 8000
HEALTH_TIMEOUT_SECONDS = 180
PORT_MIN = 1024
PORT_MAX = 65535

LOGO = r"""
   /$$$$$$    /$$     /$$              
  /$$__  $$  | $$    | $$              
 | $$  \ $$ /$$$$$$ /$$$$$$    /$$$$$$ 
 | $$$$$$$$|_  $$_/|_  $$_/   /$$__  $$
 | $$__  $$  | $$    | $$    | $$  \ $$
 | $$  | $$  | $$ /$$| $$ /$$| $$  | $$
 | $$  | $$  |  $$$$/|  $$$$/|  $$$$$$/
 |__/  |__/   \___/   \___/   \______/ 
"""


def is_port_valid_and_available(port: int | None) -> TypeGuard[int]:
  if port is None or port < PORT_MIN or port > PORT_MAX:
    return False

  try:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
      sock.settimeout(0.2)
      return sock.connect_ex((HOST, port)) != 0
  except OSError:
    return True

  return False


class ConsoleApp(App):
  CSS = """
    Screen { 
      layout: vertical; 
    }

    Screen > * {
      width: 100%;
      height: auto;
    }

    #logo {
      background: $surface;
      text-align: center;
      overflow: hidden;
    }

    #disclaimer {
      background: $error;
      padding: 1;
      color: $text;
      text-align: center;
    }

    #log-section {
      height: 1fr;
      border: solid $secondary;
    }

    #log-widget {
      height: 1fr;
    }

    #button-section {
      background: $panel;
    }

    Button {
      margin: 0 1;
      width: 1fr;
    }
    """

  def __init__(self, **kwargs):
    super().__init__(**kwargs)
    self.server: ServerManager | None = None
    self.server_url = f'http://{HOST}:{DEFAULT_DEV_PORT}'

  def on_line(self, line: str) -> None:
    self.log_widget.write(line)

  async def on_mount(self) -> None:
    await self.start_server(open_browser=True)

  def compose(self) -> ComposeResult:
    yield Static(LOGO, id='logo')

    self.disclaimer = Static('', id='disclaimer')
    yield self.disclaimer

    with Container(id='log-section'):
      self.log_widget = RichLog(highlight=True, markup=False, id='log-widget')
      yield self.log_widget

    with Horizontal(id='button-section'):
      yield Button('Export Logs', id='export_logs', variant='primary')
      yield Button('Open App', id='open_app', variant='success')
      yield Button('GitHub', id='github', variant='default')
      yield Button('Quit', id='quit', variant='error')

  def resolve_port(self) -> int:
    if not getattr(sys, 'frozen', False):
      return DEFAULT_DEV_PORT

    remembered_port = settings.launcher.port
    if is_port_valid_and_available(remembered_port):
      return remembered_port

    # binds to free port
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
      sock.bind((HOST, 0))
      port = sock.getsockname()[1]

    settings.save({'launcher': {'port': port}})
    return port

  def create_server(self, port: int) -> ServerManager:
    # Spawn the server subprocess via headless script.
    # Use environment variables because in frozen context, sys.argv is not reliable.
    env = os.environ.copy()
    env['ATTO_HEADLESS'] = '1'
    env['ATTO_HOST'] = HOST
    env['ATTO_PORT'] = str(port)

    command = [sys.executable]
    if not getattr(sys, 'frozen', False):
      command = [sys.executable, '-m', 'app.run']

    return ServerManager(
      command=command,
      env=env,
      on_line=self.on_line,
    )

  async def start_server(self, open_browser: bool) -> None:
    port = self.resolve_port()
    self.server_url = f'http://{HOST}:{port}'
    self.disclaimer.update(f'Do not close this window. Access the app at: {self.server_url}')

    self.server = self.create_server(port)

    try:
      await self.server.start()
    except OSError as error:
      self.log_widget.write(f'Failed to start server: {error}')
      return

    if await self.wait_for_health():
      if open_browser:
        webbrowser.open(self.server_url)
      return

    await self.server.stop(timeout=1.0)
    self.log_widget.write('Server failed to become ready. Quit and reopen Atto to try again.')

  async def wait_for_health(self) -> bool:
    deadline = asyncio.get_running_loop().time() + HEALTH_TIMEOUT_SECONDS
    health_url = f'{self.server_url}/api/health'

    while asyncio.get_running_loop().time() < deadline:
      if self.server and self.server.returncode is not None:
        return False

      if await asyncio.to_thread(self.is_healthy, health_url):
        return True

      await asyncio.sleep(0.25)

    return False

  def is_healthy(self, health_url: str) -> bool:
    try:
      with urllib.request.urlopen(health_url, timeout=1.0) as response:
        return response.status == 200
    except (OSError, urllib.error.URLError):
      return False

  # Actions
  @on(Button.Pressed, '#export_logs')
  def export_logs(self):
    import json
    from pathlib import Path

    timestamp = __import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')
    export_path = Path.home() / f'atto_logs_{timestamp}.json'
    logs = self.server.get_logs() if self.server else []

    with open(export_path, 'w') as f:
      json.dump({'logs': logs, 'timestamp': timestamp}, f, indent=2)

  @on(Button.Pressed, '#open_app')
  def action_open_app(self) -> None:
    webbrowser.open(self.server_url)

  @on(Button.Pressed, '#github')
  def action_open_github(self) -> None:
    webbrowser.open('https://github.com/AustinKong/atto')

  @on(Button.Pressed, '#quit')
  async def action_quit(self) -> None:
    if self.server and self.server.running:
      await self.server.stop()

    self.exit()


def main():
  app = ConsoleApp()
  app.run()
