# OpenAI setup

Use this guide if you want Atto to use OpenAI for AI features. You only need an
OpenAI API key. This is different from a ChatGPT login or a ChatGPT Plus
subscription.

# Create an API key

Open the OpenAI API keys page:
[platform.openai.com/api-keys](https://platform.openai.com/api-keys)

![OpenAI API keys page][openai-api-key-page]

Sign in, or create an OpenAI account if you do not have one yet. If OpenAI asks
you to choose a project, use an existing project or create a new one for Atto.

![OpenAI API keys page with Create new secret key highlighted][openai-create-api-key]

Click **Create new secret key**.

![OpenAI create secret key dialog][openai-create-secret-key]

Give the key a simple name, such as `Atto`. If OpenAI asks for permissions, keep
the default unless you already know your account needs stricter controls.

![OpenAI generated secret key page with copy button highlighted][openai-copy-secret-key]

Copy the key as soon as OpenAI shows it. OpenAI only shows the full secret key
once. If you close the window before copying it, create a new key and use the new
one.

# Check billing

Open the OpenAI billing overview:
[platform.openai.com/settings/organization/billing/overview][openai-billing]

![OpenAI billing page with credit recharge option][openai-credit-recharge]

Make sure your OpenAI account can use the API. Depending on your account, OpenAI
may ask you to set up billing, add credits, or review usage limits before API
requests work.

If the page says billing is not set up, follow OpenAI's prompts to add a payment
method or credits. If billing is already active, you can return to Atto and use
the API key you copied.

[openai-api-key-page]: ../../.github/assets/setup/openai/api-key-page.png
[openai-create-api-key]: ../../.github/assets/setup/openai/create-api-key.png
[openai-create-secret-key]: ../../.github/assets/setup/openai/create-secret-key.png
[openai-copy-secret-key]: ../../.github/assets/setup/openai/copy-secret-key.png
[openai-credit-recharge]: ../../.github/assets/setup/openai/credit-recharge.png
[openai-billing]: https://platform.openai.com/settings/organization/billing/overview
