// Trimmed from a real HasData Google News response
export const searchResponse = {
  requestMetadata: { id: 'abc', status: 'ok', url: 'https://news.google.com/search?hl=en&gl=us&ceid=us%3Aen&q=tesla+when%3A7d' },
  newsResults: [
    {
      position: 1,
      title: 'Tesla deliveries beat estimates',
      link: 'https://www.reuters.com/business/autos/tesla-deliveries',
      source: { name: 'Reuters', icon: 'https://www.reuters.com/favicon.ico', authors: ['Jane Doe'] },
      date: '2026-10-09T17:10:13.000Z',
      thumbnail: 'https://www.reuters.com/thumb.jpg?auth\\u003dabc\\u0026width\\u003d1080',
      thumbnailSmall: 'https://news.google.com/api/attachments/SMALL',
    },
    {
      position: 2,
      title: 'Musk unveils new model',
      stories: [
        { position: 1, title: 'Analysts react', source: { name: 'CNBC' }, link: 'https://www.cnbc.com/analysts', date: '2026-10-09T15:10:13.000Z', storyToken: 'STORY' },
        { position: 2, title: '', link: 'https://example.com/untitled' },
      ],
    },
    {
      position: 3,
      title: 'A story without a date',
      link: 'https://www.npr.org/tesla',
      source: { name: 'NPR' },
    },
  ],
  menuLinks: [{ title: 'U.S.', topicToken: 'TOPIC' }],
}

export const emptyResponse = {
  requestMetadata: { id: 'def', status: 'ok' },
  menuLinks: [{ title: 'U.S.', topicToken: 'TOPIC' }],
}

export const validationError = {
  errors: [{ rule: 'enum', field: 'hl', message: 'enum validation failed' }],
}

export const errorResponse = {
  requestMetadata: { id: 'ghi', status: 'error' },
  errorMessage: 'Invalid api response',
}
