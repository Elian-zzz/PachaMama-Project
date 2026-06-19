-- Migration: Convert quantity columns to NUMERIC to allow decimal quantities
-- Run with psql or via Supabase SQL editor

BEGIN;

-- pedido_items: cantidad may currently be integer; convert to numeric
ALTER TABLE IF EXISTS pedido_items
  ALTER COLUMN cantidad TYPE numeric USING (cantidad::numeric);

-- stock_movimientos: cantidad may currently be integer; convert to numeric
ALTER TABLE IF EXISTS stock_movimientos
  ALTER COLUMN cantidad TYPE numeric USING (cantidad::numeric);

COMMIT;

-- Notes:
-- 1) Review constraints/triggers that depend on integer type.
-- 2) Back up your database before running migrations.
