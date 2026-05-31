from app.repositories import ApplicationRepository


class FakeApplicationRepository(ApplicationRepository):
  def __init__(self) -> None:
    pass
