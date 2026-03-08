import json
import os
import sqlite3
import sys
import uuid

# Add the backend directory to the Python path so we can import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.config import settings
from app.schemas import DEFAULT_RESUME_ID, DEFAULT_TEMPLATE_ID


def run(json_path: str, default_resume_path: str):
  if not os.path.exists(settings.paths.db_path):
    print(f'Database not found at {settings.paths.db_path}. Please run init_db.py first.')
    return

  if not os.path.exists(json_path):
    print(f'JSON file not found at {json_path}.')
    return

  if os.path.exists(default_resume_path):
    print(f'Seeding from {default_resume_path}...')
    with open(default_resume_path, encoding='utf-8') as f:
      resume_data = json.load(f)

      # Write profile to profile.json (profile is now a first-class entity)
      profile_dict = resume_data.get('profile', {})
      profile_path = settings.paths.profile_path
      os.makedirs(os.path.dirname(profile_path), exist_ok=True)
      with open(profile_path, 'w', encoding='utf-8') as pf:
        json.dump(profile_dict, pf, indent=2)
      print(f'Successfully seeded profile to {profile_path}.')

      # Update the default resume with sections only (no profile)
      sections = resume_data.get('sections', [])
      with sqlite3.connect(settings.paths.db_path) as db:
        cursor = db.cursor()
        cursor.execute(
          'UPDATE resumes SET sections = ? WHERE id = ?',
          (json.dumps(sections), str(DEFAULT_RESUME_ID)),
        )
        db.commit()

      print('Successfully seeded default resume with sections.')
  else:
    print(
      f'Default resume file not found at {default_resume_path}. Skipping default resume seeding.'
    )

  print(f'Seeding demo data into {settings.paths.db_path} from {json_path}...')

  with sqlite3.connect(settings.paths.db_path) as db:
    cursor = db.cursor()

    # Ensure default resume exists
    print('Ensuring default resume exists...')
    cursor.execute(
      'INSERT OR IGNORE INTO resumes (id, template_id, sections) VALUES (?, ?, ?)',
      (str(DEFAULT_RESUME_ID), str(DEFAULT_TEMPLATE_ID), '[]'),
    )

    # Read JSON and insert data
    with open(json_path, encoding='utf-8') as f:
      items = json.load(f)

      inserted_count = 0
      for item in items:
        listing_data = item.get('listing', {})
        app_data = item.get('application', {})
        events = app_data.get('events', [])

        listing_id = str(uuid.uuid4())
        application_id = str(uuid.uuid4())
        resume_id = str(uuid.uuid4())

        url = listing_data.get('url')
        if not url:
          url = f'https://synthetic.local/{uuid.uuid4()}'

        print(f'Inserting listing: {listing_data.get("title")} at {listing_data.get("company")}')

        try:
          # --- LISTINGS ---
          cursor.execute(
            """
            INSERT INTO listings 
            (
              id, url, title, company, domain, location, description, notes, insights, posted_date, 
              skills, requirements
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
              listing_id,
              url,
              listing_data.get('title'),
              listing_data.get('company'),
              listing_data.get('domain'),
              listing_data.get('location'),
              listing_data.get('description', ''),
              listing_data.get('notes'),
              listing_data.get('insights'),
              listing_data.get('postedDate'),
              json.dumps(listing_data.get('skills', [])),
              json.dumps(listing_data.get('requirements', [])),
            ),
          )

          # --- RESUMES ---
          # Create a new empty resume for this application
          cursor.execute(
            'INSERT INTO resumes (id, template_id, sections) VALUES (?, ?, ?)',
            (resume_id, str(DEFAULT_TEMPLATE_ID), '[]'),
          )

          # --- APPLICATIONS ---
          # Create application with the new resume
          if events:
            # Sort events by date just in case
            events.sort(key=lambda e: e.get('date', ''))
            latest_event = events[-1]
            current_status = latest_event.get('status')
            last_status_at = latest_event.get('date')
          else:
            current_status = 'saved'
            last_status_at = None

          cursor.execute(
            """
            INSERT INTO applications 
            (id, listing_id, resume_id, current_status, last_status_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (application_id, listing_id, resume_id, current_status, last_status_at),
          )

          # --- STATUS EVENTS ---
          for event in events:
            event_id = str(uuid.uuid4())
            payload = {}
            if event['status'] == 'interview':
              payload['stage'] = event['stage']
            elif event['status'] == 'applied':
              payload['referrals'] = event.get('referrals', [])
            # Add other statuses if they have extra fields
            payload_json = json.dumps(payload) if payload else None

            cursor.execute(
              """
              INSERT INTO status_events 
              (id, application_id, status, date, notes, payload)
              VALUES (?, ?, ?, ?, ?, ?)
              """,
              (
                event_id,
                application_id,
                event.get('status'),
                event.get('date'),
                event.get('notes'),
                payload_json,
              ),
            )

          inserted_count += 1

        except Exception as e:
          print(f'Error inserting row {listing_data.get("title")}: {e}')
          db.rollback()
          raise

      db.commit()
      print(f'Successfully inserted {inserted_count} demo listings and applications.')


if __name__ == '__main__':
  json_file = os.path.join(os.path.dirname(__file__), 'data.json')
  default_resume_file = os.path.join(os.path.dirname(__file__), 'default_resume.json')
  run(json_file, default_resume_file)
