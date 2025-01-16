import {
    standardAddressHash
} from '@flarenetwork/mcc';
import { expect } from "chai";
import * as request from "supertest";
import { app } from "../helper";


describe("/ReferencedPaymentNonexistence/mic", () => {
    it("should get abiEncodedRequest", async () => {
        // https://blockexplorer.one/dogecoin/testnet/tx/b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310000000000",
                standardPaymentReference: "46425052664100010000000000000000000000000000000000000000001c1e87",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get abiEncodedRequest", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.messageIntegrityCode.length).to.be.equal(66);
    });
    it("should get 400 with checkSourceAddresses=false and random sourceAddressesRoot", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: false,
                sourceAddressesRoot: "dfe.fewf. .wef.wef .wew3=E#(/ R89 "
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with checkSourceAddresses=false and no sourceAddressesRoot", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: false,
                sourceAddressesRoot: ""
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get invalid status with zero standardPaymentReference", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000000",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('INVALID');
    });
    it("should get abiEncodedRequest with 0x in standardPaymentReference", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0x0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.messageIntegrityCode.length).to.be.equal(66);
    });
    it("should get abiEncodedRequest with 0X in standardPaymentReference", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0X0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.messageIntegrityCode.length).to.be.equal(66);
    });
    it("should get 400 with random checkSourceAddresses", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: "wdwd",
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with no checkSourceAddresses", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with no sourceAddressesRoot", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with too long sourceAddressesRoot", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6aa"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with too short sourceAddressesRoot", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with non hexadecimal characters in sourceAddressesRoot", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "yb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62fe"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with too long standardPaymentReference", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "00000000000000000000000000000000000000000000000000000000000000010",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with too short standardPaymentReference", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with non hexadecimal characters in standardPaymentReference", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "y000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with negative amount", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "-1",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with nonnumber amount", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "a",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with empty destinationAddressHash", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: "",
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with non negative deadlineTimestamp", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "-1",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with non number deadlineTimestamp", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "a",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with non number deadlineBlockNumber", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "ys",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with negative deadlineBlockNumber", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "-1",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with negative minimalBlockNumber", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "-1",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with non number minimalBlockNumber", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "-ad",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with no requestBody", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {}
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with no payload", async () => {
        const payload = {}
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get abiEncodedRequest with 0X in attestationType", async () => {
        const payload = {
            attestationType: "0X5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.messageIntegrityCode.length).to.be.equal(66);
    });
    it("should get abiEncodedRequest with 0X in sourceId", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0X74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.messageIntegrityCode.length).to.be.equal(66);
    });
    it("should get abiEncodedRequest with no 0x in sourceId", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.messageIntegrityCode.length).to.be.equal(66);
    });
    it("should get abiEncodedRequest with no 0x in attestationType", async () => {
        const payload = {
            attestationType: "5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.messageIntegrityCode.length).to.be.equal(66);
    });
    it("should get abiEncodedRequest with 0x before sourceAddressesRoot", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "0xa91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.messageIntegrityCode.length).to.be.equal(66);
    });
    it("should get abiEncodedRequest with 0X before sourceAddressesRoot", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "6724532",
                deadlineBlockNumber: "6724583",
                deadlineTimestamp: "1732810320",
                destinationAddressHash: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "0Xa91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.messageIntegrityCode.length).to.be.equal(66);
    });
});




