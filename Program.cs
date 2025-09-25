using pokeBattle.Models;
using pokeBattle.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddSingleton<IPokeApiService, PokeApiService>();
builder.Services.AddSingleton<IGameService, GameService>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure middleware - ORDER IS CRITICAL!
app.UseCors();

// Static files MUST come before UseRouting()
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

// Get 20 random Pokémon for selection
app.MapGet("/api/pokemon/random", async (IPokeApiService pokeApiService) =>
{
    var randomPokemon = await pokeApiService.GetRandomPokemonAsync(20);
    return Results.Ok(randomPokemon);
});

// Start a new game
app.MapPost("/api/game/start", (GameStartRequest request, IGameService gameService) =>
{
    var gameId = gameService.StartGame(request.PlayerPokemon, request.CpuPokemon);
    return Results.Ok(new { GameId = gameId });
});

// Get current game state
app.MapGet("/api/game/{gameId}", (string gameId, IGameService gameService) =>
{
    var gameState = gameService.GetGameState(gameId);
    if (gameState == null)
        return Results.NotFound();
    
    return Results.Ok(gameState);
});

// Make a move (attack)
app.MapPost("/api/game/{gameId}/move", (string gameId, MoveRequest request, IGameService gameService) =>
{
    var result = gameService.MakeMove(gameId, request.AttackerId, request.DefenderId, request.MoveIndex);
    if (result == null)
        return Results.NotFound();
    
    return Results.Ok(result);
});

// Switch active Pokémon
app.MapPost("/api/game/{gameId}/switch", (string gameId, SwitchRequest request, IGameService gameService) =>
{
    var result = gameService.SwitchPokemon(gameId, request.PlayerId, request.PokemonIndex);
    if (result == null)
        return Results.NotFound();
    
    return Results.Ok(result);
});

app.Run();