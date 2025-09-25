// Pokemon Battle Game JavaScript - Fixed Version
class PokemonBattleGame {
    constructor() {
        this.availablePokemon = [];
        this.cpuPokemon = [];
        this.selectedPlayerPokemon = null;
        this.selectedCpuPokemon = null;
        this.playerPokemon = null;
        this.cpuPokemonBattle = null;
        this.currentTurn = 'player';
        this.isProcessing = false;
        this.gameOver = false;
        
        this.init();
    }

    async init() {
        await this.loadPokemon();
        this.setupEventListeners();
    }

    // Mock Pokemon data since we don't have an API
    getMockPokemon() {
        const mockPokemon = [
            {
                id: 1,
                name: "Pikachu",
                types: ["electric"],
                spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
                stats: { hp: 100, attack: 55, defense: 40, speed: 90 },
                moves: [
                    { name: "Thunder Shock", type: "electric", power: 40, pp: 30, currentPP: 30 },
                    { name: "Quick Attack", type: "normal", power: 40, pp: 30, currentPP: 30 },
                    { name: "Thunder", type: "electric", power: 110, pp: 10, currentPP: 10 },
                    { name: "Agility", type: "psychic", power: 0, pp: 30, currentPP: 30 }
                ]
            },
            {
                id: 2,
                name: "Charizard",
                types: ["fire", "flying"],
                spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
                stats: { hp: 120, attack: 84, defense: 78, speed: 100 },
                moves: [
                    { name: "Flamethrower", type: "fire", power: 90, pp: 15, currentPP: 15 },
                    { name: "Wing Attack", type: "flying", power: 60, pp: 35, currentPP: 35 },
                    { name: "Fire Blast", type: "fire", power: 110, pp: 5, currentPP: 5 },
                    { name: "Slash", type: "normal", power: 70, pp: 20, currentPP: 20 }
                ]
            },
            {
                id: 3,
                name: "Blastoise",
                types: ["water"],
                spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png",
                stats: { hp: 130, attack: 83, defense: 100, speed: 78 },
                moves: [
                    { name: "Hydro Pump", type: "water", power: 110, pp: 5, currentPP: 5 },
                    { name: "Water Gun", type: "water", power: 40, pp: 25, currentPP: 25 },
                    { name: "Ice Beam", type: "ice", power: 90, pp: 10, currentPP: 10 },
                    { name: "Bite", type: "dark", power: 60, pp: 25, currentPP: 25 }
                ]
            },
            {
                id: 4,
                name: "Venusaur",
                types: ["grass", "poison"],
                spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png",
                stats: { hp: 125, attack: 82, defense: 83, speed: 80 },
                moves: [
                    { name: "Solar Beam", type: "grass", power: 120, pp: 10, currentPP: 10 },
                    { name: "Vine Whip", type: "grass", power: 45, pp: 25, currentPP: 25 },
                    { name: "Sludge Bomb", type: "poison", power: 90, pp: 10, currentPP: 10 },
                    { name: "Razor Leaf", type: "grass", power: 55, pp: 25, currentPP: 25 }
                ]
            },
            {
                id: 5,
                name: "Gengar",
                types: ["ghost", "poison"],
                spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png",
                stats: { hp: 110, attack: 65, defense: 60, speed: 110 },
                moves: [
                    { name: "Shadow Ball", type: "ghost", power: 80, pp: 15, currentPP: 15 },
                    { name: "Lick", type: "ghost", power: 30, pp: 30, currentPP: 30 },
                    { name: "Hypnosis", type: "psychic", power: 0, pp: 20, currentPP: 20 },
                    { name: "Night Shade", type: "ghost", power: 60, pp: 15, currentPP: 15 }
                ]
            },
            {
                id: 6,
                name: "Alakazam",
                types: ["psychic"],
                spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png",
                stats: { hp: 95, attack: 50, defense: 45, speed: 120 },
                moves: [
                    { name: "Psychic", type: "psychic", power: 90, pp: 10, currentPP: 10 },
                    { name: "Confusion", type: "psychic", power: 50, pp: 25, currentPP: 25 },
                    { name: "Teleport", type: "psychic", power: 0, pp: 20, currentPP: 20 },
                    { name: "Recover", type: "normal", power: 0, pp: 10, currentPP: 10 }
                ]
            },
            {
                id: 7,
                name: "Machamp",
                types: ["fighting"],
                spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png",
                stats: { hp: 140, attack: 130, defense: 80, speed: 55 },
                moves: [
                    { name: "Dynamic Punch", type: "fighting", power: 100, pp: 5, currentPP: 5 },
                    { name: "Karate Chop", type: "fighting", power: 50, pp: 25, currentPP: 25 },
                    { name: "Seismic Toss", type: "fighting", power: 60, pp: 20, currentPP: 20 },
                    { name: "Strength", type: "normal", power: 80, pp: 15, currentPP: 15 }
                ]
            },
            {
                id: 8,
                name: "Dragonite",
                types: ["dragon", "flying"],
                spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png",
                stats: { hp: 135, attack: 134, defense: 95, speed: 80 },
                moves: [
                    { name: "Dragon Rush", type: "dragon", power: 100, pp: 10, currentPP: 10 },
                    { name: "Wing Attack", type: "flying", power: 60, pp: 35, currentPP: 35 },
                    { name: "Hyper Beam", type: "normal", power: 150, pp: 5, currentPP: 5 },
                    { name: "Thunder", type: "electric", power: 110, pp: 10, currentPP: 10 }
                ]
            },
            {
                id: 9,
                name: "Gyarados",
                types: ["water", "flying"],
                spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png",
                stats: { hp: 135, attack: 125, defense: 79, speed: 81 },
                moves: [
                    { name: "Hydro Pump", type: "water", power: 110, pp: 5, currentPP: 5 },
                    { name: "Bite", type: "dark", power: 60, pp: 25, currentPP: 25 },
                    { name: "Dragon Rage", type: "dragon", power: 40, pp: 10, currentPP: 10 },
                    { name: "Thrash", type: "normal", power: 120, pp: 10, currentPP: 10 }
                ]
            },
            {
                id: 10,
                name: "Lapras",
                types: ["water", "ice"],
                spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png",
                stats: { hp: 160, attack: 85, defense: 80, speed: 60 },
                moves: [
                    { name: "Ice Beam", type: "ice", power: 90, pp: 10, currentPP: 10 },
                    { name: "Surf", type: "water", power: 90, pp: 15, currentPP: 15 },
                    { name: "Body Slam", type: "normal", power: 85, pp: 15, currentPP: 15 },
                    { name: "Confuse Ray", type: "ghost", power: 0, pp: 10, currentPP: 10 }
                ]
            },
            {
                id: 11,
                name: "Snorlax",
                types: ["normal"],
                spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png",
                stats: { hp: 180, attack: 110, defense: 65, speed: 30 },
                moves: [
                    { name: "Body Slam", type: "normal", power: 85, pp: 15, currentPP: 15 },
                    { name: "Rest", type: "psychic", power: 0, pp: 10, currentPP: 10 },
                    { name: "Hyper Beam", type: "normal", power: 150, pp: 5, currentPP: 5 },
                    { name: "Earthquake", type: "ground", power: 100, pp: 10, currentPP: 10 }
                ]
            },
            {
                id: 12,
                name: "Mewtwo",
                types: ["psychic"],
                spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png",
                stats: { hp: 130, attack: 110, defense: 90, speed: 130 },
                moves: [
                    { name: "Psychic", type: "psychic", power: 90, pp: 10, currentPP: 10 },
                    { name: "Shadow Ball", type: "ghost", power: 80, pp: 15, currentPP: 15 },
                    { name: "Aura Sphere", type: "fighting", power: 80, pp: 20, currentPP: 20 },
                    { name: "Recover", type: "normal", power: 0, pp: 10, currentPP: 10 }
                ]
            }
        ];

        return mockPokemon.map(pokemon => ({
            ...pokemon,
            maxHp: pokemon.stats.hp,
            currentHp: pokemon.stats.hp,
            isAlive: true
        }));
    }

