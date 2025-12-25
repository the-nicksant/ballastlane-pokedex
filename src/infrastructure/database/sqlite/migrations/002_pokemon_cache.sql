-- Migration: 002_pokemon_cache
-- Purpose: Add Pokemon caching table for local list/search operations
-- This table stores basic Pokemon information for fast queries without hitting PokeAPI

CREATE TABLE IF NOT EXISTS pokemon (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  types TEXT NOT NULL,
  sprite_url TEXT NOT NULL,
  artwork_url TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_pokemon_name ON pokemon(name);
