interface MatchResult {
  id: string;
  opponent: string;
  result: 'win' | 'loss';
  timestamp: string;
}

const STORAGE_KEY = 'mona-mayhem-match-history';

function getHistory(): MatchResult[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const value = window.localStorage.getItem(STORAGE_KEY);
  if (!value) {
    return [];
  }

  try {
    return JSON.parse(value) as MatchResult[];
  } catch {
    return [];
  }
}

function saveHistory(history: MatchResult[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleString();
}

function renderHistory() {
  const history = getHistory();
  const winsCount = history.filter((item) => item.result === 'win').length;
  const lossesCount = history.filter((item) => item.result === 'loss').length;

  const winsLabel = document.getElementById('wins-count');
  const lossesLabel = document.getElementById('losses-count');
  const rowsRoot = document.getElementById('history-rows');
  const emptyState = document.getElementById('empty-state');

  if (winsLabel) {
    winsLabel.textContent = String(winsCount);
  }
  if (lossesLabel) {
    lossesLabel.textContent = String(lossesCount);
  }

  if (rowsRoot) {
    rowsRoot.innerHTML = history
      .map(
        (item) => `
        <tr class="${item.result}">
          <td>${item.result === 'win' ? 'Win' : 'Loss'}</td>
          <td>${item.opponent}</td>
          <td>${formatTimestamp(item.timestamp)}</td>
        </tr>
      `
      )
      .join('');
  }

  if (emptyState) {
    emptyState.style.display = history.length ? 'none' : 'block';
  }
}

function addMatch(result: 'win' | 'loss', opponent: string) {
  const history = getHistory();
  history.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    opponent: opponent || 'Unknown opponent',
    result,
    timestamp: new Date().toISOString(),
  });
  saveHistory(history);
  renderHistory();
}

function clearHistory() {
  saveHistory([]);
  renderHistory();
}

export function initMatchHistory() {
  const opponentInput = document.getElementById('opponent-name') as HTMLInputElement | null;
  const winButton = document.getElementById('add-win');
  const lossButton = document.getElementById('add-loss');
  const clearButton = document.getElementById('clear-history');

  if (!winButton || !lossButton || !clearButton || !opponentInput) {
    return;
  }

  winButton.addEventListener('click', () => {
    addMatch('win', opponentInput.value.trim());
    opponentInput.value = '';
  });

  lossButton.addEventListener('click', () => {
    addMatch('loss', opponentInput.value.trim());
    opponentInput.value = '';
  });

  clearButton.addEventListener('click', () => {
    clearHistory();
  });

  renderHistory();
}