    async loadPokemon() {
        // Since we don't have an API, use mock data
        this.availablePokemon = this.getMockPokemon();
        this.generateCpuTeam();
        this.displayPokemonGrids();
        this.showScreen('selectionScreen');
    }

    generateCpuTeam() {
        // Generate 20 random CPU Pokemon for selection
        const shuffled = [...this.availablePokemon].sort(() => 0.5 - Math.random());
        this.cpuPokemon = shuffled.slice(0, 8); // Show 8 for CPU selection
    }

    displayPokemonGrids() {
        this.displayPlayerGrid();
        this.displayCpuGrid();
    }

    displayPlayerGrid() {
        const grid = document.getElementById('playerPokemonGrid');
        grid.innerHTML = '';

        // Show first 6 Pokemon for player
        this.availablePokemon.slice(0, 6).forEach(pokemon => {
            const card = document.createElement('div');
            card.className = 'pokemon-card';
            card.dataset.pokemonId = pokemon.id;
            
            card.innerHTML = `
                <img src="${pokemon.spriteUrl}" alt="${pokemon.name}" loading="lazy">
                <div class="name">${pokemon.name}</div>
                <div class="types">
                    ${pokemon.types.map(type => 
                        `<span class="type-badge type-${type}">${type.toUpperCase().slice(0, 3)}</span>`
                    ).join('')}
                </div>
            `;

            card.addEventListener('click', () => this.selectPlayerPokemon(pokemon));
            grid.appendChild(card);
        });
    }

