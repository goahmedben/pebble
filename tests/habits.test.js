import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addDays,
  completionRate,
  createHabit,
  currentStreak,
  dayKey,
  formatDay,
  lastDays,
  longestStreak,
  toggleDone,
} from "../src/habits.js";

const habit = (done) => ({ id: "h1", name: "Read", createdAt: "2026-10-01", done });

test("dayKey uses local date parts", () => {
  assert.equal(dayKey(new Date(2026, 0, 5)), "2026-01-05");
});

test("addDays crosses months and years", () => {
  assert.equal(addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(addDays("2026-01-01", -1), "2025-12-31");
});

test("createHabit stores the name and creation day", () => {
  const h = createHabit("Read 10 pages", new Date(2026, 9, 28));
  assert.equal(h.name, "Read 10 pages");
  assert.equal(h.createdAt, "2026-10-28");
  assert.deepEqual(h.done, []);
});

test("createHabit rejects empty or whitespace-only names", () => {
  assert.equal(createHabit(""), null);
  assert.equal(createHabit("   \t "), null);
  assert.equal(createHabit(undefined), null);
});

test("createHabit trims surrounding whitespace from the name", () => {
  assert.equal(createHabit("  Walk  ").name, "Walk");
});

test("toggleDone adds then removes a day, keeping order", () => {
  let h = habit(["2026-10-27"]);
  h = toggleDone(h, "2026-10-25");
  assert.deepEqual(h.done, ["2026-10-25", "2026-10-27"]);
  h = toggleDone(h, "2026-10-25");
  assert.deepEqual(h.done, ["2026-10-27"]);
});

test("currentStreak counts consecutive days ending today", () => {
  assert.equal(currentStreak(habit(["2026-10-26", "2026-10-27", "2026-10-28"]), "2026-10-28"), 3);
  assert.equal(currentStreak(habit(["2026-10-25", "2026-10-28"]), "2026-10-28"), 1);
});

test("currentStreak stays active while today is not yet done", () => {
  const h = habit(["2026-10-26", "2026-10-27"]);
  assert.equal(currentStreak(h, "2026-10-28"), 2);
  assert.equal(currentStreak(toggleDone(h, "2026-10-28"), "2026-10-28"), 3);
});

test("currentStreak resets once a full day is missed", () => {
  assert.equal(currentStreak(habit(["2026-10-26", "2026-10-27"]), "2026-10-29"), 0);
  assert.equal(currentStreak(habit([]), "2026-10-28"), 0);
});

test("longestStreak finds the best run", () => {
  assert.equal(longestStreak(habit(["2026-10-01", "2026-10-02", "2026-10-05", "2026-10-06", "2026-10-07"])), 3);
  assert.equal(longestStreak(habit([])), 0);
});

test("completionRate over the last 7 days", () => {
  assert.equal(completionRate(habit(["2026-10-28", "2026-10-27"]), "2026-10-28", 7), 29);
  assert.equal(completionRate(habit([]), "2026-10-28", 7), 0);
});

test("formatDay renders a French date, day before month", () => {
  assert.equal(formatDay("2026-10-28", "fr-FR"), "28/10/2026");
  assert.equal(formatDay("2026-03-05", "fr-FR"), "05/03/2026");
  assert.equal(formatDay("2026-10-28"), "28/10/2026");
  assert.equal(formatDay("2026-10-28", "fr-FR").slice(0, 5), "28/10");
});

test("formatDay follows the given locale", () => {
  assert.equal(formatDay("2026-10-28", "en-US"), "10/28/2026");
  assert.equal(formatDay("2026-10-28", "en-GB"), "28/10/2026");
});

test("lastDays returns oldest first, ending today", () => {
  assert.deepEqual(lastDays("2026-10-28", 3), ["2026-10-26", "2026-10-27", "2026-10-28"]);
});
