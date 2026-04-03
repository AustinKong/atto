# -*- mode: python ; coding: utf-8 -*-

from importlib.metadata import distribution


def _mypyc_hiddenimports(dist_name):
    # Some wheels (e.g. chardet) expose mypyc extension modules with hashed names
    # like "<hash>__mypyc", imported dynamically at runtime.
    try:
        dist = distribution(dist_name)
    except Exception:
        return []

    return [
        entry.name.split('.')[0]
        for entry in (dist.files or [])
        if '__mypyc' in entry.name and entry.name.endswith('.so')
    ]


a = Analysis(
    ['backend/run.py'],
    pathex=[],
    binaries=[],
    datas=[('frontend/dist', 'frontend/dist')],
    hiddenimports=_mypyc_hiddenimports('chardet'),
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='Atto',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