    displayCpuGrid() {
        const grid = document.getElementById('cpuPokemonGrid');
        grid.innerHTML = '';

        this.cpuPokemon.forEach(pokemon => {
            const card = document.createElement('div');
            card.className = 'pokemon-card cpu-card';
            
            card.innerHTML = `
                <img src="${pokemon.spriteUrl}" alt="${pokemon.name}" loading="lazy">
                <div class="name">${pokemon.name}</div>
                <div class="types">
                    ${pokemon.types.map(type => 
                        `<span class="type-badge type-${type}">${type.toUpperCase().slice(0, 3)}</span>`
                    ).join('')}
                </div>
            `;

            grid.appendChild(card);
        });

        // Auto-select random CPU Pokemon
        setTimeout(() => {
            this.selectCpuPokemon();
        }, 1000);
    }

    selectPlayerPokemon(pokemon) {
        if (this.selectedPlayerPokemon) {
            // Remove previous selection
            document.querySelectorAll('.pokemon-card').forEach(card => {
                card.classList.remove('selected');
            });
        }

        this.selectedPlayerPokemon = pokemon;
        
        // Update display
        const card = document.querySelector(`[data-pokemon-id="${pokemon.id}"]`);
        card.classList.add('selected');
        
        this.updatePlayerSelectedDisplay(pokemon);
        this.checkBattleReady();
    }

    selectCpuPokemon() {
        const randomIndex = Math.floor(Math.random() * this.cpuPokemon.length);
        this.selectedCpuPokemon = this.cpuPokemon[randomIndex];
        
        // Highlight selected CPU Pokemon
        const cpuCards = document.querySelectorAll('#cpuPokemonGrid .pokemon-card');
        cpuCards.forEach((card, index) => {
            card.classList.remove('selected');
            if (index === randomIndex) {
                card.classList.add('selected');
            }
        });

        this.updateCpuSelectedDisplay(this.selectedCpuPokemon);
        this.checkBattleReady();
    }

    updatePlayerSelectedDisplay(pokemon) {
        const display = document.getElementById('playerSelectedPokemon');
        display.innerHTML = `
            <img src="${pokemon.spriteUrl}" alt="${pokemon.name}">
            <div class="selected-info">
                <div class="name">${pokemon.name}</div>
                <div class="types">
                    ${pokemon.types.map(type => 
                        `<span class="type-badge type-${type}">${type.toUpperCase().slice(0, 3)}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    }

    updateCpuSelectedDisplay(pokemon) {
        const display = document.getElementById('cpuSelectedPokemon');
        display.innerHTML = `
            <img src="${pokemon.spriteUrl}" alt="${pokemon.name}">
            <div class="selected-info">
                <div class="name">${pokemon.name}</div>
                <div class="types">
                    ${pokemon.types.map(type => 
                        `<span class="type-badge type-${type}">${type.toUpperCase().slice(0, 3)}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    }

    checkBattleReady() {
        const startButton = document.getElementById('startBattle');
        if (this.selectedPlayerPokemon && this.selectedCpuPokemon) {
            startButton.disabled = false;
        }
    }

