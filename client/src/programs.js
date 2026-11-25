/* Mehrmonatige Programme (aus mehreren Wochenplänen, die sich zeitlich ablösen).
   Übungsnamen entsprechen der Übungsbibliothek; fehlende werden beim Anlegen ergänzt. */

const MIN_PER_KM = 6.75; // grobe Annahme für lockeres Einsteiger-Tempo (nur für die km-Schätzung)
const kmText = (min) => { const km = Math.round((min / MIN_PER_KM) * 2) / 2; return `ca. ${String(km).replace(".", ",")} km`; };

const BACK_NOTE = "Rücken: kurze, leichte Schritte, aufrechter Oberkörper. Bei Rückenschmerz über 3/10 auf Gehen wechseln.";

const it = (ex, o = {}) => ({ ex, unit: o.unit || "kg", rest: o.rest ?? 60, rir: o.rir || "", note: o.note || "", sets: o.sets });
const kgSets = (n, reps) => Array.from({ length: n }, () => ({ reps, weight: "" }));
const minSet = (min, distance = "") => ({ reps: "", weight: String(min), distance });

/* Geh-/Lauf-Einheit: Aufwärmen (Gehen) – Hauptteil – Auslaufen (Gehen).
   run.walk = true: Hauptteil ist zügiges Gehen statt Traben. */
function runDay(weekday, name, run, dayNote) {
  const warm = 5, cool = 3;
  const ex = run.walk ? "Gehen" : "Laufen";
  const WALK_NOTE = "Zügig gehen: leicht außer Atem, aber noch in kurzen Sätzen sprechen. Aufrecht gehen, Schultern locker.";
  let summary;
  // reines, gleichmäßiges Gehen: eine einzige Einheit ohne Extra-Aufwärmen
  if (run.walk && run.min && !run.parts) {
    summary = `${run.min} Min zügig gehen`;
    return { weekday, sessionName: name, note: dayNote || "", summary, groups: [
      { type: "normal", purpose: "training", rounds: 1, items: [it("Gehen", { unit: "min", rest: 0, note: run.note || `${WALK_NOTE} Die ersten 5 und die letzten 3 Minuten etwas lockerer. Kurze Pausen sind erlaubt.`, sets: [minSet(run.min)] })] },
    ] };
  }
  let main;
  if (run.parts) {
    const same = run.parts.every((p) => p === run.parts[0]);
    const verb = run.walk ? "zügig gehen" : "traben";
    const slow = run.walk ? "locker gehen" : "gehen";
    summary = same ? `${run.parts.length}× ${run.parts[0]}' ${verb} / ${run.pause}' ${slow}` : `${run.parts.join("' + ")}' ${verb}, dazwischen ${run.pause}' ${slow}`;
    main = it(ex, { unit: "min", rest: 0, note: (run.walk ? `${WALK_NOTE} Zwischen den Abschnitten jeweils ${run.pause} Min locker gehen.` : `Traben = sehr locker, Sprechtempo (ganze Sätze sprechen). Zwischen den Abschnitten jeweils ${run.pause} Min zügig gehen.`) + " " + BACK_NOTE, sets: run.parts.map((q) => minSet(q)) });
  } else {
    summary = run.label || `${run.min} Min locker laufen (${kmText(run.min)})`;
    main = it("Laufen", { unit: "min", rest: 0, note: run.note || `Gleichmäßig locker laufen, Sprechtempo. Wenn nötig 1 Min gehen – das ist kein Wettkampf. ${BACK_NOTE}`, sets: [minSet(run.min, run.distance || kmText(run.min))] });
  }
  return {
    weekday, sessionName: name, note: dayNote || "", summary,
    groups: [
      { type: "normal", purpose: "warmup", rounds: 1, items: [it("Gehen", { unit: "min", rest: 0, note: "Gemütlich gehen, Schultern locker, Rücken aufrecht.", sets: [minSet(warm)] })] },
      { type: "normal", purpose: "training", rounds: 1, items: [main] },
      { type: "normal", purpose: "cooldown", rounds: 1, items: [it("Gehen", { unit: "min", rest: 0, note: "Langsam auslaufen, Puls runterfahren.", sets: [minSet(cool)] })] },
    ],
  };
}

