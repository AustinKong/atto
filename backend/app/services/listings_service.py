import json
from typing import Literal

from chromadb.api.types import Metadata
from pydantic import HttpUrl

from app.config import settings
from app.repositories import DatabaseRepository, VectorRepository
from app.schemas import Listing, ListingSummary, Page, StatusEnum
from app.utils.deduplication import fuzzy_text_similarity
from app.utils.errors import NotFoundError
from app.utils.status_ordering import generate_latest_event_sql


class ListingsService(DatabaseRepository, VectorRepository):
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

  def get(self, listing_id) -> Listing:
    query = """
      SELECT 
        l.id, l.url, l.title, l.company, l.domain,
        l.location, l.description, l.posted_date, l.skills, l.requirements
      FROM listings l
      WHERE l.id = ?
    """

    row = self.fetch_one(query, (str(listing_id),))
    if not row:
      raise NotFoundError(f'Listing {listing_id} not found')

    return Listing(**dict(row), applications=[])

  def get_by_url(self, url: HttpUrl) -> Listing | None:
    row = self.fetch_one(
      """
      SELECT 
        l.id, l.url, l.title, l.company, l.domain, l.location, l.description, l.posted_date,
        l.skills, l.requirements
      FROM listings l
      WHERE l.url = ?
      """,
      (str(url),),
    )

    return Listing(**dict(row)) if row else None

  def list_all(
    self,
    page,
    size,
    search: str | None = None,
    status: list[StatusEnum] | None = None,
    sort_by: Literal['title', 'company', 'posted_at', 'last_status_at'] | None = None,
    sort_dir: Literal['asc', 'desc'] | None = None,
  ) -> Page[ListingSummary]:
    offset = (page - 1) * size

    conditions = []
    params = []

    if search:
      conditions.append('(l.title LIKE ? OR l.company LIKE ? OR l.domain LIKE ?)')
      search_term = f'%{search}%'
      params.extend([search_term, search_term, search_term])

    if status:
      placeholders = ', '.join('?' for _ in status)
      conditions.append(f'le.status IN ({placeholders})')
      params.extend([s.value for s in status])

    where_clause = f'WHERE {" AND ".join(conditions)}' if conditions else ''

    sort_map = {
      'title': 'l.title',
      'company': 'l.company',
      'posted_at': 'l.posted_date',
      'last_status_at': 'le.date',
    }

    if sort_by:
      sql_sort_col = sort_map.get(sort_by, 'l.posted_date')
      sql_sort_dir = 'ASC' if sort_dir == 'asc' else 'DESC'
      order_by = f'{sql_sort_col} {sql_sort_dir}'
    else:
      order_by = 'l.id ASC'

    latest_events_cte = generate_latest_event_sql()

    query = f"""
      {latest_events_cte}
      SELECT 
        l.id, l.url, l.title, l.company, l.domain, l.location, l.posted_date,
        le.date as last_status_at,
        le.status as current_status
      FROM listings l
      LEFT JOIN latest_events le ON l.id = le.listing_id AND le.rn = 1
      {where_clause}
      GROUP BY l.id
      ORDER BY {order_by}
      LIMIT ? OFFSET ?
    """

    rows = self.fetch_all(query, tuple(params + [size, offset]))

    listings = [ListingSummary(**dict(row)) for row in rows]

    count_query = f"""
      {latest_events_cte}
      SELECT COUNT(DISTINCT l.id)
      FROM listings l
      LEFT JOIN latest_events le ON l.id = le.listing_id AND le.rn = 1
      {where_clause}
    """
    total_count = self.fetch_one(count_query, tuple(params))
    total_count = total_count[0] if total_count else 0

    return Page(
      items=listings,
      total=total_count,
      page=page,
      size=size,
      pages=(total_count + size - 1) // size,
    )

  def find_similar(
    self,
    new_listing: Listing,
  ) -> Listing | None:
    """
    Find similar listing using BOTH semantic and heuristic methods.

    Args:
      new_listing: New listing to check for similarities

    Returns:
      Similar listing if a match is found, None otherwise.
    """
    best_match = None
    best_score = 0.0

    semantic_matches = self._find_semantic_duplicates(new_listing)
    if semantic_matches:
      match, score = semantic_matches[0]
      if score > best_score:
        best_match = match
        best_score = score

    heuristic_matches = self._find_heuristic_duplicates(new_listing)
    if heuristic_matches:
      match, score = heuristic_matches[0]
      if score > best_score:
        best_match = match
        best_score = score

    if best_match and new_listing.company != best_match.company:
      best_match = None

    return best_match

  def create(self, listing: Listing) -> Listing:
    self.execute(
      """
      INSERT INTO listings (
        id, url, title, company, domain, location, description, posted_date, skills,
        requirements
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      """,
      (
        str(listing.id),
        str(listing.url),
        listing.title,
        listing.company,
        listing.domain,
        listing.location,
        listing.description,
        listing.posted_date.isoformat() if listing.posted_date else None,
        json.dumps(listing.skills),
        json.dumps(listing.requirements),
      ),
    )

    documents = [self._create_listing_embedding_text(listing)]
    metadatas: list[Metadata] = [{'listing_id': str(listing.id)}]

    self.add_documents(collection_name='listings', documents=documents, metadatas=metadatas)

    return listing

  def _create_listing_embedding_text(self, listing: Listing) -> str:
    parts = [
      f'Company: {listing.company}',
      f'Title: {listing.title}',
      f'Location: {listing.location or "Not specified"}',
      f'Description: {listing.description}',
    ]

    if listing.skills:
      parts.append(f'Skills: {", ".join(listing.skills)}')

    if listing.requirements:
      parts.append(f'Requirements: {", ".join(listing.requirements)}')

    return '\n'.join(parts)

  def _find_semantic_duplicates(
    self,
    new_listing: Listing,
  ) -> list[tuple[Listing, float]]:
    """
    Find semantically similar listings using vector similarity.

    Args:
      new_listing: The listing to check

    Returns:
      List of (similar_listing, similarity_score) tuples above threshold
    """
    query_text = self._create_listing_embedding_text(new_listing)
    search_results = self.search_documents(
      collection_name='listings',
      query=query_text,
      k=settings.listings.search_k,
    )

    matching_ids = []
    similarity_scores = {}
    for _doc_text, metadata, similarity in search_results:
      if similarity >= settings.listings.semantic_threshold:
        listing_id = metadata.get('listing_id')
        if listing_id:
          matching_ids.append(listing_id)
          similarity_scores[listing_id] = similarity

    if not matching_ids:
      return []

    placeholders = ','.join('?' * len(matching_ids))
    rows = self.fetch_all(
      f"""
      SELECT 
        l.id, l.url, l.title, l.company, l.domain, l.location, l.description, l.posted_date,
        l.skills, l.requirements
      FROM listings l
      WHERE l.id IN ({placeholders})
      """,
      tuple(matching_ids),
    )

    similar = []
    for row in rows:
      listing = Listing(**dict(row))
      score = similarity_scores.get(str(listing.id), 0.0)
      similar.append((listing, score))

    return sorted(similar, key=lambda x: x[1], reverse=True)

  def _find_heuristic_duplicates(
    self,
    new_listing: Listing,
  ) -> list[tuple[Listing, float]]:
    """
    Find duplicates using fuzzy string matching on company and title.

    Args:
      new_listing: The listing to check

    Returns:
      List of (similar_listing, similarity_score) tuples above threshold
    """
    # Get all listings for heuristic comparison (no pagination for deduplication)
    page_result = self.list_all(page=1, size=1000)
    existing_listings = page_result.items

    similar = []
    for existing_listing in existing_listings:
      title_sim = fuzzy_text_similarity(new_listing.title, existing_listing.title)
      company_sim = fuzzy_text_similarity(new_listing.company, existing_listing.company)

      if (
        title_sim >= settings.listings.title_threshold
        and company_sim >= settings.listings.company_threshold
      ):
        combined_score = (title_sim + company_sim) / 2
        similar.append((existing_listing, combined_score))

    return sorted(similar, key=lambda x: x[1], reverse=True)
