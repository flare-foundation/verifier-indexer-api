import { IXrpGetTransactionRes, XrpTransaction } from '@flarenetwork/mcc';
import { expect } from 'chai';
import { xrpPaymentReference } from '../../src/verification/balance-decreasing-transaction/balance-decreasing-transaction';

const MEMO = '4642505266410001000000000000000000000000000000000000000000000001';
const ZERO = '0x' + '0'.repeat(64);
const ACTIVATION = 1_000;

function makeTx(result: Record<string, unknown>): XrpTransaction {
  return new XrpTransaction({
    result: {
      Account: 'rBBUxL9d68WF6pxEczcfNCY4fNqtDPC8be',
      Destination: 'rLe7NgT7GhbLGJ7RUfrH7zQezutWyNU3Md',
      Fee: '12',
      Flags: 0,
      Memos: [{ Memo: { MemoData: MEMO } }],
      hash: 'AAAA000000000000000000000000000000000000000000000000000000000001',
      meta: {
        AffectedNodes: [],
        TransactionIndex: 0,
        TransactionResult: 'tesSUCCESS',
      },
      ...result,
    },
  } as unknown as IXrpGetTransactionRes);
}

const nativePayment = makeTx({ TransactionType: 'Payment', Amount: '1000000' });
const crossCurrencyPayment = makeTx({
  TransactionType: 'Payment',
  Amount: '1000000',
  SendMax: {
    currency: 'USD',
    issuer: 'rBBUxL9d68WF6pxEczcfNCY4fNqtDPC8be',
    value: '1',
  },
});
const escrow = makeTx({ TransactionType: 'EscrowCreate', Amount: '1000000' });

describe('xrpPaymentReference', () => {
  describe('before activation', () => {
    const txTime = ACTIVATION - 1;
    it('keeps the memo of a native payment', () => {
      expect(xrpPaymentReference(nativePayment, txTime, ACTIVATION)).to.equal(
        '0x' + MEMO,
      );
    });
    it('keeps the memo of a cross-currency payment, as mcc 4.5.0 does', () => {
      expect(
        xrpPaymentReference(crossCurrencyPayment, txTime, ACTIVATION),
      ).to.equal('0x' + MEMO);
    });
    it('drops the memo of a non-payment', () => {
      expect(xrpPaymentReference(escrow, txTime, ACTIVATION)).to.equal(ZERO);
    });
  });

  describe('from activation', () => {
    for (const txTime of [ACTIVATION, ACTIVATION + 1]) {
      it(`keeps the memo of a native payment at transaction time ${txTime}`, () => {
        expect(xrpPaymentReference(nativePayment, txTime, ACTIVATION)).to.equal(
          '0x' + MEMO,
        );
      });
      it(`drops the memo of a cross-currency payment at transaction time ${txTime}`, () => {
        expect(
          xrpPaymentReference(crossCurrencyPayment, txTime, ACTIVATION),
        ).to.equal(ZERO);
      });
      it(`drops the memo of a non-payment at transaction time ${txTime}`, () => {
        expect(xrpPaymentReference(escrow, txTime, ACTIVATION)).to.equal(ZERO);
      });
    }
  });
});
