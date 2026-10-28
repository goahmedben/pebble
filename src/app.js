import { config } from "./config.js";
import { completionRate, createHabit, currentStreak, dayKey, formatDay, lastDays, longestStreak, toggleDone } from "./habits.js";

const STORE = "pebble.habits.v1";
const PERSONAS = {
  u_ana: { id: "u_ana", name: "Ana", email: "ana@example.com", plan: "pro", locale: "en-US" },
  u_ben: { id: "u_ben", name: "Ben", email: "ben@example.com", plan: "free", locale: "en-GB" },
  u_chloe: { id: "u_chloe", name: "Chloé", email: "chloe@example.com", plan: "free", locale: "fr-FR" },
};

const $ = (id) => document.getElementById(id);
const list = $("habits");

// Queue stub so calls work before the Camelus widget script has loaded.
window.camelus = window.camelus || function () { (window.camelus.q = window.camelus.q || []).push(arguments); };

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORE)) ?? [];
  } catch {
    return [];
  }
}

let habits = load();

function save() {
  try {
    localStorage.setItem(STORE, JSON.stringify(habits));
  } catch {}
}

function track(event, params = {}) {
  if (typeof window.gtag === "function") window.gtag("event", event, params);
}

// you@gmail.com → you+ana@gmail.com, so demo users' emails land in a real inbox.
function personaEmail(p) {
  const [user, domain] = config.mailbox.split("@");
  return domain ? `${user}+${p.id.slice(2)}@${domain}` : p.email;
}

function persona() {
  const p = PERSONAS[$("persona").value];
  return p ? { ...p, email: personaEmail(p) } : null;
}

function render() {
  const today = dayKey();
  const locale = persona()?.locale ?? navigator.language;
  $("empty").hidden = habits.length > 0;
  list.replaceChildren(
    ...habits.map((h) => {
      const li = document.createElement("li");
      li.className = "habit";
      li.dataset.testid = "habit";
      li.innerHTML = `
        <div class="habit-head">
          <h3></h3>
          <button type="button" class="ghost remove" data-testid="remove">Remove</button>
        </div>
        <div class="stats">
          <span>Streak <b data-testid="streak">${currentStreak(h, today)}</b></span>
          <span>Best <b data-testid="best">${longestStreak(h)}</b></span>
          <span>This week <b data-testid="rate">${completionRate(h, today)}%</b></span>
        </div>
        <div class="week"></div>`;
      li.querySelector("h3").textContent = h.name;
      li.querySelector(".remove").onclick = () => {
        habits = habits.filter((x) => x.id !== h.id);
        save();
        render();
      };
      li.querySelector(".week").append(
        ...lastDays(today).map((key) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "day" + (key === today ? " today" : "");
          b.dataset.testid = "day";
          b.dataset.day = key;
          b.setAttribute("aria-pressed", String(h.done.includes(key)));
          b.setAttribute("aria-label", `${h.name}, ${formatDay(key, locale)}`);
          b.title = formatDay(key, locale);
          b.innerHTML = `<span class="dot"></span><span></span>`;
          b.lastChild.textContent = formatDay(key, locale).slice(0, 5);
          b.onclick = () => {
            habits = habits.map((x) => (x.id === h.id ? toggleDone(x, key) : x));
            save();
            render();
            track("habit_check", { day: key });
          };
          return b;
        }),
      );
      return li;
    }),
  );
}

$("add").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("name");
  const habit = createHabit(input.value);
  if (!habit) {
    input.value = "";
    input.focus();
    return;
  }
  habits = [...habits, habit];
  input.value = "";
  save();
  render();
  track("habit_add");
});

$("seed").onclick = () => {
  const today = dayKey();
  const days = lastDays(today, 10);
  habits = [
    { ...createHabit("Read 10 pages"), done: days.slice(0, 9) }, // done up to yesterday, not today yet
    { ...createHabit("Walk 20 minutes"), done: days.filter((_, i) => i % 2 === 0) },
    { ...createHabit("Drink water"), done: days },
  ];
  save();
  render();
};

$("reset").onclick = () => {
  habits = [];
  save();
  render();
};

$("persona").onchange = () => {
  const p = persona();
  if (p) {
    // Unverified identity (no hash): Camelus keeps it as a claim. See README for verified identities.
    window.camelus("identify", { id: p.id, email: p.email, name: p.name });
    window.camelus("meta", { plan: p.plan, app_version: "1.0.0" });
  }
  render();
};

$("feedback").onclick = () => window.camelus("open");
$("bug").onclick = () => window.camelus("open", { type: "bug" });

function loadCamelus() {
  const c = config.camelus;
  if (!c.key) return "Camelus: off (no key)";
  window.camelus("meta", { app_version: "1.0.0" });
  const s = document.createElement("script");
  s.src = c.script;
  s.async = true;
  s.dataset.key = c.key;
  s.dataset.api = c.api;
  if (c.headless) s.dataset.headless = "true";
  if (c.locale) s.dataset.locale = c.locale;
  document.body.appendChild(s);
  return "Camelus: on";
}

function loadGa4() {
  const id = config.alpaga.ga4;
  if (!id) return "GA4: off";
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", id);
  const s = document.createElement("script");
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  s.async = true;
  document.head.appendChild(s);
  return `GA4: ${id}`;
}

$("status").textContent = `${loadCamelus()} · ${loadGa4()}`;
render();
