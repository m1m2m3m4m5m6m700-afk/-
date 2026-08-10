const STORAGE_KEY = "flixo_recent_tasks";

export function getRecentTasks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentTask(prompt: string): string[] {
  if (typeof window === "undefined" || !prompt.trim()) return getRecentTasks();
  try {
    const tasks = getRecentTasks();
    const clean = prompt.trim();
    const filtered = tasks.filter((t) => t.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...filtered].slice(0, 8); // Keep last 8 tasks
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return getRecentTasks();
  }
}

export function clearRecentTasks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return [];
}
