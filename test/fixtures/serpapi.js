export const searchResponse = {
  search_metadata: { id: 'abc', status: 'Success' },
  search_parameters: { engine: 'google_news', q: 'tesla when:7d' },
  news_results: [
    {
      position: 1,
      title: 'Tesla deliveries beat estimates',
      source: { name: 'Reuters', icon: 'https://www.reuters.com/favicon.ico', authors: ['Jane Doe'] },
      link: 'https://www.reuters.com/business/autos/tesla-deliveries',
      thumbnail: 'https://www.reuters.com/thumb.jpg',
      date: '10/09/2026, 05:10 PM, +0000 UTC',
      iso_date: '2026-10-09T17:10:13Z',
    },
    {
      position: 2,
      highlight: {
        title: 'Musk unveils new model',
        source: { name: 'The Verge' },
        link: 'https://www.theverge.com/tesla-model',
        iso_date: '2026-10-09T16:10:13Z',
      },
      stories: [
        { position: 1, title: 'Analysts react', source: { name: 'CNBC' }, link: 'https://www.cnbc.com/analysts', iso_date: '2026-10-09T15:10:13Z' },
        { position: 2, title: '', link: 'https://example.com/untitled' },
      ],
    },
    {
      position: 3,
      title: 'A post about Tesla',
      author: { name: 'Elon', handle: '@elon' },
      link: 'https://x.com/elon/status/1',
    },
  ],
}

export const emptyResponse = {
  search_metadata: { id: 'def', status: 'Success' },
  error: "Google hasn't returned any results for this query.",
}

export const errorResponse = {
  search_metadata: { status: 'Error' },
  error: 'Invalid API key.',
}
