import os
import sys

from textual import on
from textual.app import App, ComposeResult
from textual.containers import Container, Horizontal
from textual.widgets import Button, RichLog, Static

from .server_manager import ServerManager

LOGO = r"""
        @@@@                                                
        @@@@                                                
@@@@@@  @@@@  @@@@@@    /$$$$$$    /$$     /$$              
@@@@@@@@@@@@@@@@@@@@   /$$__  $$  | $$    | $$              
   @@@@@@@@@@@@@@     | $$  \ $$ /$$$$$$ /$$$$$$    /$$$$$$ 
      @@@@@@@@        | $$$$$$$$|_  $$_/|_  $$_/   /$$__  $$
     @@@@@@@@@@       | $$__  $$  | $$    | $$    | $$  \ $$
   @@@@@@  @@@@@@     | $$  | $$  | $$ /$$| $$ /$$| $$  | $$
   @@@@@    @@@@@     | $$  | $$  |  $$$$/|  $$$$/|  $$$$$$/
     @        @       |__/  |__/   \___/   \___/   \______/ 
"""


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
    # Spawn the server subprocess via headless script.
    # Use environment variable instead of argv because in frozen context, sys.argv is no reliable.
    env = os.environ.copy()
    env['ATTO_HEADLESS'] = '1'

    self.server = ServerManager(
      command=[sys.executable],
      env=env,
      on_line=self.on_line,
      on_exit=self.on_server_exit,
    )

  def on_line(self, line: str) -> None:
    self.log_widget.write(line)

  def on_server_exit(self, return_code: int) -> None:
    if return_code != 0:
      self.restart_button.disabled = False

  async def on_mount(self) -> None:
    try:
      await self.server.start()
    except OSError:
      pass

  def compose(self) -> ComposeResult:
    yield Static(LOGO, id='logo')

    yield Static(
      '⚠️ Do not close this window!  |  🌐 Access the app at: http://127.0.0.1:8000', id='disclaimer'
    )

    with Container(id='log-section'):
      self.log_widget = RichLog(highlight=True, markup=False, id='log-widget')
      yield self.log_widget

    with Horizontal(id='button-section'):
      yield Button('Export Logs', id='export_logs', variant='primary')
      self.restart_button = Button('Restart Server', id='restart_server', variant='warning')
      self.restart_button.disabled = True
      yield self.restart_button
      yield Button('GitHub', id='github', variant='default')
      yield Button('Quit', id='quit', variant='error')

  # Actions
  @on(Button.Pressed, '#export_logs')
  def export_logs(self):
    import json
    from pathlib import Path

    logs = self.server.get_logs()
    timestamp = __import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')
    export_path = Path.home() / f'atto_logs_{timestamp}.json'

    with open(export_path, 'w') as f:
      json.dump({'logs': logs, 'timestamp': timestamp}, f, indent=2)

  @on(Button.Pressed, '#restart_server')
  async def action_restart_server(self) -> None:
    try:
      await self.server.start()
      self.restart_button.disabled = True
    except OSError:
      pass

  @on(Button.Pressed, '#github')
  def action_open_github(self) -> None:
    import webbrowser

    webbrowser.open('https://github.com/AustinKong/atto')

  @on(Button.Pressed, '#quit')
  async def action_quit(self) -> None:
    if self.server.running:
      await self.server.stop()

    self.exit()


def main():
  # IMPORTANT: TUI is only for bundled executables (PyInstaller).
  app = ConsoleApp()
  app.run()
