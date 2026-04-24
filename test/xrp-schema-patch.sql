-- Applied to XRP testnet snapshots whose dump predates the current XRP entity
-- schema. Idempotent; safe to re-run. Once dumps are regenerated, delete this
-- and the apply-patch logic in test/setup-db.sh and .gitlab-ci.yml.
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS sequence bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ticket_sequence bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS source_address varchar(64) DEFAULT '',
  ADD COLUMN IF NOT EXISTS first_memo_data_hash varchar(64) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS destination_tag integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS transaction_status boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS intended_receiving_amount bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS destination_address_hash varchar(64) DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_source_sequence ON transactions (source_address, sequence);
CREATE INDEX IF NOT EXISTS transactions_first_memo_data_hash_idx ON transactions (first_memo_data_hash);
CREATE INDEX IF NOT EXISTS transactions_destination_tag_idx ON transactions (destination_tag);
CREATE INDEX IF NOT EXISTS transactions_transaction_status_idx ON transactions (transaction_status);
CREATE INDEX IF NOT EXISTS idx_payref_block ON transactions (payment_reference, block_number, intended_receiving_amount);
CREATE INDEX IF NOT EXISTS idx_dest_block ON transactions (destination_address_hash, block_number, intended_receiving_amount);
