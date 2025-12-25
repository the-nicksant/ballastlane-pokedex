# Database Setup Guide

## Issue: better-sqlite3 Native Bindings

The `better-sqlite3` package requires native bindings to be compiled. By default, pnpm may skip build scripts for security reasons.

## Solution

### First-Time Setup

After cloning the repository and installing dependencies, you need to:

**1. Build better-sqlite3 native bindings:**
```bash
cd node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3
npm run build-release
cd ../../../..
```

**2. Initialize the database:**
```bash
pnpm db:init
```

This will:
- Create the SQLite database file at `./data/database.sqlite`
- Run all migrations
- Seed the admin user (username: `admin`, password: `admin`)

### Automated Setup (Recommended)

The `postinstall` script in `package.json` automatically builds better-sqlite3 when you run `pnpm install`. However, if you encounter issues, you can manually rebuild.

## Available Database Scripts

### `pnpm db:init`
Initialize the database (create tables, seed admin user)

### `pnpm db:reset`
Delete the database and reinitialize (fresh start)

```bash
pnpm db:reset
```

## Database Files

After initialization, you'll have:

```
data/
├── database.sqlite       # Main database file
├── database.sqlite-shm   # Shared memory file (WAL mode)
└── database.sqlite-wal   # Write-Ahead Log file
```

**Note**: These files are in `.gitignore` and won't be committed to version control.

## Manual Build (If Needed)

If you encounter errors about missing bindings:

```bash
# Option 1: Rebuild better-sqlite3
pnpm rebuild better-sqlite3

# Option 2: Manual build
cd node_modules/.pnpm/better-sqlite3@12.5.0/node_modules/better-sqlite3
npm run build-release
```

## Verification

Check if the database was created successfully:

```bash
ls -lh data/
# Should show database.sqlite and related files

# Or use the init script which checks the database:
pnpm db:init
```

Expected output:
```
✅ Database connected successfully
✅ Found 1 user(s) in database
✅ Admin user exists
```

## Troubleshooting

### Error: "Could not locate the bindings file"

**Cause**: better-sqlite3 native bindings not compiled

**Fix**:
```bash
cd node_modules/.pnpm/better-sqlite3@12.5.0/node_modules/better-sqlite3
npm run build-release
cd ../../../..
pnpm db:init
```

### Error: "Database file not found"

**Cause**: Database not initialized

**Fix**:
```bash
pnpm db:init
```

### Error: "SQLITE_LOCKED" or "database is locked"

**Cause**: Another process is using the database or dev server is running

**Fix**:
```bash
# Stop the dev server
pkill -f "next dev"

# Wait a moment, then retry
pnpm db:init
```

### Fresh Start

If you want to completely reset:

```bash
# Stop dev server
pkill -f "next dev"

# Delete database files
rm -f data/database.sqlite*

# Rebuild better-sqlite3
cd node_modules/.pnpm/better-sqlite3@12.5.0/node_modules/better-sqlite3
npm run build-release
cd ../../../..

# Initialize database
pnpm db:init
```

## Database Schema

The initial migration (`001_initial.sql`) creates:

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Indexes
- `idx_sessions_user_id` - Fast session lookup by user
- `idx_sessions_expires_at` - Fast expired session cleanup
- `idx_users_username` - Fast user lookup by username

### Seed Data
- Admin user (username: `admin`, password: `admin`)

## Production Notes

1. **Change the admin password** - The default admin/admin is for development only
2. **Backup the database** - SQLite files can be backed up by copying
3. **WAL mode** - Enabled for better concurrency (don't disable)
4. **Foreign keys** - Enabled for referential integrity (don't disable)

## Environment Variables

Database path is configured in `.env.local`:

```env
DATABASE_PATH=./data/database.sqlite
```

You can change this to use a different location if needed.
