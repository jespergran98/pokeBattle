namespace pokeBattle.Models;

public class Move
{
    public string Name { get; set; } = string.Empty;
    public int Power { get; set; }
    public int Accuracy { get; set; }
    public string Type { get; set; } = string.Empty;
    public int PP { get; set; }
    public int CurrentPP { get; set; }
}