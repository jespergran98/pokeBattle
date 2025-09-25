using System.Collections.Concurrent;
using pokeBattle.Models;

namespace pokeBattle.Services;

public class GameService : IGameService
{
    private readonly ConcurrentDictionary<string, GameState> _games = new();
    private readonly IPokeApiService _pokeApiService;
    private readonly Random _random = new();

    // Type effectiveness chart (simplified)
    private readonly Dictionary<string, Dictionary<string, float>> _typeChart = new()
    {
        ["fire"] = new() { ["grass"] = 2.0f, ["water"] = 0.5f, ["fire"] = 0.5f },
        ["water"] = new() { ["fire"] = 2.0f, ["grass"] = 0.5f, ["water"] = 0.5f },
        ["grass"] = new() { ["water"] = 2.0f, ["fire"] = 0.5f, ["grass"] = 0.5f },
        ["electric"] = new() { ["water"] = 2.0f, ["grass"] = 0.5f, ["electric"] = 0.5f },
        ["normal"] = new() { },
        // Add more type matchups as needed
    };

    public GameService(IPokeApiService pokeApiService)
    {
        _pokeApiService = pokeApiService;
    }

    public string StartGame(List<int> playerPokemonIds, List<int> cpuPokemonIds)
    {
        var gameId = Guid.NewGuid().ToString();
        
        // This would typically be async, but for simplicity we'll assume the Pokemon are already loaded
        Task.Run(async () =>
        {
            var playerPokemon = await _pokeApiService.GetPokemonByIdsAsync(playerPokemonIds);
            var cpuPokemon = await _pokeApiService.GetPokemonByIdsAsync(cpuPokemonIds);

            var gameState = new GameState
            {
                GameId = gameId,
                Player = new Player
                {
                    Id = "player",
                    Name = "Player",
                    Team = playerPokemon,
                    ActivePokemonIndex = 0
                },
                Cpu = new Player
                {
                    Id = "cpu",
                    Name = "CPU",
                    Team = cpuPokemon,
                    ActivePokemonIndex = 0
                },
                Status = GameStatus.InBattle, // Fixed: Using correct enum value
                CurrentTurn = "player"
            };

            _games[gameId] = gameState;
        });

        return gameId;
    }

    public GameState? GetGameState(string gameId)
    {
        return _games.TryGetValue(gameId, out var gameState) ? gameState : null;
    }

    public BattleResult? MakeMove(string gameId, string attackerId, string defenderId, int moveIndex)
    {
        if (!_games.TryGetValue(gameId, out var gameState))
            return null;

        var attacker = attackerId == "player" ? gameState.Player.ActivePokemon : gameState.Cpu.ActivePokemon;
        var defender = defenderId == "player" ? gameState.Player.ActivePokemon : gameState.Cpu.ActivePokemon;

        if (attacker == null || defender == null || moveIndex >= attacker.Moves.Count)
            return null;

        var move = attacker.Moves[moveIndex];
        var result = ExecuteMove(attacker, defender, move);
        
        // Add to battle log
        gameState.BattleLog.Add($"{attacker.Name} used {move.Name}!");
        if (result.IsHit)
        {
            gameState.BattleLog.Add($"{defender.Name} took {result.Damage} damage!");
            if (result.IsCritical)
                gameState.BattleLog.Add("Critical hit!");
        }
        else
        {
            gameState.BattleLog.Add($"{attacker.Name}'s attack missed!");
        }

        // Check if defender fainted
        if (result.TargetFainted)
        {
            gameState.BattleLog.Add($"{defender.Name} fainted!");
            
            // Check if game is over
            var defenderPlayer = defenderId == "player" ? gameState.Player : gameState.Cpu;
            if (!defenderPlayer.HasAlivePokemon)
            {
                gameState.Status = GameStatus.GameOver; // Fixed: Using correct enum value
                gameState.Winner = attackerId;
                gameState.BattleLog.Add($"{(attackerId == "player" ? "Player" : "CPU")} wins!");
            }
        }

        // Switch turns
        gameState.CurrentTurn = gameState.CurrentTurn == "player" ? "cpu" : "player";
        
        // If it's CPU's turn and game is still active, process CPU move
        if (gameState.CurrentTurn == "cpu" && gameState.Status == GameStatus.InBattle) // Fixed: Using correct enum value
        {
            ProcessCpuTurn(gameId);
        }

        result.GameState = gameState;
        return result;
    }