    startBattle() {
        if (!this.selectedPlayerPokemon || !this.selectedCpuPokemon) return;

        // Create battle copies
        this.playerPokemon = { ...this.selectedPlayerPokemon };
        this.cpuPokemonBattle = { ...this.selectedCpuPokemon };
        
        // Reset battle state
        this.currentTurn = 'player';
        this.gameOver = false;
        this.isProcessing = false;

        this.showScreen('battleScreen');
        this.updateBattleDisplay();
        this.displayBattleMessage(`A wild ${this.cpuPokemonBattle.name} appeared!`);
        
        setTimeout(() => {
            this.displayBattleMessage(`Go ${this.playerPokemon.name}!`);
            setTimeout(() => {
                this.displayBattleMessage("What will your Pokémon do?");
                this.showActionMenu();
            }, 1500);
        }, 1500);
    }

    updateBattleDisplay() {
        // Update player Pokemon
        if (this.playerPokemon) {
            document.getElementById('playerSprite').src = this.playerPokemon.spriteUrl;
            document.getElementById('playerName').textContent = this.playerPokemon.name;
            document.getElementById('playerLevel').textContent = 'Lv.50';
            document.getElementById('playerHpText').textContent = `${this.playerPokemon.currentHp}/${this.playerPokemon.maxHp}`;
            
            const playerHpBar = document.getElementById('playerHpBar');
            const playerHpPercent = (this.playerPokemon.currentHp / this.playerPokemon.maxHp) * 100;
            playerHpBar.style.width = `${playerHpPercent}%`;
            
            // Update HP bar color
            playerHpBar.className = 'hp-fill';
            if (playerHpPercent <= 20) playerHpBar.classList.add('critical');
            else if (playerHpPercent <= 50) playerHpBar.classList.add('low');

            // Update moves
            this.updateMoveButtons(this.playerPokemon);
        }

        // Update CPU Pokemon
        if (this.cpuPokemonBattle) {
            document.getElementById('cpuSprite').src = this.cpuPokemonBattle.spriteUrl;
            document.getElementById('cpuName').textContent = this.cpuPokemonBattle.name;
            document.getElementById('cpuLevel').textContent = 'Lv.50';
            
            const cpuHpBar = document.getElementById('cpuHpBar');
            const cpuHpPercent = (this.cpuPokemonBattle.currentHp / this.cpuPokemonBattle.maxHp) * 100;
            cpuHpBar.style.width = `${cpuHpPercent}%`;
            
            // Update HP bar color
            cpuHpBar.className = 'hp-fill';
            if (cpuHpPercent <= 20) cpuHpBar.classList.add('critical');
            else if (cpuHpPercent <= 50) cpuHpBar.classList.add('low');
        }
    }

    updateMoveButtons(pokemon) {
        const moveButtons = document.querySelectorAll('.move-btn');
        
        moveButtons.forEach((button, index) => {
            if (index < pokemon.moves.length) {
                const move = pokemon.moves[index];
                button.querySelector('.move-name').textContent = move.name;
                button.querySelector('.move-pp').textContent = `PP ${move.currentPP}/${move.pp}`;
                
                const typeSpan = button.querySelector('.move-type');
                typeSpan.textContent = move.type.toUpperCase().slice(0, 3);
                typeSpan.className = `move-type type-${move.type}`;
                
                button.disabled = move.currentPP === 0;
                button.style.display = 'flex';
            } else {
                button.style.display = 'none';
            }
        });
    }

    async makeMove(moveIndex) {
        if (this.isProcessing || this.gameOver) return;
        
        this.isProcessing = true;
        this.hideAllMenus();

        const move = this.playerPokemon.moves[moveIndex];
        if (move.currentPP <= 0) {
            this.displayBattleMessage(`${move.name} is out of PP!`);
            this.isProcessing = false;
            return;
        }

        // Player move
        move.currentPP--;
        this.displayBattleMessage(`${this.playerPokemon.name} used ${move.name}!`);
        
        // Calculate damage
        const damage = this.calculateDamage(this.playerPokemon, this.cpuPokemonBattle, move);
        
        setTimeout(() => {
            if (damage > 0) {
                this.cpuPokemonBattle.currentHp = Math.max(0, this.cpuPokemonBattle.currentHp - damage);
                this.animateAttack('player');
                
                if (this.cpuPokemonBattle.currentHp <= 0) {
                    this.cpuPokemonBattle.isAlive = false;
                    setTimeout(() => {
                        this.displayBattleMessage(`${this.cpuPokemonBattle.name} fainted!`);
                        this.animateFaint('cpu');
                        setTimeout(() => {
                            this.endBattle('player');
                        }, 2000);
                    }, 1000);
                } else {
                    // CPU's turn
                    setTimeout(() => {
                        this.cpuMove();
                    }, 1500);
                }
            } else {
                this.displayBattleMessage(`It had no effect...`);
                setTimeout(() => {
                    this.cpuMove();
                }, 1500);
            }
            
            this.updateBattleDisplay();
        }, 1000);
    }

