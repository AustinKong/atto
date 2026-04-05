FROM python:3.11-slim

WORKDIR /app

ENV PYTHONPATH=/app

# Install build deps for asyncpg / cryptography
RUN apt-get update && apt-get install -y --no-install-recommends \
  gcc libpq-dev \
  && rm -rf /var/lib/apt/lists/*

COPY cloud/pyproject.toml ./cloud/pyproject.toml
COPY cloud/app/ ./cloud/app/
COPY cloud/run.py ./cloud/run.py
COPY shared/ ./shared/

RUN pip install --no-cache-dir -e ./cloud

CMD ["python", "cloud/run.py"]
