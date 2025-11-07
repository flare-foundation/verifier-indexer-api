export const payload = {
  attestationType:
    '0x576562324a736f6e000000000000000000000000000000000000000000000000',
  sourceId:
    '0x746573745075626c696357656232000000000000000000000000000000000000',
  requestBody: {
    url: 'https://jsonplaceholder.typicode.com/todos',
    httpMethod: 'GET',
    headers:
      '{"Content-Type":"application/json","User-Agent":"MySuperDuperApp"}',
    queryParams: '{"id": 1}',
    body: '',
    postProcessJq: '.[0].title',
    abiSignature: '{"internalType": "string","name": "title","type": "string"}',
  },
};
export const payload2 = {
  attestationType:
    '0x576562324a736f6e000000000000000000000000000000000000000000000000',
  sourceId:
    '0x746573745075626c696357656232000000000000000000000000000000000000',
  requestBody: {
    url: 'https://jsonplaceholder.typicode.com/todos',
    httpMethod: 'GET',
    headers: '{"Content-Type":"application/json"}',
    queryParams: '{"userId": 1}',
    body: '',
    postProcessJq: '.[0]',
    abiSignature: `{
          "internalType": "tuple",
          "type": "tuple",
          "components": [
            {
              "internalType": "uint8",
              "name": "userId",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "id",
              "type": "uint8"
            },
            {
              "internalType": "string",
              "name": "title",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "completed",
              "type": "bool"
            }
          ]
        }
    `,
  },
};
export const payload3 = {
  attestationType:
    '0x576562324a736f6e000000000000000000000000000000000000000000000000',
  sourceId:
    '0x746573745075626c696357656232000000000000000000000000000000000000',
  requestBody: {
    url: 'https://restcountries.com/v3.1/independent',
    httpMethod: 'GET',
    headers: '',
    queryParams: '{"status": true, "fields": "languages,capital"}',
    body: '',
    postProcessJq: `{ capital1: .[0].capital[0], capital2: .[1].capital[0] }`,
    abiSignature: `{
      "type": "tuple",
      "components": [
        {
          "type": "string",
          "name": "capital1"
        },
        {
          "type": "string",
          "name": "capital2"
        }
      ]
    }`,
  },
};
export const payload4 = {
  attestationType:
    '0x576562324a736f6e000000000000000000000000000000000000000000000000',
  sourceId:
    '0x746573745075626c696357656232000000000000000000000000000000000000',
  requestBody: {
    url: 'https://newsapi.org/v2/everything',
    httpMethod: 'GET',
    headers: '',
    queryParams:
      '{"q": "pocket", "from": "2025-03-23", "to": "2025-03-23", "sortBy": "publishedAt"}',
    body: '',
    postProcessJq: `
          {
            author: .[0].author,
            title:  .[0].title,
          }
        `,
    abiSignature: `
        {
          "type": "tuple",
          "components": [
            { "type": "string", "name": "author" },
            { "type": "string", "name": "title" }
          ]
        }
      
    `,
  },
};