    cpuMove() {
        if (this.gameOver) return;

        // CPU selects random move
        const availableMoves = this.cpuPokemonBattle.moves.filter(move => move.currentPP > 0);
        if (availableMoves.length === 0) {
            this.displayBattleMessage(`${this.cpuPokemonBattle.name} has no moves left!`);
            this.endBattle('player');
            return;
        }

        const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        randomMove.currentPP--;
        
        this.displayBattleMessage(`${this.cpuPokemonBattle.name} used ${randomMove.name}!`);
        
        const damage = this.calculateDamage(this.cpuPokemonBattle, this.playerPokemon, randomMove);
        
        setTimeout(() => {
            if (damage > 0) {
                this.playerPokemon.currentHp = Math.max(0, this.playerPokemon.currentHp - damage);
                this.animateAttack('cpu');
                
                if (this.playerPokemon.currentHp <= 0) {
                    this.playerPokemon.isAlive = false;
                    setTimeout(() => {
                        this.displayBattleMessage(`${this.playerPokemon.name} fainted!`);
                        this.animateFaint('player');
                        setTimeout(() => {
                            this.endBattle('cpu');
                        }, 2000);
                    }, 1000);
                } else {
                    // Player's turn
                    setTimeout(() => {
                        this.displayBattleMessage("What will your Pokémon do?");
                        this.showActionMenu();
                        this.isProcessing = false;
                    }, 1500);
                }
            } else {
                this.displayBattleMessage(`It had no effect...`);
                setTimeout(() => {
                    this.displayBattleMessage("What will your Pokémon do?");
                    this.showActionMenu();
                    this.isProcessing = false;
                }, 1500);
            }
            
            this.updateBattleDisplay();
        }, 1000);
    }

    calculateDamage(attacker, defender, move) {
        if (move.power === 0) return 0; // Status move
        
        // Simple damage calculation
        const attack = attacker.stats.attack;
        const defense = defender.stats.defense;
        const power = move.power;
        
        // Base damage formula (simplified)
        let damage = Math.floor(((2 * 50 + 10) / 250) * (attack / defense) * power + 2);
        
        // Add some randomness (85-100%)
        const randomFactor = (Math.random() * 0.15) + 0.85;
        damage = Math.floor(damage * randomFactor);
        
        // Type effectiveness (simplified)
        const effectiveness = this.getTypeEffectiveness(move.type, defender.types);
        damage = Math.floor(damage * effectiveness);
        
        return Math.max(1, damage);
    }

    getTypeEffectiveness(attackType, defenderTypes) {
        // Simplified type chart
        const typeChart = {
            fire: { grass: 2, water: 0.5, fire: 0.5 },
            water: { fire: 2, grass: 0.5, water: 0.5 },
            grass: { water: 2, fire: 0.5, grass: 0.5 },
            electric: { water: 2, flying: 2, grass: 0.5, electric: 0.5 },
            psychic: { fighting: 2, poison: 2, psychic: 0.5 },
            ghost: { psychic: 2, ghost: 2, normal: 0 },
            fighting: { normal: 2, psychic: 0.5, ghost: 0 },
            poison: { grass: 2, poison: 0.5, psychic: 0.5 },
            flying: { grass: 2, fighting: 2, electric: 0.5 },
            ice: { grass: 2, flying: 2, water: 0.5 },
            dragon: { dragon: 2 },
            dark: { psychic: 2, ghost: 2, fighting: 0.5 },
            normal: {}
        };

        let effectiveness = 1;
        
        defenderTypes.forEach(defType => {
            if (typeChart[attackType] && typeChart[attackType][defType] !== undefined) {
                effectiveness *= typeChart[attackType][defType];
            }
        });

        return effectiveness;
    }

