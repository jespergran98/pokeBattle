using System.Text.Json;
using pokeBattle.Models;

namespace pokeBattle.Services;

public class PokeApiService : IPokeApiService
{
    private readonly HttpClient _httpClient;
    private readonly Random _random;
    private const string BaseUrl = "https://pokeapi.co/api/v2";

    public PokeApiService(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _random = new Random();
    }

    public async Task<List<Pokemon>> GetRandomPokemonAsync(int count)
    {
        var pokemonList = new List<Pokemon>();
        var usedIds = new HashSet<int>();

        while (pokemonList.Count < count)
        {
            var id = _random.Next(1, 1026); // 1-1025 as specified
            if (usedIds.Contains(id))
                continue;

            usedIds.Add(id);
            var pokemon = await GetPokemonByIdAsync(id);
            if (pokemon != null)
            {
                pokemonList.Add(pokemon);
            }
        }

        return pokemonList;
    }

    public async Task<Pokemon?> GetPokemonByIdAsync(int id)
    {
        try
        {
            var response = await _httpClient.GetStringAsync($"{BaseUrl}/pokemon/{id}");
            var pokeApiPokemon = JsonSerializer.Deserialize<PokeApiPokemonResponse>(response);
            
            if (pokeApiPokemon == null) return null;

            var pokemon = new Pokemon
            {
                Id = pokeApiPokemon.Id,
                Name = CapitalizeName(pokeApiPokemon.Name),
                Types = pokeApiPokemon.Types.Select(t => t.Type.Name).ToList(),
                SpriteUrl = pokeApiPokemon.Sprites.FrontDefault ?? ""
            };

            // Set stats
            foreach (var stat in pokeApiPokemon.Stats)
            {
                switch (stat.Stat.Name)
                {
                    case "hp":
                        pokemon.MaxHp = stat.BaseStat;
                        pokemon.CurrentHp = stat.BaseStat;
                        break;
                    case "attack":
                        pokemon.Attack = stat.BaseStat;
                        break;
                    case "defense":
                        pokemon.Defense = stat.BaseStat;
                        break;
                    case "speed":
                        pokemon.Speed = stat.BaseStat;
                        break;
                }
            }

            // Get moves (limit to first 4 for simplicity)
            var moveUrls = pokeApiPokemon.Moves.Take(4).Select(m => m.Move.Url).ToList();
            pokemon.Moves = await GetMovesFromUrlsAsync(moveUrls);

            return pokemon;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching Pokémon {id}: {ex.Message}");
            return null;
        }
    }

    public async Task<List<Pokemon>> GetPokemonByIdsAsync(List<int> ids)
    {
        var tasks = ids.Select(id => GetPokemonByIdAsync(id));
        var results = await Task.WhenAll(tasks);
        return results.Where(p => p != null).Cast<Pokemon>().ToList();
    }

    private async Task<List<Move>> GetMovesFromUrlsAsync(List<string> urls)
    {
        var moves = new List<Move>();
        
        foreach (var url in urls)
        {
            try
            {
                var response = await _httpClient.GetStringAsync(url);
                var moveData = JsonSerializer.Deserialize<PokeApiMoveResponse>(response);
                
                if (moveData != null)
                {
                    var move = new Move
                    {
                        Name = CapitalizeName(moveData.Name.Replace("-", " ")),
                        Power = moveData.Power ?? 40, // Default power for status moves
                        Accuracy = moveData.Accuracy ?? 100,
                        Type = moveData.Type.Name,
                        PP = moveData.PP,
                        CurrentPP = moveData.PP
                    };
                    moves.Add(move);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching move from {url}: {ex.Message}");
                // Add a default move if API call fails
                moves.Add(new Move
                {
                    Name = "Tackle",
                    Power = 40,
                    Accuracy = 100,
                    Type = "normal",
                    PP = 35,
                    CurrentPP = 35
                });
            }
        }

        return moves;
    }

    private static string CapitalizeName(string name)
    {
        return string.Join(" ", name.Split('-').Select(word => 
            char.ToUpper(word[0]) + word[1..].ToLower()));
    }
}