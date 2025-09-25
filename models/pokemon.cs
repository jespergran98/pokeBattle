namespace pokeBattle.Models;

public class Pokemon
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<string> Types { get; set; } = new();
    public string SpriteUrl { get; set; } = string.Empty;
    
    // Stats
    public int MaxHp { get; set; }
    public int CurrentHp { get; set; }
    public int Attack { get; set; }
    public int Defense { get; set; }
    public int Speed { get; set; }
    
    // Moves
    public List<Move> Moves { get; set; } = new();
    
    // Status
    public bool IsAlive => CurrentHp > 0;
}