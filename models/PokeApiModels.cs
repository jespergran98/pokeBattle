using System.Text.Json.Serialization;

namespace pokeBattle.Models;

// PokeAPI response models
public class PokeApiPokemonResponse
{
    [JsonPropertyName("id")]
    public int Id { get; set; }
    
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("sprites")]
    public PokeApiSprites Sprites { get; set; } = new();
    
    [JsonPropertyName("types")]
    public List<PokeApiTypeSlot> Types { get; set; } = new();
    
    [JsonPropertyName("stats")]
    public List<PokeApiStat> Stats { get; set; } = new();
    
    [JsonPropertyName("moves")]
    public List<PokeApiMoveSlot> Moves { get; set; } = new();
}

public class PokeApiSprites
{
    [JsonPropertyName("front_default")]
    public string? FrontDefault { get; set; }
}

public class PokeApiTypeSlot
{
    [JsonPropertyName("slot")]
    public int Slot { get; set; }
    
    [JsonPropertyName("type")]
    public PokeApiType Type { get; set; } = new();
}

public class PokeApiType
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}

public class PokeApiStat
{
    [JsonPropertyName("base_stat")]
    public int BaseStat { get; set; }
    
    [JsonPropertyName("stat")]
    public PokeApiStatInfo Stat { get; set; } = new();
}

public class PokeApiStatInfo
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}

public class PokeApiMoveSlot
{
    [JsonPropertyName("move")]
    public PokeApiMoveInfo Move { get; set; } = new();
}

public class PokeApiMoveInfo
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;
}

public class PokeApiMoveResponse
{
    [JsonPropertyName("id")]
    public int Id { get; set; }
    
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("accuracy")]
    public int? Accuracy { get; set; }
    
    [JsonPropertyName("power")]
    public int? Power { get; set; }
    
    [JsonPropertyName("pp")]
    public int PP { get; set; }
    
    [JsonPropertyName("type")]
    public PokeApiType Type { get; set; } = new();
}