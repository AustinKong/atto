# TODO

This roadmap focuses on the local frontend and backend. Cloud remains disabled/parked for now; do not spend implementation time on cloud-only paths unless they block local behavior.

## P0 - Make Core Local Flows Real

- [ ] Redesign the applications page into a simple selected-application workspace.
  - [ ] Correct reference commit: `7b8d862932f5ce708d9a38c31f6967afa2f8be58` (`feat: add font; create segmented gauge; add nivo`).
  - [ ] Removal/move commit: `2e78201c6de258cab59e3c800adf47aff1ee3740` (`refactor: WIP move applications to separate page`).
  - [ ] The old drawer-embedded code existed at `7b8d862932f5ce708d9a38c31f6967afa2f8be58:frontend/src/pages/listings/drawer/applications/`.
  - [ ] Start from these old files when rebuilding: `Details.tsx`, `index.tsx`, `Timeline.tsx`, `CreateApplicationModal.tsx`, `route.tsx`, and `status-event-modal/*`.
  - [ ] Especially reuse the old `Details.tsx` pattern: application menu/selector, `DataList` stage/applied/last update fields, `New Application`, and `View Resume`.
  - [ ] Use the old drawer route pattern as a reference: `frontend/src/pages/listings/drawer/route.tsx` included `applicationsRoute(queryClient)` in the drawer children.
  - [ ] Do not restore the old URL-driven selected application behavior from that commit; it used `/listings/:listingId/applications/:applicationId`, which made selection/routing too heavy.
  - [ ] New target route should be listing-level: `/listings/:listingId/applications`.
  - [ ] Store the selected application id in a drawer-level context/provider or local state, not in the URL.
  - [ ] On drawer load, default selection to the first `listing.applications` item if one exists.
  - [ ] When a new application is created, update/refetch the listing/application caches and select the newly created application.
  - [ ] Keep direct resume/template routes separate; use buttons/links for opening the selected resume rather than nesting the whole applications page by `applicationId`.
  - [ ] Remove the React Flow application timeline/workspace from the main page.
  - [ ] Remove the application pipeline/funnel chart from the main page.
  - [ ] Keep the existing vertical `Timeline` component as the bottom section for the selected application.
  - [ ] Delete unused React Flow files after the redesign if no other route imports them:
    `frontend/src/pages/applications/flow/*`.
  - [ ] Delete `frontend/src/pages/applications/ApplicationFunnel.tsx` if the funnel is no longer used.

- [ ] Build the new applications page layout.
  - [ ] Top section: render a compact scrollable application selector that feels like a small "window" with its own scrollbar.
  - [ ] Application selector rows should show useful labels such as current status, last updated date, resume/template label, and maybe created/applied date.
  - [ ] Application selector should include a clear active state.
  - [ ] Put a "New application" button at the bottom of the selector window.
  - [ ] Below the selector, show selected-application content in a single readable vertical flow.
  - [ ] Include a match score section, but hide it or mark it unavailable until the score is deterministic.
  - [ ] Include role/application facts in a data-list style similar to the listing "About" tab.
  - [ ] Include buttons for opening the selected resume and CV/cover letter.
  - [ ] If CV/cover letter is not implemented yet, show a disabled/planned button or omit it; do not reuse resume preview as fake CV content.
  - [ ] Put the vertical application timeline at the bottom.
  - [ ] Ensure the layout works in the dashboard content area without nested splitters or oversized panels.

- [ ] Refactor application routing and data loading for context-based selection.
  - [ ] Update `frontend/src/pages/applications/route.tsx` so the applications page is rendered at the index route instead of redirecting to the first application id.
  - [ ] Remove or rewrite `applicationsListRedirectLoader` from `frontend/src/loaders/listing.loaders.ts`.
  - [ ] Avoid `useSuspenseQuery(applicationQueries.item(applicationId!))` at the page root because `applicationId` will no longer be a route param.
  - [ ] Derive available applications from `listing.applications` first, then fetch the selected full application by context state.
  - [ ] Add an `ApplicationSelectionProvider` or similarly named local context if prop drilling becomes awkward.
  - [ ] Keep breadcrumbs stable without requiring an application-specific breadcrumb segment.
  - [ ] Confirm the listing drawer "Applications" tab link still points to `/listings/${listingId}/applications`.

