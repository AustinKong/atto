import sys

from textual.app import App, ComposeResult
from textual.containers import Container, Horizontal
from textual.widgets import Button, RichLog, Static

from .server_manager import ServerManager

# TODO: Clean up this file

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
  """
  Textual UI for the Atto backend console.

  Manages the server subprocess via ServerManager and presents a user-friendly
  interface with warnings, status info, logs, and control buttons.
  """

  CSS = """
    Screen {
        layout: vertical;
    }

    #logo {
        height: auto;
        padding: 1;
        background: $surface;
        text-align: center;
        border-bottom: solid $primary;
        width: 100%;
        overflow: hidden;
    }

    #disclaimer {
        height: auto;
        padding: 1;
        background: $error;
        color: $text;
        text-align: center;
        border-bottom: solid $accent;
        width: 100%;
        overflow: hidden;
    }

    #frontend-banner {
        height: auto;
        padding: 1;
        background: $boost;
        color: $text;
        text-align: center;
        border-bottom: solid $primary;
        width: 100%;
        overflow: hidden;
    }

    #log-section {
        height: 1fr;
        border: solid $secondary;
        padding: 0;
        margin: 1;
    }

    #log-widget {
        height: 1fr;
    }

    #button-section {
        height: auto;
        padding: 1;
        background: $panel;
        border-top: solid $accent;
    }

    Button {
        margin: 0 1;
        width: 1fr;
    }
    """

  TITLE = 'Atto Backend Console'
  BINDINGS = [('q', 'quit', 'Quit')]

  def __init__(self, **kwargs):
    super().__init__(**kwargs)
    # Spawn the server via python -m app.run with --run-server flag
    cmd = [sys.executable, '-m', 'app.run', '--run-server']
    self.server = ServerManager(command=cmd, on_line=self._on_server_line)

  async def on_mount(self) -> None:
    """Start the server automatically when the app mounts."""
    try:
      await self.server.start()
      self._refresh_server_status()
      self._append_log('[Console] Server started automatically.')
      # Set up periodic status updates (every 2 seconds)
      self._start_status_polling()
    except OSError as e:
      self._refresh_server_status()
      self._append_log(f'[Console Error] Failed to start server: {e}')

  def _start_status_polling(self) -> None:
    """Start periodic server status polling. Alert if server stops unexpectedly."""
    import asyncio
    
    async def poll():
      server_crashed = False
      while True:
        if not self.server.running and not server_crashed:
          # Server stopped unexpectedly
          server_crashed = True
          self.restart_button.disabled = False
          self._append_log('')
          self._append_log('[Console ERROR] ⚠️  Server has stopped unexpectedly!')
          self._append_log('[Console ERROR] Please export logs and quit the console.')
          self._append_log('')
        await asyncio.sleep(2.0)
    
    asyncio.create_task(poll())

  def compose(self) -> ComposeResult:
    # Logo at the top
    yield Static(LOGO, id='logo')

    # Disclaimer
    yield Static('⚠️  Do not close this window!', id='disclaimer')

    # Frontend banner
    yield Static('🌐 Access the app at: http://localhost:3000', id='frontend-banner')

    # Logs section
    with Container(id='log-section'):
      self.log_widget = RichLog(highlight=False, markup=False, id='log-widget')
      yield self.log_widget

    # Button controls at bottom
    with Horizontal(id='button-section'):
      yield Button('Export Logs', id='export_logs', variant='primary')
      self.restart_button = Button('Restart Server', id='restart_server', variant='warning')
      self.restart_button.disabled = True
      yield self.restart_button
      yield Button('GitHub', id='github', variant='default')
      yield Button('Quit', id='quit_btn', variant='error')

  async def on_button_pressed(self, event) -> None:
    """Handle button presses."""
    btn_id = event.button.id
    if btn_id == 'export_logs':
      self._action_export_logs()
    elif btn_id == 'restart_server':
      await self._action_restart_server()
    elif btn_id == 'github':
      self._action_open_github()
    elif btn_id == 'quit_btn':
      await self.action_quit()

  def _refresh_server_status(self) -> None:
    """Update the status display with actual server status."""
  def _action_export_logs(self) -> None:
    """Export logs to a file."""
    import json
    from pathlib import Path
    
    logs = self.server.get_logs()
    timestamp = __import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')
    export_path = Path.home() / f'atto_logs_{timestamp}.json'
    
    with open(export_path, 'w') as f:
      json.dump({'logs': logs, 'timestamp': timestamp}, f, indent=2)
    
    self._append_log(f'[Console] Logs exported to {export_path}')

  async def _action_restart_server(self) -> None:
    """Restart the server if it crashed."""
    try:
      self._append_log('[Console] Attempting to restart server...')
      await self.server.start()
      self.restart_button.disabled = True
      self._append_log('[Console] Server restarted successfully.')
    except OSError as e:
      self._append_log(f'[Console Error] Failed to restart server: {e}')

  def _action_open_github(self) -> None:
    """Open GitHub repository in browser."""
    import webbrowser
    webbrowser.open('https://github.com/AustinKong/atto')
    self._append_log('[Console] Opening GitHub repository...')

  def _append_log(self, line: str) -> None:
    """Append a line to the log widget (safe from async context)."""
    self.log_widget.write(line)

  def _on_server_line(self, line: str) -> None:
    """Callback invoked by ServerManager when server outputs a line."""
    # Schedule UI update from async callback
    self.log_widget.write(line)

  async def action_quit(self) -> None:
    """Gracefully shutdown: stop server, then exit app."""
    if self.server.running:
      self._append_log('[Console] Stopping server...')
      await self.server.stop()
    self.exit()


def main():
  # IMPORTANT: TUI is only for bundled executables (PyInstaller).
  app = ConsoleApp()
  app.run()
