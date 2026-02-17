# Templates in Atto

This document explains how the templating system works and how to create new resume templates for Atto. It assumes no prior knowledge of the codebase — you'll learn what context variables are available, the expected data shapes, and practical tips for authoring templates that render correctly both to HTML and PDF.

## Overview
Templates are plain HTML files with Jinja2 markup. The backend loads the template text and renders it with Jinja2 using a small context containing two objects: `profile` and `sections`.

## Template Metadata (Frontmatter)

Every template should include metadata at the very beginning of the file (in the first 1024 bytes) using HTML comment blocks. This metadata is used to identify and catalog templates in the Atto system.

### Frontmatter Format
Add the following comment blocks at the very top of your HTML file, immediately after the opening `<!DOCTYPE>` or `<html>` tag:

```html
<!DOCTYPE html>
<!--template-id: 550e8400-e29b-41d4-a716-446655440000-->
<!--template-title: Professional Blue-->
<!--template-description: A modern, minimalist blue-themed resume template-->
<html lang="en">
  <!-- rest of template content -->
</html>
```

### Metadata Fields

- **`template-id`** (required): A UUID (v4) that uniquely identifies this template. This ID is used to track which templates have been downloaded locally and prevents duplicate downloads.
  - Format: standard UUID format (e.g., `550e8400-e29b-41d4-a716-446655440000`)
  - Example: `<!--template-id: 550e8400-e29b-41d4-a716-446655440000-->`

- **`template-title`** (optional): A human-readable name for the template.
  - Example: `<!--template-title: Professional Blue-->`

- **`template-description`** (optional): A brief description of the template's style or intended use.
  - Example: `<!--template-description: A modern, minimalist blue-themed resume template-->`

### Important Notes

- The metadata comments must appear in the first 1024 bytes of the file (typically right after the DOCTYPE or opening html tag).
- The regex patterns are case-insensitive, so you can write `Template-ID`, `TEMPLATE-ID`, or `template-id`.

## Where Templates Live
- **Community templates**: These live in the repository `templates/` folder (this folder).
- **Local templates**:
  - **Linux**: `~/.config/atto/templates/`
  - **macOS**: `~/Library/Application Support/atto/templates/`
  - **Windows**: `%APPDATA%\atto\templates\`

## Context: What's Available in Templates
When your template is rendered, it receives two variables:

- `profile` — an object (dictionary) representing the user's profile. Typical keys:
  - `full_name` (string)
  - `email` (string)
  - `phone` (string)
  - `location` (string)
  - `website` (string)

- `sections` — an array of sections. Each element is a section object with the following structure:

### Common Section Fields
- `id` (string)
- `type` (string): one of `'simple'`, `'detailed'`, `'paragraph'`
- `title` (string)
- `content` (varies by `type`, described below)

### Section Content Shapes
#### Simple Section (`type: 'simple'`)
```json
{
  "id": "1",
  "type": "simple",
  "title": "Skills",
  "content": ["JavaScript", "Python"]
}
```

#### Detailed Section (`type: 'detailed'`)
```json
{
  "id": "2",
  "type": "detailed",
  "title": "Work Experience",
  "content": [
    {
      "title": "Engineer",
      "subtitle": "Acme Co",
      "start_date": "2021-01",
      "end_date": "present",
      "bullets": ["Built features"]
    }
  ]
}
```

#### Paragraph Section (`type: 'paragraph'`)
```json
{
  "id": "3",
  "type": "paragraph",
  "title": "Summary",
  "content": "A short summary."
}
```

## Basic Template Patterns (Jinja2)
Here are the canonical patterns you'll want to use when authoring templates.

### Loop Through Sections and Branch by Type
```html
{% for section in sections %}
  <section>
    <h2>{{ section.title }}</h2>

    {% if section.type == 'detailed' %}
      {% for item in section.content %}
        <div class="item">
          <div class="title">{{ item.title }}</div>
          {% if item.subtitle %}<div class="subtitle">{{ item.subtitle }}</div>{% endif %}

          {% if item.start_date or item.end_date %}
            <div class="dates">
              {% set start = item.start_date or '' %}
              {% set end = 'Present' if item.end_date == 'present' else (item.end_date or '') %}
              {{ start }}{% if start and end %} – {% endif %}{{ end }}
            </div>
          {% endif %}

          {% if item.bullets %}
            <ul>
              {% for b in item.bullets %}
                <li>{{ b }}</li>
              {% endfor %}
            </ul>
          {% endif %}
        </div>
      {% endfor %}

    {% elif section.type == 'simple' %}
      {% if section.content %}
        <ul>
          {% for bullet in section.content %}
            <li>{{ bullet }}</li>
          {% endfor %}
        </ul>
      {% endif %}

    {% elif section.type == 'paragraph' %}
      <p>{{ section.content }}</p>

    {% endif %}
  </section>
{% endfor %}
```

## Notes About Dates
- `start_date` and `end_date` are simple strings in `YYYY-MM` format. The `end_date` may be the literal string `'present'` to represent an ongoing role.
- Templates are responsible for formatting these strings for display (examples above show a simple `Present` substitution).

## Safety, Escaping, and HTML Content
- All variables are auto-escaped by Jinja2 by default. If you intentionally include HTML in a field and want to render it, use the `|safe` filter — but only if you trust the source of the content.
- Avoid injecting untrusted HTML in templates. By default, the renderer will escape special characters.

## CSS and Print Considerations
- PDF rendering uses WeasyPrint. WeasyPrint supports modern CSS but has limitations compared to browser engines. CSS styles are defined inline using the `<style>` tag.
- Add print-friendly rules via `@media print` to control page breaks and margins.
- No asset support is available right now. When adding images or external assets, prefer absolute URLs or inline them (data URIs) if you need them in PDF output.

## Example Minimal Template Skeleton with Frontmatter
```html
<!doctype html>
<!--template-id: 550e8400-e29b-41d4-a716-446655440000-->
<!--template-title: Minimalist Resume-->
<!--template-description: A clean, simple resume template-->
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{{ profile.full_name }} - Resume</title>
    <style>
      /* Your CSS here */
      @media print { /* PDF tweaks */ }
    </style>
  </head>
  <body>
    <header>
      <h1>{{ profile.full_name }}</h1>
      {% if profile.email %}<div>{{ profile.email }}</div>{% endif %}
    </header>

    {% for section in sections %}
      <section>
        <h2>{{ section.title }}</h2>
        {# ...render based on section.type as shown above... #}
      </section>
    {% endfor %}
  </body>
</html>
```

