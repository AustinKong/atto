# Gemini setup

Use this guide if you want Atto to use Google Gemini for AI features. You only
need a Gemini API key from Google AI Studio.

# Create an API key

Open the Google AI Studio API keys page:
[aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

![Google AI Studio API keys page][gemini-api-key-page]

Sign in with the Google account you want to use. Accept the Google AI Studio
terms if Google asks.

![Google AI Studio create API key dialog][gemini-create-api-key]

Click **Create API key**.

![Google AI Studio project creation form for an API key][gemini-project-key]

Choose an existing Google Cloud project, or create a new project for Atto.

![Google AI Studio create new project option][gemini-create-new-project]

If you are creating a new project, give it a simple name you will recognize
later, such as `Atto`.

![Google AI Studio API keys page with Create API key button highlighted][gemini-create-key-button]

Create the key for the project you selected.

![Google AI Studio generated API key page with copy button highlighted][gemini-copy-key]

Copy the key as soon as Google shows it. If you are new to Google AI Studio,
Google may automatically create a default Google Cloud project and API key after
you accept the terms. You can use that key for Atto.

# Check billing

![Google AI Studio setup billing prompt][gemini-setup-billing]

Gemini may let you start with a free tier, but some accounts, regions, or usage
levels may require billing. If Google AI Studio asks you to set up billing,
follow the prompt before returning to Atto.

[gemini-api-key-page]: ../../.github/assets/setup/gemini/api-key-page.png
[gemini-create-api-key]: ../../.github/assets/setup/gemini/create-api-key.png
[gemini-project-key]: ../../.github/assets/setup/gemini/create-project-for-api-key.png
[gemini-create-new-project]: ../../.github/assets/setup/gemini/create-new-project.png
[gemini-create-key-button]: ../../.github/assets/setup/gemini/create-key-button.png
[gemini-copy-key]: ../../.github/assets/setup/gemini/copy-key.png
[gemini-setup-billing]: ../../.github/assets/setup/gemini/setup-billing.png
