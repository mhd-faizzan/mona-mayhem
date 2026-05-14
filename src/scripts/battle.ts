interface PlayerState {
  username: string;
  health: number;
  maxHealth: number;
  damage: number;
}

interface BattleState {
  player1: PlayerState;
  player2: PlayerState;
  round: number;
  finished: boolean;
  winner: 'PLAYER 1' | 'PLAYER 2' | 'DRAW' | null;
  log: string[];
}

const STARTING_HEALTH = 100;
const MIN_DAMAGE = 8;
const MAX_DAMAGE = 16;

function getElement<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createPlayer(username: string): PlayerState {
  return {
    username: username || 'UNKNOWN',
    health: STARTING_HEALTH,
    maxHealth: STARTING_HEALTH,
    damage: 0,
  };
}

function randomDamage() {
  return Math.floor(Math.random() * (MAX_DAMAGE - MIN_DAMAGE + 1)) + MIN_DAMAGE;
}

function renderHealth(player: PlayerState, healthBarId: string, healthTextId: string) {
  const healthBar = getElement<HTMLDivElement>(healthBarId);
  const healthText = getElement<HTMLSpanElement>(healthTextId);
  if (!healthBar || !healthText) return;

  const percent = clamp((player.health / player.maxHealth) * 100, 0, 100);
  healthBar.style.width = `${percent}%`;
  healthText.textContent = `${player.health} / ${player.maxHealth}`;
}

function appendLog(message: string) {
  const logRoot = getElement<HTMLDivElement>('battle-log');
  if (!logRoot) return;
  const entry = document.createElement('div');
  entry.textContent = message;
  logRoot.prepend(entry);
}

function setStatus(text: string) {
  const status = getElement<HTMLSpanElement>('battle-status');
  if (status) {
    status.textContent = text;
  }
}

function setRound(round: number) {
  const roundLabel = getElement<HTMLSpanElement>('round-counter');
  if (roundLabel) {
    roundLabel.textContent = String(round);
  }
}

function setGameOverScreen(state: BattleState) {
  const wrapper = getElement<HTMLDivElement>('game-over-wrapper');
  if (!wrapper) return;

  const status = getElement<HTMLHeadingElement>('game-over-status');
  const winner = getElement<HTMLParagraphElement>('game-over-winner');
  const subtitle = getElement<HTMLParagraphElement>('game-over-subtitle');
  const stats = getElement<HTMLDivElement>('game-over-stats');

  if (status) status.textContent = state.winner === 'DRAW' ? 'DRAW' : 'VICTORY';
  const winnerName = state.winner === 'PLAYER 1'
    ? state.player1.username
    : state.winner === 'PLAYER 2'
    ? state.player2.username
    : 'DRAW';

  if (winner) winner.textContent = winnerName;
  if (subtitle) {
    subtitle.textContent = state.winner === 'DRAW'
      ? 'THE ARENA COULD NOT BE CONQUERED'
      : `${winnerName} ROSE FROM THE BATTLEFIELD`;
  }

  if (stats) {
    const winnerHealth = state.winner === 'PLAYER 1' ? state.player1.health : state.player2.health;
    const loserHealth = state.winner === 'PLAYER 1' ? state.player2.health : state.player1.health;

    stats.innerHTML = `
      <div class="stat-item">
        <span class="stat-name">Rounds</span>
        <span class="stat-value">${state.round}</span>
      </div>
      <div class="stat-item">
        <span class="stat-name">Damage</span>
        <span class="stat-value">${state.player1.damage + state.player2.damage}</span>
      </div>
      <div class="stat-item">
        <span class="stat-name">Winner Health</span>
        <span class="stat-value">${winnerHealth}</span>
      </div>
      <div class="stat-item">
        <span class="stat-name">Loser Health</span>
        <span class="stat-value">${loserHealth}</span>
      </div>
    `;
  }

  wrapper.classList.remove('hidden');
}

function hideGameOverScreen() {
  const wrapper = getElement<HTMLDivElement>('game-over-wrapper');
  if (wrapper) wrapper.classList.add('hidden');
}

