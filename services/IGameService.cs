using pokeBattle.Models;

namespace pokeBattle.Services;

public interface IGameService
{
    string StartGame(List<int> playerPokemonIds, List<int> cpuPokemonIds);
    GameState? GetGameState(string gameId);
    BattleResult? MakeMove(string gameId, string attackerId, string defenderId, int moveIndex);
    GameState? SwitchPokemon(string gameId, string playerId, int pokemonIndex);
    void ProcessCpuTurn(string gameId);
}