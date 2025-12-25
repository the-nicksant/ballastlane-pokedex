import type {
  Pokemon,
  PokemonDetail,
  Ability,
  Move,
  PokemonForm,
  Stat,
} from "@/core/domain/entities/pokemon.entity";
import type { PokeAPIPokemon, PokeAPINamedResource } from "../types";
import type { PokemonType } from "@/core/config/constants";

export class PokemonMapper {
  static extractIdFromUrl(url: string): number {
    const matches = url.match(/\/pokemon\/(\d+)\//);
    return matches ? parseInt(matches[1], 10) : 0;
  }

  static toBasicPokemon(name: string, id: number): Pokemon {
    return {
      id,
      name,
      types: [],
      spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      artworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    };
  }

  static toDomain(apiPokemon: PokeAPIPokemon): Pokemon {
    return {
      id: apiPokemon.id,
      name: apiPokemon.name,
      types: apiPokemon.types
        .sort((a, b) => a.slot - b.slot)
        .map((t) => t.type.name as PokemonType),
      spriteUrl: apiPokemon.sprites.front_default,
      artworkUrl: apiPokemon.sprites.other["official-artwork"].front_default,
    };
  }

  static toDetailedDomain(apiPokemon: PokeAPIPokemon): PokemonDetail {
    return {
      ...this.toDomain(apiPokemon),
      height: apiPokemon.height,
      weight: apiPokemon.weight,
      abilities: this.mapAbilities(apiPokemon.abilities),
      moves: this.mapMoves(apiPokemon.moves),
      forms: this.mapForms(apiPokemon.forms),
      stats: this.mapStats(apiPokemon.stats),
    };
  }

  private static mapAbilities(
    abilities: PokeAPIPokemon["abilities"]
  ): Ability[] {
    return abilities.map((a) => ({
      name: a.ability.name,
      isHidden: a.is_hidden,
      slot: a.slot,
    }));
  }

  private static mapMoves(moves: PokeAPIPokemon["moves"]): Move[] {
    return moves.slice(0, 50).map((m) => ({
      name: m.move.name,
      learnMethod:
        m.version_group_details[0]?.move_learn_method.name ?? "unknown",
      levelLearnedAt: m.version_group_details[0]?.level_learned_at ?? null,
    }));
  }

  private static mapForms(forms: PokeAPINamedResource[]): PokemonForm[] {
    return forms.map((f) => ({
      name: f.name,
      formName: f.name,
      isMega: f.name.includes("mega"),
    }));
  }

  private static mapStats(stats: PokeAPIPokemon["stats"]): Stat[] {
    return stats.map((s) => ({
      name: s.stat.name,
      baseStat: s.base_stat,
      effort: s.effort,
    }));
  }
}
