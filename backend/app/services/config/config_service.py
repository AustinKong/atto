import re
from pathlib import Path

import yaml
from dotenv import dotenv_values, load_dotenv

from app.utils.structure import assign_path, deep_merge, flatten_structure

from .schemas import (
  AppConfig,
  get_data_dir,
)


class ConfigService:
  def __init__(self, data_dir: Path | None = None):
    self.data_dir = data_dir or get_data_dir()
    self.user_config_path = self.data_dir / 'config.user.yaml'
    self.env_path = self.data_dir / '.env'

    self.data_dir.mkdir(parents=True, exist_ok=True)
    if not self.user_config_path.exists():
      self.user_config_path.touch()
    if not self.env_path.exists():
      self.env_path.touch()

  @property
  def settings(self) -> AppConfig:
    return AppConfig(**deep_merge(self._read_yaml(), self._read_env()))

  def save(self, updates: dict) -> None:
    yaml_updates: dict = {}
    env_updates: dict = {}

    exposure_map = self._build_exposure_map()
    for path, value in flatten_structure(updates).items():
      if exposure_map.get(path) == 'secret':
        assign_path(env_updates, path, value)
      else:
        assign_path(yaml_updates, path, value)

    current = self.settings.model_dump()
    merged = deep_merge(deep_merge(current, yaml_updates), env_updates)
    AppConfig.model_validate(merged)

    if yaml_updates:
      self._write_yaml(yaml_updates)
    if env_updates:
      self._write_env(env_updates)

  def _read_yaml(self) -> dict:
    content = yaml.safe_load(self.user_config_path.read_text())
    return content if isinstance(content, dict) else {}

  def _read_env(self) -> dict:
    load_dotenv(self.env_path, override=True)
    env_values = dotenv_values(self.env_path)
    result: dict = {}

    for path, exposure in self._build_exposure_map().items():
      if exposure != 'secret':
        continue
      env_key = '__'.join(path).upper()
      # Prefer values from the config .env file to avoid stale process-level values.
      env_val = env_values.get(env_key)
      if env_val is not None:
        assign_path(result, path, env_val)

    return result

  def _write_yaml(self, updates: dict) -> None:
    current = self._read_yaml()
    merged = deep_merge(current, updates)
    self.user_config_path.write_text(yaml.dump(merged, sort_keys=False))

  def _write_env(self, updates: dict) -> None:
    content = self.env_path.read_text()
    for path, value in flatten_structure(updates).items():
      key = '__'.join(path).upper()
      pattern = rf'^{key}\s*=.*'
      replacement = f'{key}={value}'
      if re.search(pattern, content, re.MULTILINE):
        content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
      else:
        content = content.rstrip('\n') + f'\n{replacement}\n' if content else f'{replacement}\n'
    self.env_path.write_text(content)

  def _build_exposure_map(self) -> dict[tuple[str, ...], str]:
    mapping: dict[tuple[str, ...], str] = {}
    stack: list[tuple[type, tuple[str, ...]]] = [(AppConfig, ())]

    while stack:
      model, prefix = stack.pop()

      for name, field in model.model_fields.items():
        path = prefix + (name,)
        annotation = field.annotation

        if annotation and hasattr(annotation, 'model_fields'):
          stack.append((annotation, path))
        else:
          extra = field.json_schema_extra or {}
          mapping[path] = extra.get('exposure', 'normal')

    return mapping
