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
        minimalBlockNumber: '75488',
        deadlineBlockNumber: '75489',
        deadlineTimestamp: '123',
        destinationAddressHash: standardAddressHash(
          'tb1q8j7jvsdqxm5e27d48p4382xrq0emrncwfr35k4',
        ),
        amount: '0',
        standardPaymentReference:
          '0xbeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead',
        checkSourceAddresses: false,
        sourceAddressesRoot:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
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
      '1743506760',
    );
    expect(response.body.response.requestBody.minimalBlockNumber).to.be.equal(
      '75488',
    );
    expect(response.body.response.requestBody.deadlineBlockNumber).to.be.equal(
      '75489',
    );
    expect(response.body.response.requestBody.deadlineTimestamp).to.be.equal(
      '123',
    );
    expect(
      response.body.response.requestBody.destinationAddressHash,
    ).to.be.equal(
      '0x071f381ae61977662fffe7ca910b6d9634b8940517e8a56f885be36ce0ed67b5',
    );
    expect(response.body.response.requestBody.amount).to.be.equal('0');
    expect(
      response.body.response.requestBody.standardPaymentReference,
    ).to.be.equal(
      '0xbeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead',
    );
    expect(response.body.response.requestBody.checkSourceAddresses).to.be.equal(
      false,
    );
    expect(response.body.response.requestBody.sourceAddressesRoot).to.be.equal(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    );
    expect(
      response.body.response.responseBody.minimalBlockTimestamp,
    ).to.be.equal('1743506760');
    expect(
      response.body.response.responseBody.firstOverflowBlockNumber,
    ).to.be.equal('75490');
    expect(
      response.body.response.responseBody.firstOverflowBlockTimestamp,
    ).to.be.equal('1743507962');
  });
});