function resolveAttack(attacker: PlayerState, defender: PlayerState): number {
  const damage = randomDamage();
  defender.health = Math.max(0, defender.health - damage);
  attacker.damage += damage;
  return damage;
}

export function initBattleApp() {
  const startButton = getElement<HTMLButtonElement>('start-battle');
  const nextButton = getElement<HTMLButtonElement>('next-round');
  const playAgainButton = getElement<HTMLButtonElement>('play-again-button');
  const playerOneInput = getElement<HTMLInputElement>('username-1');
  const playerTwoInput = getElement<HTMLInputElement>('username-2');

  if (!startButton || !nextButton || !playAgainButton || !playerOneInput || !playerTwoInput) {
    return;
  }

  let state: BattleState = {
    player1: createPlayer('PLAYER 1'),
    player2: createPlayer('PLAYER 2'),
    round: 0,
    finished: false,
    winner: null,
    log: [],
  };

  function resetState() {
    state = {
      player1: createPlayer('PLAYER 1'),
      player2: createPlayer('PLAYER 2'),
      round: 0,
      finished: false,
      winner: null,
      log: [],
    };
    hideGameOverScreen();
    setRound(0);
    setStatus('IDLE');
    const logRoot = getElement<HTMLDivElement>('battle-log');
    if (logRoot) {
      logRoot.innerHTML = '';
    }
    appendLog('Ready for a new battle.');
    getElement<HTMLSpanElement>('player-1-name')!.textContent = 'READY';
    getElement<HTMLSpanElement>('player-2-name')!.textContent = 'READY';
    renderHealth(state.player1, 'player-1-health', 'player-1-health-text');
    renderHealth(state.player2, 'player-2-health', 'player-2-health-text');
    nextButton.disabled = true;
  }

  function renderBattleState() {
    getElement<HTMLSpanElement>('player-1-name')!.textContent = state.player1.username;
    getElement<HTMLSpanElement>('player-2-name')!.textContent = state.player2.username;
    renderHealth(state.player1, 'player-1-health', 'player-1-health-text');
    renderHealth(state.player2, 'player-2-health', 'player-2-health-text');
    setRound(state.round);
    setStatus(state.finished ? 'FINISHED' : 'BATTLE');
  }

  function startBattle() {
    const name1 = playerOneInput.value.trim() || 'PLAYER 1';
    const name2 = playerTwoInput.value.trim() || 'PLAYER 2';
    state.player1 = createPlayer(name1);
    state.player2 = createPlayer(name2);
    state.round = 1;
    state.finished = false;
    state.winner = null;
    state.log = [];
    hideGameOverScreen();
    nextButton.disabled = false;
    appendLog(`THE ARENA OPENS FOR ${name1} VS ${name2}`);
    renderBattleState();
  }

  function nextRound() {
    if (state.finished) return;
    const firstAttack = resolveAttack(state.player1, state.player2);
    appendLog(`${state.player1.username} hits ${state.player2.username} for ${firstAttack}.`);

    if (state.player2.health > 0) {
      const secondAttack = resolveAttack(state.player2, state.player1);
      appendLog(`${state.player2.username} strikes back for ${secondAttack}.`);
    }

    if (state.player1.health <= 0 && state.player2.health <= 0) {
      state.finished = true;
      state.winner = 'DRAW';
      appendLog('THE ARENA FALLS SILENT: DRAW.');
    } else if (state.player1.health <= 0) {
      state.finished = true;
      state.winner = 'PLAYER 2';
      appendLog(`${state.player2.username} SEIZES VICTORY!`);
    } else if (state.player2.health <= 0) {
      state.finished = true;
      state.winner = 'PLAYER 1';
      appendLog(`${state.player1.username} SEIZES VICTORY!`);
    }

    renderBattleState();

    if (state.finished) {
      setGameOverScreen(state);
      nextButton.disabled = true;
    } else {
      state.round += 1;
    }
  }

  startButton.addEventListener('click', startBattle);
  nextButton.addEventListener('click', nextRound);
  playAgainButton.addEventListener('click', () => {
    resetState();
  });

  resetState();
}
