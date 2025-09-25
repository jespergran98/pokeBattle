namespace pokeBattle.Models;

public class GameState
{
    public string GameId { get; set; } = string.Empty;
    public Player Player { get; set; } = new();
    public Player Cpu { get; set; } = new();
    public GameStatus Status { get; set; }
    public string CurrentTurn { get; set; } = string.Empty;
    public string? Winner { get; set; }
    public List<string> BattleLog { get; set; } = new();
}

public class Player
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public List<Pokemon> Team { get; set; } = new();
    public int ActivePokemonIndex { get; set; }
    
    public Pokemon? ActivePokemon => 
        ActivePokemonIndex < Team.Count ? Team[ActivePokemonIndex] : null;
    
    public bool HasAlivePokemon => Team.Any(p => p.IsAlive);
}

public class BattleResult
{
    public bool IsHit { get; set; }
    public int Damage { get; set; }
    public bool IsCritical { get; set; }
    public float Effectiveness { get; set; } = 1.0f;
    public bool TargetFainted { get; set; }
    public GameState? GameState { get; set; }
}

public enum GameStatus
{
    WaitingToStart = 0,
    GameOver = 1,        // Fixed: Changed from InBattle = 1 to GameOver = 1
    InBattle = 2         // Fixed: Changed from GameOver = 2 to InBattle = 2
}

// Request models
public class GameStartRequest
{
    public List<int> PlayerPokemon { get; set; } = new();
    public List<int> CpuPokemon { get; set; } = new();
}

public class MoveRequest
{
    public string AttackerId { get; set; } = string.Empty;
    public string DefenderId { get; set; } = string.Empty;
    public int MoveIndex { get; set; }
}

public class SwitchRequest
{
    public string PlayerId { get; set; } = string.Empty;
    public int PokemonIndex { get; set; }
}