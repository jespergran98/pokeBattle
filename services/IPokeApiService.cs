using pokeBattle.Models;

namespace pokeBattle.Services;

public interface IPokeApiService
{
    Task<List<Pokemon>> GetRandomPokemonAsync(int count);
    Task<Pokemon?> GetPokemonByIdAsync(int id);
    Task<List<Pokemon>> GetPokemonByIdsAsync(List<int> ids);
}