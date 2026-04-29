import * as nock from 'nock';

const TODOS_RESPONSE = [
  { userId: 1, id: 1, title: 'delectus aut autem', completed: false },
  { userId: 1, id: 2, title: 'quis ut nam facilis', completed: false },
];

const COUNTRIES_RESPONSE = [
  { capital: ['Tirana'], languages: { sqi: 'Albanian' } },
  { capital: ['Andorra la Vella'], languages: { cat: 'Catalan' } },
];

const DOG_IMAGE_BYTES = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);

export function setupMocks(): void {
  // payload — jq `.[0].title` requires title === "delectus aut autem"
  // to match the abiEncodedData fixture in helper.ts.
  nock('https://jsonplaceholder.typicode.com')
    .persist()
    .get('/todos')
    .query({ id: '1' })
    .reply(200, TODOS_RESPONSE, { 'Content-Type': 'application/json' });

  // payload2 — jq `.[0]` decoded as the (uint8,uint8,string,bool) tuple.
  nock('https://jsonplaceholder.typicode.com')
    .persist()
    .get('/todos')
    .query({ userId: '1' })
    .reply(200, TODOS_RESPONSE, { 'Content-Type': 'application/json' });

  // payload3 — was the flaky one against the live restcountries.com.
  nock('https://restcountries.com')
    .persist()
    .get('/v3.1/independent')
    .query(true)
    .reply(200, COUNTRIES_RESPONSE, { 'Content-Type': 'application/json' });

  // payload4 — test expects INVALID_FETCH_ERROR; non-2xx makes axios throw.
  nock('https://newsapi.org').persist().get('/v2/everything').query(true).reply(
    401,
    { status: 'error', message: 'apiKeyMissing' },
    {
      'Content-Type': 'application/json',
    },
  );

  // payload5 — test expects INVALID_RESPONSE_CONTENT_TYPE.
  nock('https://images.dog.ceo')
    .persist()
    .get('/breeds/terrier-dandie/n02096437_1129.jpg')
    .reply(200, DOG_IMAGE_BYTES, { 'Content-Type': 'image/jpeg' });

  // Block any unintercepted outbound HTTP — but allow the local Nest server
  // that supertest connects to. validate-url's DNS lookup is unaffected
  // because nock operates at the http(s) module layer, not the resolver.
  nock.disableNetConnect();
  nock.enableNetConnect(
    (host) => host.startsWith('127.0.0.1') || host.startsWith('localhost'),
  );
}

export function teardownMocks(): void {
  nock.cleanAll();
  nock.enableNetConnect();
}
