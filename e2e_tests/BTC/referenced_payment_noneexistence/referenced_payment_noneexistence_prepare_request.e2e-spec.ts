import {
    standardAddressHash
} from '@flarenetwork/mcc';
import { expect } from "chai";
import * as request from "supertest";
import { app } from "../helper";


describe("/ReferencedPaymentNonexistence/prepareRequest", () => {
    it("should get abiEncodedRequest", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "3490154",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get abiEncodedRequest with checkSourceAddresses=false and random sourceAddressesRoot", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "3490154",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: false,
                sourceAddressesRoot: "dfe.fewf. .wef.wef .wew3=E#(/ R89 "
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get abiEncodedRequest with checkSourceAddresses=false and empty sourceAddressesRoot", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: false,
                sourceAddressesRoot: ""
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get invalid status with zero standardPaymentReference", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000000",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('INVALID');
    });
    it("should get abiEncodedRequest with 0x in standardPaymentReference", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0x0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get abiEncodedRequest with 0X in standardPaymentReference", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0X0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get 400 with random checkSourceAddresses", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: "wdwd",
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with no checkSourceAddresses", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with no sourceAddressesRoot", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with too long sourceAddressesRoot", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feba"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with too short sourceAddressesRoot", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62fe"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with non hexadecimal characters in sourceAddressesRoot", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "yb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62fe"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with too long standardPaymentReference", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "00000000000000000000000000000000000000000000000000000000000000010",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with too short standardPaymentReference", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with non hexadecimal characters in standardPaymentReference", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "y000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with negative amount", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "-1",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with nonnumber amount", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "a",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with empty destinationAddressHash", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: "",
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with non negative deadlineTimestamp", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "-1",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with non number deadlineTimestamp", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "a",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with non number deadlineBlockNumber", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "ys",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with negative deadlineBlockNumber", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "-1",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with negative minimalBlockNumber", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "-1",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with non number minimalBlockNumber", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "-ad",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with no requestBody", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {}
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with no payload", async () => {
        const payload = {}
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get abiEncodedRequest with 0X in attestationType", async () => {
        const payload = {
            attestationType: "0X5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get abiEncodedRequest with 0X in sourceId", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0X7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get abiEncodedRequest with no 0x in sourceId", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get abiEncodedRequest with no 0x in attestationType", async () => {
        const payload = {
            attestationType: "5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get abiEncodedRequest with 0x before sourceAddressesRoot", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "0xcb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get abiEncodedRequest with 0X before sourceAddressesRoot", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "340156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "0Xcb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get 200 as blocks from minimalBlockNumber to max(deadlineBlockNumber, deadlineTimestamp) are in db (test 1)", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "3490153",
                deadlineTimestamp: "0",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get 200 as blocks from minimalBlockNumber to max(deadlineBlockNumber, deadlineTimestamp) are in db (test 2)", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "1",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get 200 as blocks from minimalBlockNumber to the heighest block in db", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "3490156",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get 200 INDETERMINATE as minimalBlockNumber not in db", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490150",
                deadlineBlockNumber: "3490155",
                deadlineTimestamp: "1732779897",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('INDETERMINATE');
    });
    it("should get 200 INDETERMINATE as deadlineTimestamp not in db", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "3490155",
                deadlineTimestamp: "1732779900",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('INDETERMINATE');
    });
    it("should get 200 INDETERMINATE as deadlineBlockNumber not in db", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490151",
                deadlineBlockNumber: "3490157",
                deadlineTimestamp: "1732779900",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('INDETERMINATE');
    });
    it("should get 200 INVALID as minimalBlockNumber > max(deadlineBlockNumber,deadlineTimestamp)", async () => {
        const payload = {
            attestationType: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                minimalBlockNumber: "3490153",
                deadlineBlockNumber: "3490151",
                deadlineTimestamp: "1732779896",
                destinationAddressHash: standardAddressHash("n24Juz7LGy3uFFuZBggLw1eH1E9G19JrbX"),
                amount: "5146310",
                standardPaymentReference: "0000000000000000000000000000000000000000000000000000000000000001",
                checkSourceAddresses: true,
                sourceAddressesRoot: "cb59478070fabf8aef96f6ff20a05abb8e922601cd24f13a4fc876b35fa62feb"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('INDETERMINATE');
    });
});




