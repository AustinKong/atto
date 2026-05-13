import hashlib
import json
from typing import Any


def sha256_hex(value: str) -> str:
  return hashlib.sha256(value.encode('utf-8')).hexdigest()


def hash_trimmed_text(value: str) -> str:
  return sha256_hex(value.strip())


def hash_json_value(value: Any) -> str:
  payload = json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
  return sha256_hex(payload)
