import { standardAddressHash } from '@flarenetwork/mcc';
import { expect } from 'chai';
import * as request from 'supertest';
import { app } from '../helper';

describe('/ReferencedPaymentNonexistence/mic', () => {
  it('should get abiEncodedRequest', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.messageIntegrityCode.length).to.be.equal(66);
  });
  it('should get 400 with checkSourceAddresses=false and random sourceAddressesRoot', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: false,
        sourceAddressesRoot: 'dfe.fewf. .wef.wef .wew3=E#(/ R89 ',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with checkSourceAddresses=false and no sourceAddressesRoot', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: false,
        sourceAddressesRoot: '',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get invalid status with zero standardPaymentReference', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000000',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal(
      'INVALID: ZERO PAYMENT REFERENCE UNSUPPORTED',
    );
  });
  it('should get abiEncodedRequest with 0x in standardPaymentReference', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '0x464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.messageIntegrityCode.length).to.be.equal(66);
  });
  it('should get abiEncodedRequest with 0X in standardPaymentReference', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '0X464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.messageIntegrityCode.length).to.be.equal(66);
  });
  it('should get 400 with random checkSourceAddresses', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: 'wdwd',
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with no checkSourceAddresses', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with no sourceAddressesRoot', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with too long sourceAddressesRoot', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cca',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with too short sourceAddressesRoot', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with non hexadecimal characters in sourceAddressesRoot', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'yb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62fe',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with too long standardPaymentReference', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c1100',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with too short standardPaymentReference', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with non hexadecimal characters in standardPaymentReference', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          'y000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with negative amount', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '-1',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with nonnumber amount', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: 'a',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with empty destinationAddressHash', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: '',
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with non negative deadlineTimestamp', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '-1',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with non number deadlineTimestamp', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: 'a',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with non number deadlineBlockNumber', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: 'ys',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with negative deadlineBlockNumber', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '-1',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with negative minimalBlockNumber', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '-1',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with non number minimalBlockNumber', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '-ad',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with no requestBody', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {},
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with no payload', async () => {
    const payload = {};
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get abiEncodedRequest with 0X in attestationType', async () => {
    const payload = {
      attestationType:
        '0X5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.messageIntegrityCode.length).to.be.equal(66);
  });
  it('should get abiEncodedRequest with 0X in sourceId', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0X7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.messageIntegrityCode.length).to.be.equal(66);
  });
  it('should get abiEncodedRequest with no 0x in sourceId', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.messageIntegrityCode.length).to.be.equal(66);
  });
  it('should get abiEncodedRequest with no 0x in attestationType', async () => {
    const payload = {
      attestationType:
        '5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.messageIntegrityCode.length).to.be.equal(66);
  });
  it('should get abiEncodedRequest with 0x before sourceAddressesRoot', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '0x7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.messageIntegrityCode.length).to.be.equal(66);
  });
  it('should get abiEncodedRequest with 0X before sourceAddressesRoot', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '2882022',
        deadlineBlockNumber: '2882130',
        deadlineTimestamp: '1733476340',
        destinationAddressHash: standardAddressHash(
          'rw33QqCywPVJRqJTmL1UYHqKPCxNC7eT6T',
        ),
        amount: '5146300010',
        standardPaymentReference:
          '464250526641000100000000000000000000000000000000000000000006c110',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '0X7006716ece630ed05048e9f87debac44c23292fbd9b022942321e9a78e4255cc',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.messageIntegrityCode.length).to.be.equal(66);
  });
});
