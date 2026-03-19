-- Migration 002: Add users table for account management

CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    CHECK (role IN ('user', 'admin'))
);

-- Index for fast email lookup (used during login)
CREATE INDEX idx_users_email ON users(email);
