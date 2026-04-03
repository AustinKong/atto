import os

import uvicorn

if __name__ == '__main__':
  dev = os.getenv('ENV', 'production') == 'development'
  uvicorn.run('app.main:create_app', factory=True, host='0.0.0.0', port=8001, reload=dev)
