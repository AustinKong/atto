import hashlib


def compute_git_blob_sha(content_bytes: bytes) -> str:
  """Compute Git blob SHA1 for content (matches GitHub's file sha)."""
  header = b'blob ' + str(len(content_bytes)).encode('ascii') + b'\0'
  h = hashlib.sha1()
  h.update(header)
  h.update(content_bytes)
  return h.hexdigest()
