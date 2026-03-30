import type { GameState, DecisionHistoryEntry } from "./types";

const SAVE_KEY = "startup-autopsy-save";

export interface SavedGame {
  scenarioId: string;
  currentDecisionIndex: number;
  gameState: GameState;
  decisionHistory: DecisionHistoryEntry[];
  savedAt: string;
}

export function saveGame(data: Omit<SavedGame, "savedAt">): void {
  const save: SavedGame = { ...data, savedAt: new Date().toISOString() };
  localStorage.setItem(`${SAVE_KEY}-${data.scenarioId}`, JSON.stringify(save));
}

export function loadGame(scenarioId: string): SavedGame | null {
  try {
    const raw = localStorage.getItem(`${SAVE_KEY}-${scenarioId}`);
    if (!raw) return null;
    return JSON.parse(raw) as SavedGame;
  } catch {
    return null;
  }
}

export function deleteSave(scenarioId: string): void {
  localStorage.removeItem(`${SAVE_KEY}-${scenarioId}`);
}

export function hasSave(scenarioId: string): boolean {
  return localStorage.getItem(`${SAVE_KEY}-${scenarioId}`) !== null;
}
