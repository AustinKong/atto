#!/usr/bin/env python3
"""
Dev helper to test the TUI locally without building with PyInstaller.

Simulates a frozen environment so the TUI behaves as it would in a bundled exe.

Usage:
    python dev_tui.py
"""

import sys

from modes.tui import main

# Simulate PyInstaller frozen environment
sys.frozen = True  # type: ignore

if __name__ == '__main__':
    main()

# TODO: Remove this file, its for dev only