// In Supersätzen beschreiben die Sätze einer Übung EINE Runde; die App wiederholt sie "rounds"-mal.
const ss = (rounds, items) => ({ type: "superset", purpose: "training", rounds, items: items.map((x) => ({ ...x, sets: x.sets.slice(0, 1) })) });
const warmup = (note) => ({ type: "normal", purpose: "warmup", rounds: 1, items: [it("Stretching", { unit: "min", rest: 0, note, sets: [minSet(3)] })] });
const WARM_NOTE = "Mobilisation: Katze-Kuh auf allen Vieren, Hüftkreisen, Arme kreisen, 5 langsame Kniebeugen ohne Gewicht.";
const HINGE = "Hüfte nach hinten schieben, Rücken lang und neutral, Hantel am Körper entlang, nur so tief wie der Rücken gerade bleibt.";

/* Kraft Zuhause (Langhantel, Scheiben, Kurzhanteln, Körpergewicht) – rückenfreundlich, ca. 25 Min */
function strengthDay(level, rounds, dayNote) {
  const r = rounds;
  let groups, summary;
  if (level === 1) {
    summary = "Einstieg: Kniebeuge, Rudern, Brücke, Liegestütz (Knie), Rumpf";
    groups = [
      warmup(WARM_NOTE),
      ss(r, [it("Squat (Dumbbell)", { rir: "3-4", rest: 45, note: "Kurzhantel vor der Brust halten, nur so tief wie schmerzfrei.", sets: kgSets(r, "12-15") }), it("Bent Over One Arm Row (Dumbbell)", { rir: "3-4", rest: 45, note: "Freie Hand auf Stuhl oder Oberschenkel abstützen, Rücken gerade. Pro Seite.", sets: kgSets(r, "12-15") })]),
      ss(r, [it("Hip Thrust (Bodyweight)", { rir: "3-4", rest: 45, note: "Brücke aus der Rückenlage, oben Gesäß fest anspannen.", sets: kgSets(r, "12-15") }), it("Push Up (Knees)", { rir: "3-4", rest: 45, sets: kgSets(r, "8-12") })]),
      ss(r, [it("Plank", { rir: "3", rest: 30, note: "Körper in einer Linie, nicht ins Hohlkreuz fallen.", sets: kgSets(r, "20-30 Sek") }), it("Superman", { rir: "3", rest: 30, note: "Langsam, Arme und Beine nur leicht anheben. Bei Rückenzwicken abwechselnd Arm/Bein.", sets: kgSets(r, "8-10") })]),
    ];
  } else if (level === 2 || level === 3) {
    const barbell = level === 3;
    summary = `Aufbau: Kniebeuge, Rudern, ${barbell ? "Langhantel-Kreuzheben (rumänisch)" : "Kreuzheben (rumänisch)"}, Liegestütz, Schulterdrücken, Plank`;
    groups = [
      warmup(WARM_NOTE),
      ss(r, [it("Squat (Dumbbell)", { rir: "2-3", rest: 45, note: "Kurzhantel vor der Brust, Fersen am Boden.", sets: kgSets(r, "10-12") }), it("Bent Over One Arm Row (Dumbbell)", { rir: "2-3", rest: 45, note: "Freie Hand abstützen, Rücken gerade. Pro Seite.", sets: kgSets(r, "10-12") })]),
      ss(r, [it(barbell ? "Romanian Deadlift (Barbell)" : "Romanian Deadlift (Dumbbell)", { rir: "2-3", rest: 60, note: (barbell ? "Mit der leeren Stange beginnen. " : "") + HINGE, sets: kgSets(r, "10-12") }), it(barbell ? "Push Up" : "Push Up (Knees)", { rir: "2-3", rest: 45, sets: kgSets(r, "8-12") })]),
      ss(2, [it("Seated Overhead Press (Dumbbell)", { rir: "2-3", rest: 45, note: "Auf einem Stuhl sitzen, Rücken angelehnt, nicht ins Hohlkreuz drücken.", sets: kgSets(2, "10-12") }), it("Plank", { rir: "2", rest: 30, sets: kgSets(2, "30-40 Sek") })]),
    ];
  } else {
    summary = "Stabilität fürs Laufen: Ausfallschritt, Rudern, Kreuzheben (Langhantel), Liegestütz, Hüftbrücke, Waden, Seitstütz";
    groups = [
      warmup(WARM_NOTE),
      ss(r, [it("Lunge (Dumbbell)", { rir: "2", rest: 45, note: "Aufrechter Oberkörper, kurzer Schritt. Pro Bein. Alternativ Step-up auf eine stabile Stufe.", sets: kgSets(r, "8-10") }), it("Bent Over One Arm Row (Dumbbell)", { rir: "2", rest: 45, note: "Freie Hand abstützen, Rücken gerade. Pro Seite.", sets: kgSets(r, "8-10") })]),
      ss(r, [it("Romanian Deadlift (Barbell)", { rir: "2", rest: 60, note: HINGE, sets: kgSets(r, "8-10") }), it("Push Up", { rir: "2", rest: 45, sets: kgSets(r, "10-15") })]),
      ss(r, [it("Hip Thrust (Barbell)", { rir: "2", rest: 45, note: "Aus der Rückenlage, Langhantel (gepolstert) auf der Hüfte, oben Gesäß fest anspannen.", sets: kgSets(r, "10-12") }), it("Standing Calf Raise (Dumbbell)", { rir: "2", rest: 30, sets: kgSets(r, "12-15") })]),
      ss(2, [it("Side Plank", { rir: "2", rest: 30, note: "Pro Seite.", sets: kgSets(2, "20-30 Sek") }), it("Plank", { rir: "2", rest: 30, sets: kgSets(2, "40-60 Sek") })]),
    ];
  }
  return { weekday: 1, sessionName: "Kraft Zuhause", note: dayNote || "Alles mit Langhantel, Scheiben, Kurzhanteln und Körpergewicht. Bei Rückenschmerz über 3/10 Übung leichter machen oder auslassen.", summary, groups };
}