    public GameState? SwitchPokemon(string gameId, string playerId, int pokemonIndex)
    {
        if (!_games.TryGetValue(gameId, out var gameState))
            return null;

        var player = playerId == "player" ? gameState.Player : gameState.Cpu;
        
        if (pokemonIndex >= player.Team.Count || !player.Team[pokemonIndex].IsAlive)
            return null;

        player.ActivePokemonIndex = pokemonIndex;
        gameState.BattleLog.Add($"{player.Name} sent out {player.ActivePokemon?.Name}!");
        
        // Switch turns
        gameState.CurrentTurn = gameState.CurrentTurn == "player" ? "cpu" : "player";

        return gameState;
    }

    public void ProcessCpuTurn(string gameId)
    {
        if (!_games.TryGetValue(gameId, out var gameState))
            return;

        var cpuPokemon = gameState.Cpu.ActivePokemon;
        var playerPokemon = gameState.Player.ActivePokemon;

        if (cpuPokemon == null || playerPokemon == null)
            return;

        // Simple AI: choose a random move
        var moveIndex = _random.Next(cpuPokemon.Moves.Count);
        var move = cpuPokemon.Moves[moveIndex];
        
        var result = ExecuteMove(cpuPokemon, playerPokemon, move);
        
        // Add to battle log
        gameState.BattleLog.Add($"{cpuPokemon.Name} used {move.Name}!");
        if (result.IsHit)
        {
            gameState.BattleLog.Add($"{playerPokemon.Name} took {result.Damage} damage!");
            if (result.IsCritical)
                gameState.BattleLog.Add("Critical hit!");
        }
        else
        {
            gameState.BattleLog.Add($"{cpuPokemon.Name}'s attack missed!");
        }

        // Check if player's Pokémon fainted
        if (result.TargetFainted)
        {
            gameState.BattleLog.Add($"{playerPokemon.Name} fainted!");
            
            // Check if game is over
            if (!gameState.Player.HasAlivePokemon)
            {
                gameState.Status = GameStatus.GameOver; // Fixed: Using correct enum value
                gameState.Winner = "cpu";
                gameState.BattleLog.Add("CPU wins!");
            }
        }

        // Switch back to player's turn
        gameState.CurrentTurn = "player";
    }

    private BattleResult ExecuteMove(Pokemon attacker, Pokemon defender, Move move)
    {
        var result = new BattleResult();
        
        // Check if move hits
        var hitChance = _random.Next(1, 101);
        if (hitChance > move.Accuracy)
        {
            result.IsHit = false;
            return result;
        }

        result.IsHit = true;
        
        // Calculate damage
        var baseDamage = move.Power;
        var attackStat = attacker.Attack;
        var defenseStat = defender.Defense;
        
        // Simple damage formula
        var damage = (int)((baseDamage * attackStat / defenseStat) * 0.5) + 1;
        
        // Type effectiveness
        var effectiveness = GetTypeEffectiveness(move.Type, defender.Types);
        damage = (int)(damage * effectiveness);
        result.Effectiveness = effectiveness;
        
        // Critical hit chance (1/16)
        var criticalChance = _random.Next(1, 17);
        if (criticalChance == 1)
        {
            damage = (int)(damage * 1.5);
            result.IsCritical = true;
        }
        
        // Apply damage
        defender.CurrentHp = Math.Max(0, defender.CurrentHp - damage);
        result.Damage = damage;
        result.TargetFainted = defender.CurrentHp == 0;
        
        // Reduce PP
        move.CurrentPP = Math.Max(0, move.CurrentPP - 1);
        
        return result;
    }

    private float GetTypeEffectiveness(string moveType, List<string> defenderTypes)
    {
        float effectiveness = 1.0f;
        
        if (_typeChart.TryGetValue(moveType, out var matchups))
        {
            foreach (var defenderType in defenderTypes)
            {
                if (matchups.TryGetValue(defenderType, out var typeEffectiveness))
                {
                    effectiveness *= typeEffectiveness;
                }
            }
        }
        
        return effectiveness;
    }
}