- [ ] Make selected-application mutations update the new context flow correctly.
  - [ ] Status event create/update/delete should update or invalidate `['application', selectedApplicationId]`.
  - [ ] Status event mutations should also invalidate/refetch `['listing', listingId]` so the selector labels/current statuses stay fresh.
  - [ ] Application creation should select the newly created application immediately.
  - [ ] Empty state should show helpful copy plus the same "New application" action when no applications exist.
  - [ ] Handle deleted/missing selected application by selecting the next available application or returning to empty state.

- [ ] Verify the listing research tab end-to-end in local mode.
  - [ ] Confirm `POST /api/listings/{id}/research` works without a signed-in/cloud session and selects `LocalListingResearchClient`.
  - [ ] Confirm the frontend starts generation, polls `/api/listings/{id}/research/status`, refetches the listing, and renders sentiment, salary, market summary, and applicant insights.
  - [ ] Add visible error handling for failed research tasks instead of silently returning to an idle state.
  - [ ] Disable or guard duplicate refresh clicks while a task is pending/running.
  - [ ] Show partial/empty-state copy per research section when one section fails or returns no useful data.
  - [ ] Decide whether research notes are user-authored only or should be included in copied/generated research output.

- [ ] Replace dummy data on the applications page with real application/listing/resume data.
  - [ ] Remove `Math.random()` match scores and derive a deterministic score from resume/listing data or hide the score until scoring exists.
  - [ ] Replace `SkillsComparison` mock radar data with computed listing requirements/skills versus resume/profile skills.
  - [ ] Remove `ApplicationFunnel` from the main page unless a simpler future analytics surface needs it.
  - [ ] Replace the cover letter/CV card that reuses `ResumePreviewCard` with a real feature, a planned placeholder, or remove it.
  - [ ] Finish the application details header beyond only rendering the listing title.
  - [ ] Ensure application event create/update/delete mutations invalidate or update the application and listing caches consistently.

- [ ] Make the resume page right panel real or remove it until real data exists.
  - [ ] Replace random match score with a deterministic resume/listing match calculation.
  - [ ] Feed skills comparison from the selected listing/application/resume rather than URL search params and mock data.
  - [ ] Replace `ContentQualityChart` mock data with backend- or frontend-computed section metrics.
  - [ ] Add a useful empty state when the resume is opened outside an application/listing context.
  - [ ] Decide whether the right panel should be resume quality, job match, application context, or hidden behind an analysis feature flag.

- [ ] Clarify the templates page behavior.
  - [ ] Make local/downloaded/remote/both template states obvious in the card UI.
  - [ ] Separate actions for preview, download, and select instead of making the entire card click do different things by mode.
  - [ ] After downloading a remote template, make it clear whether it was only saved locally or also selected for the current resume.
  - [ ] In picker mode, provide an explicit selected state and a success toast when a resume template changes.
  - [ ] Add paginated infinite scroll or a clearer pager/footer for template browsing.

## P1 - Resume Customization Product Decisions

- [ ] Define the resume customization business rules before expanding automation.
  - [ ] Decide what the default/global resume means: source of truth, onboarding artifact, or editable base resume.
  - [ ] Decide whether optimized resumes should copy the global resume once or stay linked to future global resume edits.
  - [ ] Decide whether optimization is section-level, item-level, bullet-level, or all three.
  - [ ] Decide whether users can lock sections/items/bullets so AI customization cannot rewrite them.
  - [ ] Decide whether generated resumes should store provenance: source resume id, listing id, model/provider, prompt version, and generated timestamp.
  - [ ] Decide whether users can compare original versus optimized bullets and accept/reject changes.

- [ ] Move resume creation/optimization logic out of `backend/app/routers/resume_router.py` into a service layer.
  - [ ] Keep router handlers thin and move default/blank/optimized branching into `ResumeService`.
  - [ ] Add explicit errors for invalid optimized creation requests instead of generic `ValueError`.
  - [ ] Validate that template fallback/self-healing belongs in service/repository boundaries rather than the router.
  - [ ] Consider a background task for optimized resume generation if local LLM calls can make creation slow.

