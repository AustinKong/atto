import json
from uuid import UUID

from app.repositories import DatabaseRepository
from app.schemas import Resume, Section
from app.utils.errors import NotFoundError


class ResumesService(DatabaseRepository):
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

  def get(self, resume_id: UUID) -> Resume:
    row = self.fetch_one('SELECT * FROM resumes WHERE id = ?', (str(resume_id),))
    if not row:
      raise NotFoundError(f'Resume {resume_id} not found')

    sections_data = json.loads(row['sections'])
    if isinstance(sections_data, list):
      sections = [Section(**section) for section in sections_data]
    else:
      sections = []
    return Resume(
      id=row['id'],
      template=row['template'],
      sections=sections,
    )

  def create(self, resume: Resume) -> Resume:
    self.execute(
      'INSERT INTO resumes (id, template, sections) VALUES (?, ?, ?)',
      (
        str(resume.id),
        resume.template,
        json.dumps([section.model_dump() for section in resume.sections]),
      ),
    )

    return resume

  def update(self, resume: Resume) -> Resume:
    row = self.fetch_one('SELECT * FROM resumes WHERE id = ?', (str(resume.id),))
    if not row:
      raise NotFoundError(f'Resume {resume.id} not found')

    self.execute(
      'UPDATE resumes SET template = ?, sections = ? WHERE id = ?',
      (
        resume.template,
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