const chrisDay = { weekday: 2, sessionName: "Training mit Chris", note: "Termin mit Chris – das Training gibt Chris vor.", summary: "Training mit Chris", groups: [] };
const restDay = (weekday, note) => ({ weekday, rest: true, note: note || "", summary: "Ruhetag" });

/* Plan je 2-Wochen-Block: A = Montag, B = Donnerstag, C = Samstag (längste Einheit).
   Wochen 1–8: nur Gehen. Ab Woche 9 beginnt behutsam das Traben. */
const iv = (n, j, w) => ({ parts: Array(n).fill(j), pause: w });
const wk = (min) => ({ walk: true, min });
const wiv = (n, j, w) => ({ walk: true, parts: Array(n).fill(j), pause: w });
const RUN = [
  { A: wk(20), B: wk(20), C: wk(30) },
  { A: wk(25), B: wk(25), C: wk(40) },
  { A: wiv(4, 3, 2), B: wk(25), C: wk(45) },
  { A: wiv(4, 4, 2), B: wk(28), C: wk(50) },
  { A: iv(6, 1, 2), B: wk(28), C: iv(8, 1, 2) },
  { A: iv(5, 2, 2), B: iv(6, 1, 2), C: iv(6, 2, 2) },
  { A: iv(4, 3, 2), B: iv(5, 2, 2), C: iv(5, 3, 2) },
  { A: iv(3, 5, 2), B: iv(4, 3, 2), C: iv(4, 5, 2) },
  { A: iv(2, 8, 2), B: iv(3, 5, 2), C: iv(3, 8, 2) },
  { A: { parts: [10, 8], pause: 2 }, B: iv(2, 8, 2), C: iv(4, 8, 2) },
  { A: { parts: [12, 8], pause: 2 }, B: { parts: [10, 8], pause: 2 }, C: iv(3, 12, 2) },
  { A: { min: 20 }, B: { min: 18 }, C: iv(3, 15, 2) },
  { A: { min: 22 }, B: { min: 20 }, C: iv(5, 10, 1) },
  { A: { min: 20 }, B: { min: 15, note: "Ganz locker – Beine frisch halten für Samstag." }, C: { ...iv(10, 6, 1), final: true } },
];
const TITLES = [
  ["Zügig gehen 1", [1, 2]], ["Zügig gehen 2", [3, 4]], ["Gehen mit Tempowechsel", [5, 6]], ["Gehen ausbauen", [7, 8]],
  ["Erstes Traben", [9, 10]], ["Traben 2 Min", [11, 12]], ["Traben 3 Min", [13, 14]], ["Traben 5 Min", [15, 16]],
  ["Laufblöcke 8 Min", [17, 18]], ["Laufblöcke ausbauen", [19, 20]], ["Längere Laufblöcke", [21, 22]], ["Erster Dauerlauf", [23, 24]],
  ["Vorbereitung auf das Ziel", [25, 25]], ["Zielwoche: 10 km", [26, 26]],
];
const LEVEL = [1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 4, 4];
const ROUNDS = [2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2];

