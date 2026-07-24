import os
from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

try:
    import psycopg
except ImportError:  # pragma: no cover
    psycopg = None


def _normalize_database_url(raw_url: str) -> str:
    # SQLAlchemy defaults postgresql:// to psycopg2; force psycopg v3 driver.
    if raw_url.startswith("postgresql://") and not raw_url.startswith("postgresql+psycopg://"):
        return raw_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return raw_url


_raw_db_url = os.getenv("DATABASE_URL") or os.getenv("DATABASE_URL_DOCKER")
if not _raw_db_url:
    _raw_db_url = "postgresql://postgres:postgresdb@my-postgres:5432/goldsavings"

DATABASE_URL = _normalize_database_url(_raw_db_url)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)

Base = declarative_base()


def get_database_url() -> str:
    return (os.getenv("DATABASE_URL") or os.getenv("DATABASE_URL_DOCKER") or "").strip()


@contextmanager
def get_connection():
    database_url = get_database_url()
    if not database_url:
        raise RuntimeError("DATABASE_URL is required")

    if psycopg is None:
        raise RuntimeError("psycopg is not installed")

    connection = psycopg.connect(database_url)
    try:
        yield connection
    finally:
        connection.close()


def init_database() -> None:
    with get_connection() as connection:
        cursor = connection.cursor()
        try:
            cursor.execute(
                """
-- SUPABASE DATABASE DESIGN --

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- TABLE Profiles: User Profiles 
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NULL,
    phone TEXT NULL,
    currency TEXT NULL DEFAULT 'VND',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Example of Profile Insertion:
-- INSERT INTO profiles (id, full_name, phone, currency) VALUES ('user-uuid', 'John Doe', '1234567890', 'USD');

CREATE TABLE IF NOT EXISTS gold_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL UNIQUE, -- # GOLD-RING-24K-001
    brand TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_type TEXT NOT NULL, -- # RING, BAR, NECKLACE, BRACELET, EARRING, COIN, PENDANT, OTHER
    purity TEXT NOT NULL DEFAULT '24k', -- # 24k, 22k, 18k, 14k, 10k, 9k
    weight NUMERIC(18, 2) NOT NULL, -- # 9999.0
    weight_unit TEXT NOT NULL DEFAULT 'mace' -- # mace, gram, ounce
);

-- Example of gold_products Insertion:
-- INSERT INTO gold_products (sku, brand, product_name, product_type, purity, weight, weight_unit) 
-- VALUES ('GOLD-RING-24K-001', 'BrandName', 'ProductName', 'RING', '24k', 9999.0, 'mace');

CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NULL,
    website TEXT NULL,
    latitude NUMERIC(10, 6) NULL,
    longitude NUMERIC(10, 6) NULL,
    opening_time TIME NULL,
    closing_time TIME NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Example of stores Insertion:
-- INSERT INTO stores (name, address, city, phone, email, website, latitude, longitude, opening_time, closing_time) 
-- VALUES ('StoreName', '123 Main St', 'CityName', '1234567890', 'email@example.com', 'www.example.com', 10.123456, 20.123456, '09:00:00', '18:00:00');

CREATE TABLE IF NOT EXISTS scheduled_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    dispatched_at TIMESTAMPTZ NULL
);

-- Example of scheduled_notifications Insertion:
-- INSERT INTO scheduled_notifications (title, message, scheduled_for) 
-- VALUES ('Notification Title', 'Notification Message', '2024-06-01 10:00:00');

CREATE TABLE IF NOT EXISTS gold_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    account_name TEXT NULL,
    target_amount NUMERIC(18, 2) NULL,
    target_weight NUMERIC(18, 2) NULL,
    target_weight_unit TEXT NULL DEFAULT 'mace',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Example of gold_accounts Insertion:
-- INSERT INTO gold_accounts (user_id, account_name, target_amount, target_weight, target_weight_unit) 
-- VALUES ('user-uuid', 'My Gold Account', 10000.0, 10.0, 'mace');

CREATE TABLE IF NOT EXISTS gold_prices (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    gold_product_id UUID NOT NULL REFERENCES gold_products(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    price_time TIMESTAMPTZ NOT NULL,
    buy_price NUMERIC(18, 2) NOT NULL,
    sell_price NUMERIC(18, 2) NOT NULL
);

-- Example of gold_prices Insertion:
-- INSERT INTO gold_prices (gold_product_id, store_id, price_time, buy_price, sell_price) 
-- VALUES ('gold-product-uuid', 'store-uuid', '2024-06-01 10:00:00', 1000.0, 1100.0);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES gold_accounts(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL,
    cash_amount NUMERIC(18, 2) NOT NULL,
    gold_price NUMERIC(18, 2) NOT NULL,
    unit TEXT NOT NULL DEFAULT 'mace',
    note TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Example of transactions Insertion:
-- INSERT INTO transactions (account_id, transaction_type, cash_amount, gold_price, unit, note) 
-- VALUES ('account-uuid', 'buy', 1000.0, 50.0, 'mace', 'Initial deposit');

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    scheduled_notification_id UUID NULL REFERENCES scheduled_notifications(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ NULL
);

-- Example of notifications Insertion:
-- INSERT INTO notifications (user_id, title, message, scheduled_notification_id) 
-- VALUES ('user-uuid', 'Notification Title', 'Notification Message', 'scheduled-notification-uuid');

CREATE TABLE IF NOT EXISTS notification_push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'expo',
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Example of notification_push_tokens Insertion:
-- INSERT INTO notification_push_tokens (user_id, provider, token) 
-- VALUES ('user-uuid', 'expo', 'push-token-uuid');

CREATE TABLE IF NOT EXISTS favourite_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, store_id)
);

-- Example of favourite_stores Insertion:
-- INSERT INTO favourite_stores (user_id, store_id) 
-- VALUES ('user-uuid', 'store-uuid');

CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES gold_accounts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    reminder_type TEXT NOT NULL DEFAULT 'one-time', -- # one-time, recurring
    reminder_time TIMESTAMPTZ NOT NULL,
    recurrence_pattern TEXT NULL, -- # daily, weekly, monthly, yearly
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Example of reminders Insertion:
-- INSERT INTO reminders (user_id, account_id, title, message, reminder_type, reminder_time, recurrence_pattern) 
-- VALUES ('user-uuid', 'account-uuid', 'Reminder Title', 'Reminder Message', 'one-time', '2024-06-01 10:00:00', NULL);

-- CREATE OR REPLACE VIEW transaction_store AS
-- SELECT DISTINCT ON (gp.store_id, gp.gold_product_id)
--     gp.id AS gold_price_id,
--     s.id AS store_id,
--     s.name AS store_name,
--     s.address,
--     s.city,
--     s.phone,
--     s.latitude,
--     s.longitude,
--     p.id AS gold_product_id,
--     p.sku,
--     p.brand,
--     p.product_name,
--     p.product_type,
--     p.purity,
--     p.weight,
--     p.weight_unit,
--     gp.price_time,
--     gp.buy_price,
--     gp.sell_price
-- FROM gold_prices gp
-- JOIN stores s ON s.id = gp.store_id
-- JOIN gold_products p ON p.id = gp.gold_product_id
-- WHERE s.active = TRUE
-- ORDER BY gp.store_id, gp.gold_product_id, gp.price_time DESC;

CREATE INDEX IF NOT EXISTS idx_gold_accounts_user
    ON gold_accounts (user_id);

CREATE INDEX IF NOT EXISTS idx_gold_prices_product_store_time
    ON gold_prices (gold_product_id, store_id, price_time DESC);

CREATE INDEX IF NOT EXISTS idx_gold_prices_store_time
    ON gold_prices (store_id, price_time DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_account_created
    ON transactions (account_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_goals_account_active
    ON goals (account_id, is_active);

CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_pending_time
    ON scheduled_notifications (status, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
    ON notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_scheduled
    ON notifications (scheduled_notification_id);

CREATE INDEX IF NOT EXISTS idx_notification_push_tokens_user
    ON notification_push_tokens (user_id);

CREATE INDEX IF NOT EXISTS idx_favourite_stores_store
    ON favourite_stores (store_id);

CREATE INDEX IF NOT EXISTS idx_reminders_user_time
    ON reminders (user_id, reminder_time);

CREATE INDEX IF NOT EXISTS idx_reminders_account_time
    ON reminders (account_id, reminder_time);
                """
            )
            connection.commit()
        finally:
            cursor.close()

#id, name, address, phone, culture, note
