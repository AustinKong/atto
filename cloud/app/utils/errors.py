# TODO: NGL these errors are pretty useless. they are too specific
# Each error should encapsulate one type of error code basically
# Also, should jut move error classes into shared package

class CloudError(Exception):
  pass


class AuthError(CloudError):
  pass


class TokenBudgetExceededError(CloudError):
  pass


class ProviderError(CloudError):
  pass


class UserNotFoundError(CloudError):
  pass