    animateAttack(attacker) {
        const sprite = attacker === 'player' ? 
            document.getElementById('playerSprite') : 
            document.getElementById('cpuSprite');
        
        sprite.classList.add('attack-animation');
        setTimeout(() => {
            sprite.classList.remove('attack-animation');
        }, 300);

        // Damage flash on defender
        const defenderSprite = attacker === 'player' ? 
            document.getElementById('cpuSprite') : 
            document.getElementById('playerSprite');
        
        defenderSprite.classList.add('damage-animation');
        setTimeout(() => {
            defenderSprite.classList.remove('damage-animation');
        }, 500);
    }

    animateFaint(pokemon) {
        const sprite = pokemon === 'player' ? 
            document.getElementById('playerSprite') : 
            document.getElementById('cpuSprite');
        
        sprite.classList.add('faint-animation');
    }

    endBattle(winner) {
        this.gameOver = true;
        
        const gameOverTitle = document.getElementById('gameOverTitle');
        const gameOverMessage = document.getElementById('gameOverMessage');
        
        if (winner === 'player') {
            gameOverTitle.textContent = 'Victory!';
            gameOverMessage.textContent = 'You defeated the CPU trainer!';
        } else {
            gameOverTitle.textContent = 'Defeat...';
            gameOverMessage.textContent = 'The CPU trainer won this time.';
        }
        
        setTimeout(() => {
            this.showScreen('gameOverScreen');
        }, 1000);
    }

    displayBattleMessage(message) {
        const logContent = document.querySelector('.log-content');
        logContent.innerHTML = `<p>${message}</p>`;
    }

    showActionMenu() {
        if (this.gameOver) return;
        
        document.getElementById('actionMenu').style.display = 'block';
        document.getElementById('moveMenu').classList.add('hidden');
    }

    hideAllMenus() {
        document.getElementById('actionMenu').style.display = 'none';
        document.getElementById('moveMenu').classList.add('hidden');
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show target screen
        document.getElementById(screenId).classList.remove('hidden');
    }

    resetGame() {
        this.selectedPlayerPokemon = null;
        this.selectedCpuPokemon = null;
        this.playerPokemon = null;
        this.cpuPokemonBattle = null;
        this.currentTurn = 'player';
        this.isProcessing = false;
        this.gameOver = false;
        
        // Reset all Pokemon to full health and PP
        this.availablePokemon.forEach(pokemon => {
            pokemon.currentHp = pokemon.maxHp;
            pokemon.isAlive = true;
            pokemon.moves.forEach(move => {
                move.currentPP = move.pp;
            });
        });

        this.generateCpuTeam();
        this.displayPokemonGrids();
        this.showScreen('selectionScreen');
        
        // Reset button states
        document.getElementById('startBattle').disabled = true;
    }

    setupEventListeners() {
        // Start battle button
        document.getElementById('startBattle').addEventListener('click', () => {
            this.startBattle();
        });

        // Play again button
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.resetGame();
        });

        // Battle action buttons
        document.getElementById('fightBtn').addEventListener('click', () => {
            document.getElementById('actionMenu').style.display = 'none';
            document.getElementById('moveMenu').classList.remove('hidden');
        });

        // Move buttons
        document.querySelectorAll('.move-btn').forEach((button, index) => {
            button.addEventListener('click', () => {
                this.makeMove(index);
            });
        });

        // Back button
        document.getElementById('moveBackBtn').addEventListener('click', () => {
            document.getElementById('moveMenu').classList.add('hidden');
            this.showActionMenu();
        });

        // Battle log click to continue
        document.getElementById('battleLog').addEventListener('click', () => {
            if (this.isProcessing || this.gameOver) return;
            if (this.currentTurn === 'player') {
                this.showActionMenu();
            }
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.isProcessing || this.gameOver) return;
            
            switch(e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (!document.getElementById('actionMenu').style.display || 
                        document.getElementById('actionMenu').style.display !== 'none') {
                        if (this.currentTurn === 'player') {
                            document.getElementById('fightBtn').click();
                        }
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    if (!document.getElementById('moveMenu').classList.contains('hidden')) {
                        document.getElementById('moveBackBtn').click();
                    }
                    break;
            }
        });
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PokemonBattleGame();
});