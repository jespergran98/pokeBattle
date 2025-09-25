// Pokemon Battle Game JavaScript
class PokemonBattleGame {
    constructor() {
        this.availablePokemon = [];
        this.selectedPokemon = [];
        this.gameId = null;
        this.gameState = null;
        this.isProcessing = false;
        this.battleLogMessages = [];
        this.currentLogIndex = 0;
        
        this.init();
    }

    async init() {
        await this.loadPokemon();
        this.setupEventListeners();
    }

    async loadPokemon() {
        try {
            const response = await fetch('/api/pokemon/random');
            if (response.ok) {
                this.availablePokemon = await response.json();
                this.displayPokemonGrid();
                this.showScreen('selectionScreen');
            } else {
                console.error('Failed to load Pokemon');
            }
        } catch (error) {
            console.error('Error loading Pokemon:', error);
        }
    }

    displayPokemonGrid() {
        const grid = document.getElementById('pokemonGrid');
        grid.innerHTML = '';

        this.availablePokemon.forEach(pokemon => {
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

            card.addEventListener('click', () => this.selectPokemon(pokemon));
            grid.appendChild(card);
        });
    }

    selectPokemon(pokemon) {
        if (this.selectedPokemon.length >= 3) return;
        if (this.selectedPokemon.find(p => p.id === pokemon.id)) return;

        this.selectedPokemon.push(pokemon);
        this.updateSelectedDisplay();
        this.updatePokemonCards();
    }

    updateSelectedDisplay() {
        const selectedTeam = document.getElementById('selectedTeam');
        const selectedCount = document.getElementById('selectedCount');
        const startButton = document.getElementById('startBattle');

        selectedCount.textContent = this.selectedPokemon.length;
        selectedTeam.innerHTML = '';

        // Create 3 slots
        for (let i = 0; i < 3; i++) {
            const slot = document.createElement('div');
            slot.className = 'team-slot';

            if (i < this.selectedPokemon.length) {
                const pokemon = this.selectedPokemon[i];
                slot.className += ' filled';
                slot.innerHTML = `
                    <img src="${pokemon.spriteUrl}" alt="${pokemon.name}">
                    <div class="name">${pokemon.name}</div>
                `;
            } else {
                slot.innerHTML = `<span style="font-size: 0.5rem; color: #999;">Empty</span>`;
            }

            selectedTeam.appendChild(slot);
        }

        startButton.disabled = this.selectedPokemon.length < 3;
    }

    updatePokemonCards() {
        const cards = document.querySelectorAll('.pokemon-card');
        cards.forEach(card => {
            const pokemonId = parseInt(card.dataset.pokemonId);
            const isSelected = this.selectedPokemon.find(p => p.id === pokemonId);
            card.classList.toggle('selected', !!isSelected);
        });
    }

    async startBattle() {
        if (this.selectedPokemon.length !== 3) return;

        try {
            // Generate random CPU team
            const availableIds = this.availablePokemon.map(p => p.id);
            const playerIds = this.selectedPokemon.map(p => p.id);
            const cpuIds = [];
            
            while (cpuIds.length < 3) {
                const randomId = availableIds[Math.floor(Math.random() * availableIds.length)];
                if (!cpuIds.includes(randomId) && !playerIds.includes(randomId)) {
                    cpuIds.push(randomId);
                }
            }

            const response = await fetch('/api/game/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerPokemon: playerIds,
                    cpuPokemon: cpuIds
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.gameId = result.gameId;
                
                // Wait for game state to be ready
                await this.waitForGameReady();
                this.showScreen('battleScreen');
            }
        } catch (error) {
            console.error('Error starting battle:', error);
        }
    }

