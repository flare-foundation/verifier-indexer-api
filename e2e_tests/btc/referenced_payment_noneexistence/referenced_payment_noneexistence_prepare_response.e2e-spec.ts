import { standardAddressHash } from '@flarenetwork/mcc';
import { expect } from 'chai';
import * as request from 'supertest';
import { app } from '../helper';

describe('/ReferencedPaymentNonexistence/prepareResponse', () => {
  it('should get abiEncodedRequest', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '3490154',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.response.attestationType).to.be.equal(
      '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
    );
    expect(response.body.response.sourceId).to.be.equal(
      '0x7465737442544300000000000000000000000000000000000000000000000000',
    );
    expect(response.body.response.votingRound).to.be.equal('0');
    expect(response.body.response.lowestUsedTimestamp).to.be.equal(
      '1732779896',
    );
    expect(response.body.response.requestBody.minimalBlockNumber).to.be.equal(
      '3490151',
    );
    expect(response.body.response.requestBody.deadlineBlockNumber).to.be.equal(
      '3490154',
    );
    expect(response.body.response.requestBody.deadlineTimestamp).to.be.equal(
      '1732779897',
    );
    expect(
      response.body.response.requestBody.destinationAddressHash,
    ).to.be.equal(standardAddressHash('n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX'));
    expect(response.body.response.requestBody.amount).to.be.equal('5146310');
    expect(
      response.body.response.requestBody.standardPaymentReference,
    ).to.be.equal(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    );
    expect(response.body.response.requestBody.checkSourceAddresses).to.be.equal(
      true,
    );
    expect(response.body.response.requestBody.sourceAddressesRoot).to.be.equal(
      '0xcb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
    );
    expect(
      response.body.response.responseBody.minimalBlockTimestamp,
    ).to.be.equal('3490151');
    expect(
      response.body.response.responseBody.firstOverflowBlockNumber,
    ).to.be.equal('3490156');
    expect(
      response.body.response.responseBody.firstOverflowBlockTimestamp,
    ).to.be.equal('1732779898');
  });
  it.skip('should get abiEncodedRequest with checkSourceAddresses=false and random sourceAddressesRoot', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '3490154',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: false,
        sourceAddressesRoot: 'dfe.fewf. .wef.wef .wew3=E#(/ R89 ',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(
      '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
    );
    expect(response.body.response.sourceId).to.be.equal(
      '0x7465737442544300000000000000000000000000000000000000000000000000',
    );
    expect(response.body.response.votingRound).to.be.equal('0');
    expect(response.body.response.lowestUsedTimestamp).to.be.equal(
      '1732779896',
    );
    expect(response.body.response.requestBody.minimalBlockNumber).to.be.equal(
      '3490151',
    );
    expect(response.body.response.requestBody.deadlineBlockNumber).to.be.equal(
      '3490154',
    );
    expect(response.body.response.requestBody.deadlineTimestamp).to.be.equal(
      '1732779897',
    );
    expect(
      response.body.response.requestBody.destinationAddressHash,
    ).to.be.equal(standardAddressHash('n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX'));
    expect(response.body.response.requestBody.amount).to.be.equal('5146310');
    expect(
      response.body.response.requestBody.standardPaymentReference,
    ).to.be.equal(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    );
    expect(response.body.response.requestBody.checkSourceAddresses).to.be.equal(
      true,
    );
    expect(response.body.response.requestBody.sourceAddressesRoot).to.be.equal(
      '0xcb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
    );
    expect(
      response.body.response.responseBody.minimalBlockTimestamp,
    ).to.be.equal('3490151');
    expect(
      response.body.response.responseBody.firstOverflowBlockNumber,
    ).to.be.equal('3490156');
    expect(
      response.body.response.responseBody.firstOverflowBlockTimestamp,
    ).to.be.equal('1732779898');
  });
  it.skip('should get abiEncodedRequest with checkSourceAddresses=false and empty sourceAddressesRoot', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '3490154',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: false,
        sourceAddressesRoot: '',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(
      '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
    );
    expect(response.body.response.sourceId).to.be.equal(
      '0x7465737442544300000000000000000000000000000000000000000000000000',
    );
    expect(response.body.response.votingRound).to.be.equal('0');
    expect(response.body.response.lowestUsedTimestamp).to.be.equal(
      '1732779896',
    );
    expect(response.body.response.requestBody.minimalBlockNumber).to.be.equal(
      '3490151',
    );
    expect(response.body.response.requestBody.deadlineBlockNumber).to.be.equal(
      '3490154',
    );
    expect(response.body.response.requestBody.deadlineTimestamp).to.be.equal(
      '1732779897',
    );
    expect(
      response.body.response.requestBody.destinationAddressHash,
    ).to.be.equal(standardAddressHash('n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX'));
    expect(response.body.response.requestBody.amount).to.be.equal('5146310');
    expect(
      response.body.response.requestBody.standardPaymentReference,
    ).to.be.equal(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    );
    expect(response.body.response.requestBody.checkSourceAddresses).to.be.equal(
      true,
    );
    expect(response.body.response.requestBody.sourceAddressesRoot).to.be.equal(
      '0xcb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
    );
    expect(
      response.body.response.responseBody.minimalBlockTimestamp,
    ).to.be.equal('3490151');
    expect(
      response.body.response.responseBody.firstOverflowBlockNumber,
    ).to.be.equal('3490156');
    expect(
      response.body.response.responseBody.firstOverflowBlockTimestamp,
    ).to.be.equal('1732779898');
  });
  it('should get invalid status with zero standardPaymentReference', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '340156',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000000',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('INVALID');
  });
  it('should get abiEncodedRequest with 0x in standardPaymentReference', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '3490154',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(
      '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
    );
    expect(response.body.response.sourceId).to.be.equal(
      '0x7465737442544300000000000000000000000000000000000000000000000000',
    );
    expect(response.body.response.votingRound).to.be.equal('0');
    expect(response.body.response.lowestUsedTimestamp).to.be.equal(
      '1732779896',
    );
    expect(response.body.response.requestBody.minimalBlockNumber).to.be.equal(
      '3490151',
    );
    expect(response.body.response.requestBody.deadlineBlockNumber).to.be.equal(
      '3490154',
    );
    expect(response.body.response.requestBody.deadlineTimestamp).to.be.equal(
      '1732779897',
    );
    expect(
      response.body.response.requestBody.destinationAddressHash,
    ).to.be.equal(standardAddressHash('n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX'));
    expect(response.body.response.requestBody.amount).to.be.equal('5146310');
    expect(
      response.body.response.requestBody.standardPaymentReference,
    ).to.be.equal(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    );
    expect(response.body.response.requestBody.checkSourceAddresses).to.be.equal(
      true,
    );
    expect(response.body.response.requestBody.sourceAddressesRoot).to.be.equal(
      '0xcb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
    );
    expect(
      response.body.response.responseBody.minimalBlockTimestamp,
    ).to.be.equal('3490151');
    expect(
      response.body.response.responseBody.firstOverflowBlockNumber,
    ).to.be.equal('3490156');
    expect(
      response.body.response.responseBody.firstOverflowBlockTimestamp,
    ).to.be.equal('1732779898');
  });
  it('should get abiEncodedRequest with 0X in standardPaymentReference', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '3490154',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0X0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(
      '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
    );
    expect(response.body.response.sourceId).to.be.equal(
      '0x7465737442544300000000000000000000000000000000000000000000000000',
    );
    expect(response.body.response.votingRound).to.be.equal('0');
    expect(response.body.response.lowestUsedTimestamp).to.be.equal(
      '1732779896',
    );
    expect(response.body.response.requestBody.minimalBlockNumber).to.be.equal(
      '3490151',
    );
    expect(response.body.response.requestBody.deadlineBlockNumber).to.be.equal(
      '3490154',
    );
    expect(response.body.response.requestBody.deadlineTimestamp).to.be.equal(
      '1732779897',
    );
    expect(
      response.body.response.requestBody.destinationAddressHash,
    ).to.be.equal(standardAddressHash('n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX'));
    expect(response.body.response.requestBody.amount).to.be.equal('5146310');
    expect(
      response.body.response.requestBody.standardPaymentReference,
    ).to.be.equal(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    );
    expect(response.body.response.requestBody.checkSourceAddresses).to.be.equal(
      true,
    );
    expect(response.body.response.requestBody.sourceAddressesRoot).to.be.equal(
      '0xcb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
    );
    expect(
      response.body.response.responseBody.minimalBlockTimestamp,
    ).to.be.equal('3490151');
    expect(
      response.body.response.responseBody.firstOverflowBlockNumber,
    ).to.be.equal('3490156');
    expect(
      response.body.response.responseBody.firstOverflowBlockTimestamp,
    ).to.be.equal('1732779898');
  });
  it('should get 400 with random checkSourceAddresses', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '340156',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: 'wdwd',
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '340156',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '340156',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '340156',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feba',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '340156',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62fe',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '340156',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'yb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62fe',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '340156',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '00000000000000000000000000000000000000000000000000000000000000010',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '340156',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '340156',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          'y000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '340156',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '-1',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '340156',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: 'a',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '340156',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: '',
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '340156',
        deadlineTimestamp: '-1',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '340156',
        deadlineTimestamp: 'a',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: 'ys',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '-1',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '-1',
        deadlineBlockNumber: '340156',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '-ad',
        deadlineBlockNumber: '340156',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {},
    };
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with no payload', async () => {
    const payload = {};
    await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '3490154',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(
      '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
    );
    expect(response.body.response.sourceId).to.be.equal(
      '0x7465737442544300000000000000000000000000000000000000000000000000',
    );
    expect(response.body.response.votingRound).to.be.equal('0');
    expect(response.body.response.lowestUsedTimestamp).to.be.equal(
      '1732779896',
    );
    expect(response.body.response.requestBody.minimalBlockNumber).to.be.equal(
      '3490151',
    );
    expect(response.body.response.requestBody.deadlineBlockNumber).to.be.equal(
      '3490154',
    );
    expect(response.body.response.requestBody.deadlineTimestamp).to.be.equal(
      '1732779897',
    );
    expect(
      response.body.response.requestBody.destinationAddressHash,
    ).to.be.equal(standardAddressHash('n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX'));
    expect(response.body.response.requestBody.amount).to.be.equal('5146310');
    expect(
      response.body.response.requestBody.standardPaymentReference,
    ).to.be.equal(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    );
    expect(response.body.response.requestBody.checkSourceAddresses).to.be.equal(
      true,
    );
    expect(response.body.response.requestBody.sourceAddressesRoot).to.be.equal(
      '0xcb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
    );
    expect(
      response.body.response.responseBody.minimalBlockTimestamp,
    ).to.be.equal('3490151');
    expect(
      response.body.response.responseBody.firstOverflowBlockNumber,
    ).to.be.equal('3490156');
    expect(
      response.body.response.responseBody.firstOverflowBlockTimestamp,
    ).to.be.equal('1732779898');
  });
  it('should get abiEncodedRequest with 0X in sourceId', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0X7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '3490154',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(
      '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
    );
    expect(response.body.response.sourceId).to.be.equal(
      '0x7465737442544300000000000000000000000000000000000000000000000000',
    );
    expect(response.body.response.votingRound).to.be.equal('0');
    expect(response.body.response.lowestUsedTimestamp).to.be.equal(
      '1732779896',
    );
    expect(response.body.response.requestBody.minimalBlockNumber).to.be.equal(
      '3490151',
    );
    expect(response.body.response.requestBody.deadlineBlockNumber).to.be.equal(
      '3490154',
    );
    expect(response.body.response.requestBody.deadlineTimestamp).to.be.equal(
      '1732779897',
    );
    expect(
      response.body.response.requestBody.destinationAddressHash,
    ).to.be.equal(standardAddressHash('n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX'));
    expect(response.body.response.requestBody.amount).to.be.equal('5146310');
    expect(
      response.body.response.requestBody.standardPaymentReference,
    ).to.be.equal(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    );
    expect(response.body.response.requestBody.checkSourceAddresses).to.be.equal(
      true,
    );
    expect(response.body.response.requestBody.sourceAddressesRoot).to.be.equal(
      '0xcb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
    );
    expect(
      response.body.response.responseBody.minimalBlockTimestamp,
    ).to.be.equal('3490151');
    expect(
      response.body.response.responseBody.firstOverflowBlockNumber,
    ).to.be.equal('3490156');
    expect(
      response.body.response.responseBody.firstOverflowBlockTimestamp,
    ).to.be.equal('1732779898');
  });
  it('should get abiEncodedRequest with no 0x in sourceId', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '3490154',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(
      '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
    );
    expect(response.body.response.sourceId).to.be.equal(
      '0x7465737442544300000000000000000000000000000000000000000000000000',
    );
    expect(response.body.response.votingRound).to.be.equal('0');
    expect(response.body.response.lowestUsedTimestamp).to.be.equal(
      '1732779896',
    );
    expect(response.body.response.requestBody.minimalBlockNumber).to.be.equal(
      '3490151',
    );
    expect(response.body.response.requestBody.deadlineBlockNumber).to.be.equal(
      '3490154',
    );
    expect(response.body.response.requestBody.deadlineTimestamp).to.be.equal(
      '1732779897',
    );
    expect(
      response.body.response.requestBody.destinationAddressHash,
    ).to.be.equal(standardAddressHash('n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX'));
    expect(response.body.response.requestBody.amount).to.be.equal('5146310');
    expect(
      response.body.response.requestBody.standardPaymentReference,
    ).to.be.equal(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    );
    expect(response.body.response.requestBody.checkSourceAddresses).to.be.equal(
      true,
    );
    expect(response.body.response.requestBody.sourceAddressesRoot).to.be.equal(
      '0xcb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
    );
    expect(
      response.body.response.responseBody.minimalBlockTimestamp,
    ).to.be.equal('3490151');
    expect(
      response.body.response.responseBody.firstOverflowBlockNumber,
    ).to.be.equal('3490156');
    expect(
      response.body.response.responseBody.firstOverflowBlockTimestamp,
    ).to.be.equal('1732779898');
  });
  it('should get abiEncodedRequest with no 0x in attestationType', async () => {
    const payload = {
      attestationType:
        '5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '3490154',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          'cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(
      '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
    );
    expect(response.body.response.sourceId).to.be.equal(
      '0x7465737442544300000000000000000000000000000000000000000000000000',
    );
    expect(response.body.response.votingRound).to.be.equal('0');
    expect(response.body.response.lowestUsedTimestamp).to.be.equal(
      '1732779896',
    );
    expect(response.body.response.requestBody.minimalBlockNumber).to.be.equal(
      '3490151',
    );
    expect(response.body.response.requestBody.deadlineBlockNumber).to.be.equal(
      '3490154',
    );
    expect(response.body.response.requestBody.deadlineTimestamp).to.be.equal(
      '1732779897',
    );
    expect(
      response.body.response.requestBody.destinationAddressHash,
    ).to.be.equal(standardAddressHash('n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX'));
    expect(response.body.response.requestBody.amount).to.be.equal('5146310');
    expect(
      response.body.response.requestBody.standardPaymentReference,
    ).to.be.equal(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    );
    expect(response.body.response.requestBody.checkSourceAddresses).to.be.equal(
      true,
    );
    expect(response.body.response.requestBody.sourceAddressesRoot).to.be.equal(
      '0xcb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
    );
    expect(
      response.body.response.responseBody.minimalBlockTimestamp,
    ).to.be.equal('3490151');
    expect(
      response.body.response.responseBody.firstOverflowBlockNumber,
    ).to.be.equal('3490156');
    expect(
      response.body.response.responseBody.firstOverflowBlockTimestamp,
    ).to.be.equal('1732779898');
  });
  it('should get abiEncodedRequest with 0x before sourceAddressesRoot', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '3490154',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '0xcb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(
      '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
    );
    expect(response.body.response.sourceId).to.be.equal(
      '0x7465737442544300000000000000000000000000000000000000000000000000',
    );
    expect(response.body.response.votingRound).to.be.equal('0');
    expect(response.body.response.lowestUsedTimestamp).to.be.equal(
      '1732779896',
    );
    expect(response.body.response.requestBody.minimalBlockNumber).to.be.equal(
      '3490151',
    );
    expect(response.body.response.requestBody.deadlineBlockNumber).to.be.equal(
      '3490154',
    );
    expect(response.body.response.requestBody.deadlineTimestamp).to.be.equal(
      '1732779897',
    );
    expect(
      response.body.response.requestBody.destinationAddressHash,
    ).to.be.equal(standardAddressHash('n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX'));
    expect(response.body.response.requestBody.amount).to.be.equal('5146310');
    expect(
      response.body.response.requestBody.standardPaymentReference,
    ).to.be.equal(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    );
    expect(response.body.response.requestBody.checkSourceAddresses).to.be.equal(
      true,
    );
    expect(response.body.response.requestBody.sourceAddressesRoot).to.be.equal(
      '0xcb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
    );
    expect(
      response.body.response.responseBody.minimalBlockTimestamp,
    ).to.be.equal('3490151');
    expect(
      response.body.response.responseBody.firstOverflowBlockNumber,
    ).to.be.equal('3490156');
    expect(
      response.body.response.responseBody.firstOverflowBlockTimestamp,
    ).to.be.equal('1732779898');
  });
  it('should get abiEncodedRequest with 0X before sourceAddressesRoot', async () => {
    const payload = {
      attestationType:
        '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        minimalBlockNumber: '3490151',
        deadlineBlockNumber: '3490154',
        deadlineTimestamp: '1732779897',
        destinationAddressHash: standardAddressHash(
          'n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX',
        ),
        amount: '5146310',
        standardPaymentReference:
          '0000000000000000000000000000000000000000000000000000000000000001',
        checkSourceAddresses: true,
        sourceAddressesRoot:
          '0Xcb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ReferencedPaymentNonexistence/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(
      '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
    );
    expect(response.body.response.sourceId).to.be.equal(
      '0x7465737442544300000000000000000000000000000000000000000000000000',
    );
    expect(response.body.response.votingRound).to.be.equal('0');
    expect(response.body.response.lowestUsedTimestamp).to.be.equal(
      '1732779896',
    );
    expect(response.body.response.requestBody.minimalBlockNumber).to.be.equal(
      '3490151',
    );
    expect(response.body.response.requestBody.deadlineBlockNumber).to.be.equal(
      '3490154',
    );
    expect(response.body.response.requestBody.deadlineTimestamp).to.be.equal(
      '1732779897',
    );
    expect(
      response.body.response.requestBody.destinationAddressHash,
    ).to.be.equal(standardAddressHash('n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX'));
    expect(response.body.response.requestBody.amount).to.be.equal('5146310');
    expect(
      response.body.response.requestBody.standardPaymentReference,
    ).to.be.equal(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    );
    expect(response.body.response.requestBody.checkSourceAddresses).to.be.equal(
      true,
    );
    expect(response.body.response.requestBody.sourceAddressesRoot).to.be.equal(
      '0xcb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb',
    );
    expect(
      response.body.response.responseBody.minimalBlockTimestamp,
    ).to.be.equal('3490151');
    expect(
      response.body.response.responseBody.firstOverflowBlockNumber,
    ).to.be.equal('3490156');
    expect(
      response.body.response.responseBody.firstOverflowBlockTimestamp,
    ).to.be.equal('1732779898');
  });
});
