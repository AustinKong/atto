import sys

if __name__ == '__main__':
  # if '--headless' in sys.argv or not sys.stdin.isatty():
  if '--headless' in sys.argv:
    try:
      sys.argv.remove('--headless')
    except ValueError:
      pass

    from modes.headless import main as headless_main

    headless_main()
  else:
    from modes.tui import main as tui_main

    tui_main()