const FINAL_NOTE = "Dein Zieltag: 10 km im Lauf-Geh-Mix (6 Min traben / 1 Min gehen). Nur wenn die Wochen davor gut liefen – sonst reichen auch 8 km und das Ziel verschiebt sich um ein paar Wochen. Sprechtempo, genug trinken, langsam starten.";
const HERZ50_BLOCKS = RUN.map((run, i) => {
  const [title, [w1, w2]] = TITLES[i];
  const weeks = w1 === w2 ? `Wo ${w1}` : `Wo ${w1}–${w2}`;
  const walking = i < 4, mix = i >= 4 && i < 8;
  const nameA = walking ? "Gehen A" : mix ? "Gehen & Traben A" : "Lauf A";
  const nameB = walking ? "Gehen B" : mix ? "Gehen & Traben B" : "Lauf B";
  const nameC = walking ? "Langer Spaziergang" : "Langer Lauf";
  const runC = run.C.final ? { ...run.C, label: "10 km im Lauf-Geh-Mix – dein Ziel!", note: FINAL_NOTE } : run.C;
  return {
    title: `Block ${String(i + 1).padStart(2, "0")} · ${weeks} · ${title}`,
    weeks: [w1, w2],
    days: [
      runDay(0, nameA, run.A, i < 4 ? "Locker bleiben: lieber zu langsam als zu schnell. Beschwerden im Rücken ernst nehmen – dann kürzer gehen oder pausieren." : i < 8 ? "Das Traben ist sehr locker. Du musst dich dabei noch unterhalten können." : ""),
      strengthDay(LEVEL[i], ROUNDS[i], i === 13 ? "Letzte Kraft-Einheit vor dem Ziel: ruhig und sauber, keine Maximalgewichte." : undefined),
      chrisDay,
      runDay(3, nameB, run.B),
      restDay(4, "Ruhetag – ein lockerer Spaziergang ist erlaubt."),
      runDay(5, nameC, runC, i >= 4 ? "Die längste Einheit der Woche. Sie kann etwas mehr Zeit brauchen als die Einheiten unter der Woche." : "Die längste Einheit der Woche – gern bei schönem Wetter, ruhig auch mit Pausen."),
      restDay(6),
    ],
  };
});

export const PROGRAMS = [
  {
    id: "herz50",
    title: "6-Monats-Programm: Fit werden & Schritt für Schritt zum Laufen (50+)",
    planPrefix: "50+",
    description: "26 Wochen, 5 Trainingstage: Mo Gehen/Traben A · Di Kraft zuhause · Mi Training mit Chris · Do Gehen/Traben B · Sa längste Einheit · Fr/So frei. Wochen 1–8: nur zügiges Gehen, Wochen 9–16: behutsamer Einstieg ins Traben, danach wachsen die Laufblöcke. Ziel: Gewicht verlieren, Herz-Kreislauf verbessern, am Ende 10 km im Lauf-Geh-Mix. Rückenschonend, Kraft nur mit Langhantel, Scheiben, Kurzhanteln und Körpergewicht. 14 Blöcke (je 2 Wochen), die sich automatisch ablösen.",
    defaultStart: "2027-01-04",
    blocks: HERZ50_BLOCKS,
  },
];
