from app.clients.scraping.schemas import CrawlResult


def format_crawl_results(results: list[CrawlResult]) -> str:
  if not results:
    return 'No external research results were retrieved.'

  chunks = [
    f'[Source {idx}] {result.url}\n{result.content.strip()}'
    for idx, result in enumerate(results, start=1)
    if result.content.strip()
  ]

  if not chunks:
    return 'External sources returned no readable content.'

  return '\n\n'.join(chunks)