- [ ] Improve optimized resume generation quality.
  - [ ] Include listing description, requirements, skills, keywords, and possibly research insights in the optimization context.
  - [ ] Preserve dates and immutable metadata while allowing only intended content fields to change.
  - [ ] Prevent hallucinated companies, titles, dates, credentials, or technologies not present in the source resume.
  - [ ] Add prompt/version constants so old generated resumes can be understood later.
  - [ ] Decide whether failed section optimizations should fail the whole resume or keep original sections with warnings.

- [ ] Decide whether to remove the resume JSON editor.
  - [ ] If removed, delete `frontend/src/pages/resume/editor/JsonEditor.tsx` and the JSON tab.
  - [ ] If retained, make it a real editable advanced mode with validation, save, reset, and error states.
  - [ ] Avoid a read-only JSON tab that looks editable but cannot persist changes.

## P1 - Listings Table Performance And UX

- [ ] Add virtualization to the main listings table.
  - [ ] Choose `@tanstack/react-virtual` or another table-compatible virtualizer and add the dependency if needed.
  - [ ] Virtualize rows while preserving sticky headers, column sizing, row click, hover prefetch, and infinite loading.
  - [ ] Trigger `fetchNextPage` near the bottom instead of relying only on a footer row.
  - [ ] Verify keyboard/focus behavior and screen-reader semantics do not regress.
  - [ ] Test with a large seeded dataset so the performance win is real.

- [ ] Replace fake listing match score in `frontend/src/pages/listings/table/index.tsx`.
  - [ ] Either compute a real match score from listing/resume/profile data or hide the column until scoring exists.
  - [ ] If computed locally, define a reusable scoring utility shared by listings, applications, and resume analysis.
  - [ ] If computed by backend, add schema fields and sorting/filtering support deliberately.

- [ ] Polish listing research display details.
  - [ ] Fix `frontend/src/pages/listings/drawer/research/SalaryRange.tsx` ticker label rendering when listed salary is present.
  - [ ] Make generated timestamps and task status consistent across time zones and refreshes.
  - [ ] Decide whether copied research should include salary and sentiment sections.

## P1 - Backend Domain And Data Integrity

- [ ] Move listing repository business logic into the service layer where appropriate.
  - [ ] Review `backend/app/repositories/listing_repository.py` TODO around business logic.
  - [ ] Keep repositories focused on SQL and model parsing.
  - [ ] Move cross-repository/listing-application decisions into `ListingService`.

- [ ] Harden application status event behavior.
  - [ ] Confirm status events are sorted correctly and current status always reflects the intended latest/business-priority event.
  - [ ] Return the updated `Application` from event create/update/delete routes or update frontend service types to match actual returned models.
  - [ ] Validate that `application_id` in event update/delete routes is used to prevent cross-application event edits.
  - [ ] Decide whether an application can exist without an `applied` event or whether `saved` is enough.

- [ ] Improve local listing ingestion quality.
  - [ ] Add salary fallback when extraction returns null.
  - [ ] Decide whether fallback salary research belongs in ingestion, research generation, or both.
  - [ ] Add clearer errors for scrape failures, LLM extraction failures, and duplicate detection.
  - [ ] Review arbitrary crawl truncation and source grounding quality.

- [ ] Review background task robustness.
  - [ ] Resolve the possible race between setting research status and polling status.
  - [ ] Persist enough task metadata for useful retries/debugging.
  - [ ] Decide whether local research should run sequentially only or expose a user setting for parallel crawling on powerful machines.

## P2 - Frontend Cleanup And Tech Debt

- [ ] Replace hardcoded cloud/API-key props in `FeatureTooltip` with a shared local capability hook.
  - [ ] `frontend/src/components/custom/feature-tooltip/index.tsx`
  - [ ] `frontend/src/pages/listings/drawer/research/ResearchFooter.tsx`

- [ ] Clean up auth/cloud-disabled UI copy.
  - [ ] Replace hardcoded disabled sign-in behavior with config-driven metadata from `/api/config` if still needed.
  - [ ] Ensure local/guest entry is obvious and auth-only features are not presented as required.
  - [ ] Audit remaining cloud marketing copy so disabled cloud does not confuse local users.

