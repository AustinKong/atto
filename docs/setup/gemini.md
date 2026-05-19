# Gemini setup

Use Gemini if your AI keys live in Google AI Studio or you prefer Google's model ecosystem.

## Create a key

1. Open Google AI Studio.
2. Create an API key for the project you want Atto to use.
3. Copy the key and make sure the Gemini API is enabled for that project.

## Paste and test

Keep `gemini-2.0-flash` selected unless you already know you want another model. It is the
default because it is quick, capable, and cost-conscious for Atto's setup path.

If the connection test fails, the most common causes are:

- The key was copied with a missing or extra character.
- API-key restrictions block the local Atto app.
- The selected model is unavailable in your region.
- Billing, usage limits, or quota need attention.

After the test succeeds, save and proceed.
