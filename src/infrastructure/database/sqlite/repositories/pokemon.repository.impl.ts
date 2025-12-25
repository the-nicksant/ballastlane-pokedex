import type Database from "better-sqlite3";
import type { PokemonRepository } from "@/core/domain/repositories/pokemon.repository";
import type {
  Pokemon,
  PokemonDetail,
  PokemonListResult,
  PokemonSortBy,
  SortOrder,
} from "@/core/domain/entities/pokemon.entity";
import type { PokemonType } from "@/core/config/constants";
import { db } from "../connection";
import { PAGINATION } from "@/core/config/constants";

export class PokemonSQLiteRepository implements PokemonRepository {
  constructor(private database: Database.Database = db) {}

  async getList(params: {
    offset?: number;
    limit?: number;
    search?: string;
    sortBy?: PokemonSortBy;
    order?: SortOrder;
  }): Promise<PokemonListResult> {
    const offset = params.offset ?? 0;
    const limit = Math.min(
      params.limit ?? PAGINATION.DEFAULT_PAGE_SIZE,
      PAGINATION.MAX_PAGE_SIZE
    );
    const sortBy = params.sortBy ?? "number";
    const order = params.order ?? "asc";

    let query = "SELECT id, name, types, sprite_url, artwork_url FROM pokemon";
    const queryParams: any[] = [];

    if (params.search) {
      query += " WHERE (LOWER(name) LIKE ? OR CAST(id AS TEXT) LIKE ?)";
      const searchPattern = `%${params.search.toLowerCase()}%`;
      queryParams.push(searchPattern, searchPattern);
    }

    const sortColumn = sortBy === "number" ? "id" : "name";
    const sortOrder = order.toUpperCase();
    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    query += " LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    const rows = this.database.prepare(query).all(...queryParams) as any[];
    const pokemon = rows.map((row) => this.mapRowToPokemon(row));

    let countQuery = "SELECT COUNT(*) as total FROM pokemon";
    const countParams: any[] = [];
    if (params.search) {
      countQuery += " WHERE (LOWER(name) LIKE ? OR CAST(id AS TEXT) LIKE ?)";
      const searchPattern = `%${params.search.toLowerCase()}%`;
      countParams.push(searchPattern, searchPattern);
    }
    const countRow = this.database.prepare(countQuery).get(...countParams) as any;
    const total = countRow.total;

    return {
      pokemon,
      total,
      offset,
      limit,
      hasMore: offset + limit < total,
    };
  }

  async getById(id: number): Promise<PokemonDetail | null> {
    throw new Error("getById should use PokeAPI repository, not SQLite cache");
  }

  private mapRowToPokemon(row: any): Pokemon {
    return {
      id: row.id,
      name: row.name,
      types: JSON.parse(row.types) as PokemonType[],
      spriteUrl: row.sprite_url,
      artworkUrl: row.artwork_url,
    };
  }

  insertBatch(pokemon: Pokemon[]): void {
    const insert = this.database.prepare(`
      INSERT OR REPLACE INTO pokemon (id, name, types, sprite_url, artwork_url)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertMany = this.database.transaction((pokemonList: Pokemon[]) => {
      for (const p of pokemonList) {
        insert.run(
          p.id,
          p.name,
          JSON.stringify(p.types),
          p.spriteUrl,
          p.artworkUrl
        );
      }
    });

    insertMany(pokemon);
  }

  count(): number {
    const row = this.database.prepare("SELECT COUNT(*) as count FROM pokemon").get() as any;
    return row.count;
  }

  isEmpty(): boolean {
    return this.count() === 0;
  }

  truncate(): void {
    this.database.prepare("DELETE FROM pokemon").run();
  }
}

export const pokemonSQLiteRepository = new PokemonSQLiteRepository();
