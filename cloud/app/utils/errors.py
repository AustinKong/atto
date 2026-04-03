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