- [ ] Finish or remove small frontend TODO/FIXME items.
  - [ ] `frontend/index.html`: replace raster/favicon TODO with SVG if desired.
  - [ ] `frontend/index.html`: bundle fonts instead of relying on external font loading.
  - [ ] `frontend/src/components/theme/nivo.theme.ts`: fix Nivo theme updates on Chakra color-mode changes.
  - [ ] `frontend/src/components/auth/AuthProvider.tsx`: validate `useSuspenseQuery` placement/error behavior.
  - [ ] `frontend/src/components/layouts/dashboard/navbar/Profile.tsx`: confirm Chakra UI menu/profile pattern.
  - [ ] `frontend/src/components/custom/sections-editor/DateRangeSelector.tsx`: migrate to Chakra date selectors when practical.
  - [ ] `frontend/src/components/custom/sections-editor/index.tsx`: add lock controls if AI customization supports locked sections.
  - [ ] `frontend/src/components/custom/segmented-gauge/index.tsx`: snap display to whole blocks.
  - [ ] `frontend/src/pages/new-listings/details/index.tsx`: improve save-on-navigation behavior for dirty drafts.
  - [ ] `frontend/src/pages/new-listings/reference/source/HighlightProvider.tsx`: remove dead code.
  - [ ] `frontend/src/mutations/experience.mutations.ts`: improve diff logic to avoid unnecessary embedding updates.

## P2 - Backend Cleanup And Tech Debt

- [ ] Park cloud-specific code paths behind clear disabled boundaries.
  - [ ] Do not prioritize `backend/app/clients/listing_research/cloud_client.py` merging work while cloud is disabled.
  - [ ] Confirm no local feature accidentally requires an authorized cloud session.

- [ ] Finish or remove small backend TODO/FIXME items.
  - [ ] `backend/app/repositories/resume_repository.py`: replace default-resume auto-creation with onboarding or an explicit first-run setup decision.
  - [ ] `backend/app/schemas/__init__.py`: decide whether to remove aggregate schema exports.
  - [ ] `backend/app/repositories/base/__init__.py`: decide whether repository base modules should move to data-access clients.
  - [ ] `backend/app/routers/config_router.py`: remove dynamic enum/config logic if no longer used.
  - [ ] `backend/app/clients/model/__init__.py`: replace ad-hoc provider switching with clearer dispatch.
  - [ ] `backend/app/clients/scraping/local_client.py`: add logging and revisit crawl result truncation.

## P3 - Tests And Verification

- [ ] Add a small frontend regression suite once flows stabilize.
  - [ ] Research generation button/status/error states.
  - [ ] Applications page with real application data.
  - [ ] Resume page with and without listing/application context.
  - [ ] Template download/select behavior.
  - [ ] Virtualized listing table rendering and infinite loading.

- [ ] Add backend tests for business-critical local flows.
  - [ ] Listing draft generation duplicate URL/content paths.
  - [ ] Research task status transitions and failure handling.
  - [ ] Application status event create/update/delete/current-status sync.
  - [ ] Resume default/blank/optimized creation modes.
  - [ ] Template local/remote list merge and render endpoint.


ok in hindsight i think applications page is kinda unnecessary. esp the react flow and applicatoin pipeline. im thinking now to just change it to be some selector at top (basically like a "window" with a scroll bar that renders all applications and has a "New application" button at the bottom. below that can be match score, maybe some information like in about the role there is data list, then buttons to see resume and buttons to see CV. then finally at bottom is vertical timeline.

before i changed it to the current system, i used to have something very simiar. you may need to check my git history for the correct commit.

but in the old version the application id was stored in the url which made things hard. now i think application (selected) should just be in a context is enough.

with that in mind, do the necessary research, and make that the top priority in the TODO. write all the details including the required commit hash. i will use this to prompt github copilot to work on it instead in the future

## P4
Alot of query keys in frontend (invalidation) keeps repeating the array query key like ['listings', 'research', id] etc. (example). But ideally should do something like this instead: applicationQueries.analysisStatus(applicationId).queryKey so that there won't be mismatch bugs
