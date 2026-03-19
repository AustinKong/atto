import json
from uuid import UUID

from app.repositories.base import DatabaseRepository
from app.schemas import DEFAULT_RESUME_ID, DEFAULT_TEMPLATE_ID, Resume
from app.utils.errors import NotFoundError


class ResumeRepository(DatabaseRepository):
  def __init__(self):
    super().__init__()

  def get(self, resume_id: UUID) -> Resume:
    row = self.fetch_one('SELECT * FROM resumes WHERE id = ?', (str(resume_id),))
    if not row:
      raise NotFoundError(f'Resume {resume_id} not found')

    sections_data = json.loads(row['sections'])

    return Resume(
      id=row['id'],
      template_id=UUID(row['template_id']),
      sections=sections_data,
    )

  def create(self, resume: Resume) -> Resume:
    self.execute(
      'INSERT INTO resumes (id, template_id, sections) VALUES (?, ?, ?)',
      (
        str(resume.id),
        str(resume.template_id),
        json.dumps([section.model_dump() for section in resume.sections]),
      ),
    )

    return resume

  def update(self, resume: Resume) -> Resume:
    row = self.fetch_one('SELECT * FROM resumes WHERE id = ?', (str(resume.id),))
    if not row:
      raise NotFoundError(f'Resume {resume.id} not found')

    self.execute(
      'UPDATE resumes SET template_id = ?, sections = ? WHERE id = ?',
      (
        str(resume.template_id),
        json.dumps([section.model_dump() for section in resume.sections]),
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
      default_resume = Resume(
        id=DEFAULT_RESUME_ID,
        template_id=DEFAULT_TEMPLATE_ID,
        sections=[],
      )
      return self.create(default_resume)