    async waitForGameReady() {
        let attempts = 0;
        const maxAttempts = 20;
        
        while (attempts < maxAttempts) {
            try {
                const response = await fetch(`/api/game/${this.gameId}`);
                if (response.ok) {
                    const gameState = await response.json();
                    if (gameState.player && gameState.cpu && 
                        gameState.player.team.length > 0 && gameState.cpu.team.length > 0) {
                        this.gameState = gameState;
                        this.updateBattleDisplay();
                        this.displayBattleMessage("Battle begin!");
                        return;
                    }
                }
            } catch (error) {
                console.error('Error checking game state:', error);
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    updateBattleDisplay() {
        if (!this.gameState) return;

        const playerPokemon = this.gameState.player.activePokemon || this.gameState.player.team[0];
        const cpuPokemon = this.gameState.cpu.activePokemon || this.gameState.cpu.team[0];

        // Update player Pokemon
        if (playerPokemon) {
            document.getElementById('playerSprite').src = playerPokemon.spriteUrl;
            document.getElementById('playerName').textContent = playerPokemon.name;
            document.getElementById('playerLevel').textContent = 'Lv.50';
            document.getElementById('playerHpText').textContent = `${playerPokemon.currentHp}/${playerPokemon.maxHp}`;
            
            const playerHpBar = document.getElementById('playerHpBar');
            const playerHpPercent = (playerPokemon.currentHp / playerPokemon.maxHp) * 100;
            playerHpBar.style.width = `${playerHpPercent}%`;
            
            // Update HP bar color
            playerHpBar.className = 'hp-fill';
            if (playerHpPercent <= 20) playerHpBar.classList.add('critical');
            else if (playerHpPercent <= 50) playerHpBar.classList.add('low');

            // Update moves
            this.updateMoveButtons(playerPokemon);
        }

        // Update CPU Pokemon
        if (cpuPokemon) {
            document.getElementById('enemySprite').src = cpuPokemon.spriteUrl;
            document.getElementById('enemyName').textContent = cpuPokemon.name;
            document.getElementById('enemyLevel').textContent = 'Lv.50';
            
            const enemyHpBar = document.getElementById('enemyHpBar');
            const enemyHpPercent = (cpuPokemon.currentHp / cpuPokemon.maxHp) * 100;
            enemyHpBar.style.width = `${enemyHpPercent}%`;
            
            // Update HP bar color
            enemyHpBar.className = 'hp-fill';
            if (enemyHpPercent <= 20) enemyHpBar.classList.add('critical');
            else if (enemyHpPercent <= 50) enemyHpBar.classList.add('low');
        }

        // Update switch menu
        this.updateSwitchMenu();

        // Check if game is over
        if (this.gameState.status === 1) { // GameOver
            setTimeout(() => this.showGameOver(), 2000);
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

    updateSwitchMenu() {
        const switchList = document.getElementById('switchPokemonList');
        switchList.innerHTML = '';

        this.gameState.player.team.forEach((pokemon, index) => {
            if (index === this.gameState.player.activePokemonIndex) return; // Skip active Pokemon

            const switchOption = document.createElement('div');
            switchOption.className = `switch-pokemon ${!pokemon.isAlive ? 'fainted' : ''}`;
            switchOption.dataset.pokemonIndex = index;

            switchOption.innerHTML = `
                <img src="${pokemon.spriteUrl}" alt="${pokemon.name}">
                <div class="switch-info">
                    <div class="name">${pokemon.name}</div>
                    <div class="hp">${pokemon.currentHp}/${pokemon.maxHp} HP</div>
                </div>
            `;

            if (pokemon.isAlive) {
                switchOption.addEventListener('click', () => this.switchPokemon(index));
            }

            switchList.appendChild(switchOption);
        });
    }

    async makeMove(moveIndex) {
        if (this.isProcessing || !this.gameState) return;
        
        this.isProcessing = true;
        this.hideAllMenus();

        try {
            const response = await fetch(`/api/game/${this.gameId}/move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    attackerId: 'player',
                    defenderId: 'cpu',
                    moveIndex: moveIndex
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.gameState = result.gameState;
                
                // Process battle log messages
                this.processBattleLog();
                
                // Update display after messages
                setTimeout(() => {
                    this.updateBattleDisplay();
                    this.isProcessing = false;
                    
                    if (this.gameState.status !== 1 && this.gameState.currentTurn === 'player') {
                        this.showActionMenu();
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('Error making move:', error);
            this.isProcessing = false;
        }
    }

    async switchPokemon(pokemonIndex) {
        if (this.isProcessing || !this.gameState) return;
        
        this.isProcessing = true;
        this.hideAllMenus();

        try {
            const response = await fetch(`/api/game/${this.gameId}/switch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerId: 'player',
                    pokemonIndex: pokemonIndex
                })
            });

            if (response.ok) {
                this.gameState = await response.json();
                this.processBattleLog();
                
                setTimeout(() => {
                    this.updateBattleDisplay();
                    this.isProcessing = false;
                    this.showActionMenu();
                }, 1500);
            }
        } catch (error) {
            console.error('Error switching Pokemon:', error);
            this.isProcessing = false;
        }
    }

    processBattleLog() {
        const logContent = document.querySelector('.log-content');
        
        if (this.gameState.battleLog.length > 0) {
            const latestMessages = this.gameState.battleLog.slice(-3); // Show last 3 messages
            logContent.innerHTML = latestMessages.map(msg => `<p>${msg}</p>`).join('');
        }
        
        // Auto-scroll to bottom
        const battleLog = document.getElementById('battleLog');
        battleLog.scrollTop = battleLog.scrollHeight;
    }

    displayBattleMessage(message) {
        const logContent = document.querySelector('.log-content');
        logContent.innerHTML = `<p>${message}</p>`;
    }

    showActionMenu() {
        if (this.gameState.status === 1) return; // Don't show menu if game is over
        
        document.getElementById('actionMenu').style.display = 'block';
        document.getElementById('moveMenu').classList.add('hidden');
        document.getElementById('switchMenu').classList.add('hidden');
    }

    hideAllMenus() {
        document.getElementById('actionMenu').style.display = 'none';
        document.getElementById('moveMenu').classList.add('hidden');
        document.getElementById('switchMenu').classList.add('hidden');
    }

    showGameOver() {
        const gameOverTitle = document.getElementById('gameOverTitle');
        const gameOverMessage = document.getElementById('gameOverMessage');
        
        if (this.gameState.winner === 'player') {
            gameOverTitle.textContent = 'Victory!';
            gameOverMessage.textContent = 'You defeated the CPU trainer!';
        } else {
            gameOverTitle.textContent = 'Defeat...';
            gameOverMessage.textContent = 'The CPU trainer won this time.';
        }
        
        this.showScreen('gameOverScreen');
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
        this.selectedPokemon = [];
        this.gameId = null;
        this.gameState = null;
        this.isProcessing = false;
        this.battleLogMessages = [];
        this.currentLogIndex = 0;
        
        this.updateSelectedDisplay();
        this.updatePokemonCards();
        this.loadPokemon();
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

        document.getElementById('pokemonBtn').addEventListener('click', () => {
            document.getElementById('actionMenu').style.display = 'none';
            document.getElementById('switchMenu').classList.remove('hidden');
        });

        // Move buttons
        document.querySelectorAll('.move-btn').forEach((button, index) => {
            button.addEventListener('click', () => {
                this.makeMove(index);
            });
        });

        // Back buttons
        document.getElementById('moveBackBtn').addEventListener('click', () => {
            document.getElementById('moveMenu').classList.add('hidden');
            this.showActionMenu();
        });

        document.getElementById('switchBackBtn').addEventListener('click', () => {
            document.getElementById('switchMenu').classList.add('hidden');
            this.showActionMenu();
        });

        // Battle log click to continue
        document.getElementById('battleLog').addEventListener('click', () => {
            if (this.isProcessing) return;
            if (this.gameState && this.gameState.currentTurn === 'player' && this.gameState.status !== 1) {
                this.showActionMenu();
            }
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.isProcessing) return;
            
            switch(e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (!document.getElementById('actionMenu').style.display || 
                        document.getElementById('actionMenu').style.display !== 'none') {
                        // Action menu is visible, trigger first action
                        if (this.gameState && this.gameState.currentTurn === 'player') {
                            document.getElementById('fightBtn').click();
                        }
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    if (!document.getElementById('moveMenu').classList.contains('hidden')) {
                        document.getElementById('moveBackBtn').click();
                    } else if (!document.getElementById('switchMenu').classList.contains('hidden')) {
                        document.getElementById('switchBackBtn').click();
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