// Pure habit logic, no DOM. Days are local "YYYY-MM-DD" keys.

export function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(key, n) {
  const [y, m, d] = key.split("-").map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}

export function createHabit(name, now = new Date()) {
  return {
    id: `h_${now.getTime().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    name: String(name),
    createdAt: dayKey(now),
    done: [],
  };
}

export function toggleDone(habit, key) {
  const done = habit.done.includes(key) ? habit.done.filter((k) => k !== key) : [...habit.done, key].sort();
  return { ...habit, done };
}

// Consecutive done days ending today.
export function currentStreak(habit, today = dayKey()) {
  let streak = 0;
  let day = today;
  while (habit.done.includes(day)) {
    streak += 1;
    day = addDays(day, -1);
  }
  return streak;
}

export function longestStreak(habit) {
  let best = 0;
  let run = 0;
  let prev = null;
  for (const key of habit.done) {
    run = prev && addDays(prev, 1) === key ? run + 1 : 1;
    best = Math.max(best, run);
    prev = key;
  }
  return best;
}

// Share of the last `days` days (today included) that were done, 0–100.
export function completionRate(habit, today = dayKey(), days = 7) {
  let hits = 0;
  for (let i = 0; i < days; i += 1) if (habit.done.includes(addDays(today, -i))) hits += 1;
  return Math.round((hits / days) * 100);
}

export function formatDay(key, locale = "en-US") {
  const [y, m, d] = key.split("-");
  return `${m}/${d}/${y}`;
}

export function lastDays(today = dayKey(), days = 7) {
  return Array.from({ length: days }, (_, i) => addDays(today, i - days + 1));
}
