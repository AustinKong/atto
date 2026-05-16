from llm import get_runtime_model_client

from app.clients.application_analysis.local import LocalApplicationAnalysisClient
from app.services.paper_mode.schemas import PaperFixture


async def populate_actual_analyses(fixture: PaperFixture) -> PaperFixture:
  analysis_client = LocalApplicationAnalysisClient(llm_client=get_runtime_model_client())
  listing_by_id = {listing.id: listing for listing in fixture.listings}
  resume_by_id = {resume.id: resume for resume in fixture.resumes}

  for completed_count, application in enumerate(fixture.applications, start=1):
    listing = listing_by_id[application.listing_id]
    resume = resume_by_id[application.resume_id]
    application.analysis = await analysis_client.generate_analysis(
      listing=listing,
      application=application,
      resume=resume,
    )
    print(
      'Generated analysis '
      f'{completed_count}/{len(fixture.applications)} for {listing.company} '
      f'{listing.title}.'
    )

  return fixture
