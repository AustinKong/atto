import json
from uuid import UUID

from app.repositories import DatabaseRepository
from app.schemas import DEFAULT_RESUME_ID, DEFAULT_TEMPLATE_ID, Profile, Resume
from app.utils.errors import NotFoundError


class ResumesService(DatabaseRepository):
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

  def get(self, resume_id: UUID) -> Resume:
    row = self.fetch_one('SELECT * FROM resumes WHERE id = ?', (str(resume_id),))
    if not row:
      raise NotFoundError(f'Resume {resume_id} not found')

    sections_data = json.loads(row['sections'])
    profile_data = json.loads(row['profile'])

    return Resume(
      id=row['id'],
      template_id=UUID(row['template_id']),
      sections=sections_data,
      profile=Profile(**profile_data),
    )

  def create(self, resume: Resume) -> Resume:
    self.execute(
      'INSERT INTO resumes (id, template_id, sections, profile) VALUES (?, ?, ?, ?)',
      (
        str(resume.id),
        str(resume.template_id),
        json.dumps([section.model_dump() for section in resume.sections]),
        json.dumps(resume.profile.model_dump()),
      ),
    )

    return resume

  def update(self, resume: Resume) -> Resume:
    row = self.fetch_one('SELECT * FROM resumes WHERE id = ?', (str(resume.id),))
    if not row:
      raise NotFoundError(f'Resume {resume.id} not found')

    self.execute(
      'UPDATE resumes SET template_id = ?, sections = ?, profile = ? WHERE id = ?',
      (
        str(resume.template_id),
        json.dumps([section.model_dump() for section in resume.sections]),
        json.dumps(resume.profile.model_dump()),
        str(resume.id),
      ),
    )

    return resume

  def delete(self, resume_id: UUID) -> None:
    row = self.fetch_one('SELECT id FROM resumes WHERE id = ?', (str(resume_id),))
    if not row:
      raise NotFoundError(f'Resume {resume_id} not found')

    self.execute('DELETE FROM resumes WHERE id = ?', (str(resume_id),))

  def ensure_default_global_resume_exists(self) -> Resume:
    """
    Ensure the default global resume exists. If not, create it.
    Returns the default global resume.

    TODO: Make user go through onboarding if default global resume doesn't exist
    """
    try:
      return self.get(DEFAULT_RESUME_ID)
    except NotFoundError:
      # Create the default global resume with empty profile and sections
      default_resume = Resume(
        id=DEFAULT_RESUME_ID,
        template_id=DEFAULT_TEMPLATE_ID,
        sections=[],
        profile=Profile(),
      )
      return self.create(default_resume)
