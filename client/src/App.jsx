import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  LayoutDashboard,
  UserPlus,
  Utensils,
  Scale,
  Dumbbell,
  Search,
  Camera,
  X,
  Check,
  Plus,
  ChevronLeft,
  ChevronDown,
  Award,
  Lock,
  MoreHorizontal,
  MessageCircle,
  Printer,
  Ruler,
  Copy,
  Trash2,
  Clock,
} from "lucide-react";

/* ---------- Farbtoken (JS-Pendant zu den CSS-Variablen, für Recharts) ---------- */
const COLORS = {
  bg: "#101820",
  surface: "#182430",
  surface2: "#1F2E3B",
  border: "#2B3B48",
  text: "#EAF2F5",
  muted: "#8DA0AC",
  accent: "#FF8F5E",
  good: "#4ADE9E",
  warn: "#FF6B6B",
};

const GOAL_LABELS = { abnehmen: "Abnehmen", halten: "Gewicht halten", aufbauen: "Muskelaufbau" };
const MUSCLE_GROUPS = [
  "Gesäßmuskeln", "Quadrizeps", "Hinterer Oberschenkel", "Innerer Oberschenkel", "Waden",
  "Unterer Rücken", "Oberer Rücken", "Brust", "Schultern", "Bizeps", "Trizeps", "Unterarme",
  "Bauch", "Ganzkörper",
];
const EQUIPMENT_OPTIONS = ["Körpergewicht", "Kurzhantel", "Langhantel", "Kettlebell", "Kabelzug", "Maschine", "TRX", "Widerstandsband", "Sonstiges"];
const CATEGORY_OPTIONS = ["Bauch/Rumpf", "Arme", "Rücken", "Brust", "Beine", "Schultern", "Ganzkörper", "Olympisch", "Cardio", "Sonstiges"];
const WORKOUT_TYPES = [["training", "Training"], ["warmup", "Aufwärmen"], ["cooldown", "Cooldown"]];

/* ---------- Vordefinierte Übungsbibliothek (Namen/Kategorien, keine Bilder/keine Gewichtswerte) ---------- */
function guessEquipment(name) {
  if (/Barbell/.test(name)) return "Langhantel";
  if (/Dumbbell/.test(name)) return "Kurzhantel";
  if (/Smith Machine/.test(name)) return "Maschine";
  if (/Cable/.test(name)) return "Kabelzug";
  if (/Machine/.test(name)) return "Maschine";
  if (/Band/.test(name)) return "Widerstandsband";
  if (/Kettlebell/.test(name)) return "Kettlebell";
  if (/Assisted/.test(name)) return "Maschine";
  return "Körpergewicht";
}
const SEED_RAW = [
  ["Ab Wheel", "Bauch/Rumpf"], ["Aerobic", "Cardio"], ["Arnold Press (Dumbbell)", "Schultern"], ["Around the World", "Brust"],
  ["Back Extension", "Rücken"], ["Back Extension (Machine)", "Rücken"], ["Ball Slams", "Ganzkörper"], ["Battle Ropes", "Cardio"],
  ["Bench Dip", "Arme"], ["Bench Press (Barbell)", "Brust"], ["Bench Press (Cable)", "Brust"], ["Bench Press (Dumbbell)", "Brust"],
  ["Bench Press (Smith Machine)", "Brust"], ["Bench Press - Close Grip (Barbell)", "Arme"], ["Bench Press - Wide Grip (Barbell)", "Brust"],
  ["Bent Over One Arm Row (Dumbbell)", "Rücken"], ["Bent Over Row (Band)", "Rücken"], ["Bent Over Row (Barbell)", "Rücken"],
  ["Bent Over Row (Dumbbell)", "Rücken"], ["Bent Over Row - Underhand (Barbell)", "Rücken"],
  ["Bicep Curl (Barbell)", "Arme"], ["Bicep Curl (Cable)", "Arme"], ["Bicep Curl (Dumbbell)", "Arme"], ["Bicep Curl (Machine)", "Arme"],
  ["Bicycle Crunch", "Bauch/Rumpf"], ["Box Jump", "Beine"], ["Box Squat (Barbell)", "Beine"], ["Bulgarian Split Squat", "Beine"], ["Burpee", "Ganzkörper"],
  ["Cable Crossover", "Brust"], ["Cable Crunch", "Bauch/Rumpf"], ["Cable Kickback", "Arme"], ["Cable Pull Through", "Beine"], ["Cable Twist", "Bauch/Rumpf"],
  ["Calf Press on Leg Press", "Beine"], ["Calf Press on Seated Leg Press", "Beine"],
  ["Chest Dip", "Brust"], ["Chest Dip (Assisted)", "Brust"], ["Chest Fly", "Brust"], ["Chest Fly (Band)", "Brust"], ["Chest Fly (Dumbbell)", "Brust"],
  ["Chest Press (Band)", "Brust"], ["Chest Press (Machine)", "Brust"], ["Chin Up", "Rücken"], ["Chin Up (Assisted)", "Rücken"],
  ["Clean (Barbell)", "Olympisch"], ["Clean and Jerk (Barbell)", "Olympisch"], ["Klettern", "Cardio"], ["Concentration Curl (Dumbbell)", "Arme"],
  ["Cross Body Crunch", "Bauch/Rumpf"], ["Crunch", "Bauch/Rumpf"], ["Crunch (Machine)", "Bauch/Rumpf"], ["Crunch (Stability Ball)", "Bauch/Rumpf"],
  ["Radfahren", "Cardio"], ["Radfahren (Indoor)", "Cardio"],
  ["Deadlift (Band)", "Beine"], ["Deadlift (Barbell)", "Rücken"], ["Deadlift (Dumbbell)", "Beine"], ["Deadlift (Smith Machine)", "Beine"],
  ["Deadlift High Pull (Barbell)", "Olympisch"], ["Decline Bench Press (Barbell)", "Brust"], ["Decline Bench Press (Dumbbell)", "Brust"],
  ["Decline Bench Press (Smith Machine)", "Brust"], ["Decline Crunch", "Bauch/Rumpf"], ["Deficit Deadlift (Barbell)", "Beine"],
  ["Crosstrainer", "Cardio"], ["Face Pull (Cable)", "Schultern"], ["Flat Knee Raise", "Bauch/Rumpf"], ["Flat Leg Raise", "Bauch/Rumpf"],
  ["Floor Press (Barbell)", "Brust"], ["Front Raise (Band)", "Schultern"], ["Front Raise (Barbell)", "Schultern"], ["Front Raise (Cable)", "Schultern"],
  ["Front Raise (Dumbbell)", "Schultern"], ["Front Raise (Plate)", "Schultern"], ["Front Squat (Barbell)", "Beine"],
  ["Glute Ham Raise", "Beine"], ["Glute Kickback (Machine)", "Beine"], ["Goblet Squat (Kettlebell)", "Beine"], ["Good Morning (Barbell)", "Rücken"],
  ["Hack Squat", "Beine"], ["Hack Squat (Barbell)", "Beine"], ["Hammer Curl (Band)", "Arme"], ["Hammer Curl (Cable)", "Arme"], ["Hammer Curl (Dumbbell)", "Arme"],
  ["Handstand Push Up", "Schultern"], ["Hang Clean (Barbell)", "Olympisch"], ["Hang Snatch (Barbell)", "Olympisch"],
  ["Hanging Knee Raise", "Bauch/Rumpf"], ["Hanging Leg Raise", "Bauch/Rumpf"], ["High Knee Skips", "Beine"], ["Wandern", "Cardio"],
  ["Hip Abductor (Machine)", "Beine"], ["Hip Adductor (Machine)", "Beine"], ["Hip Thrust (Barbell)", "Beine"], ["Hip Thrust (Bodyweight)", "Beine"],
  ["Incline Bench Press (Barbell)", "Brust"], ["Incline Bench Press (Cable)", "Brust"], ["Incline Bench Press (Dumbbell)", "Brust"],
  ["Incline Bench Press (Smith Machine)", "Brust"], ["Incline Chest Fly (Dumbbell)", "Brust"], ["Incline Chest Press (Machine)", "Brust"],
  ["Incline Curl (Dumbbell)", "Arme"], ["Incline Row (Dumbbell)", "Rücken"], ["Inverted Row (Bodyweight)", "Rücken"],
  ["Iso-Lateral Chest Press (Machine)", "Brust"], ["Iso-Lateral Row (Machine)", "Rücken"],
  ["Jackknife Sit Up", "Bauch/Rumpf"], ["Seilspringen", "Cardio"], ["Jump Shrug (Barbell)", "Olympisch"], ["Jump Squat", "Beine"], ["Jumping Jack", "Ganzkörper"],
  ["Kettlebell Swing", "Ganzkörper"], ["Kettlebell Turkish Get Up", "Ganzkörper"], ["Kipping Pull Up", "Rücken"],
  ["Knee Raise (Captain's Chair)", "Bauch/Rumpf"], ["Kneeling Pulldown (Band)", "Rücken"], ["Knees to Elbows", "Bauch/Rumpf"],
  ["Lat Pulldown (Cable)", "Rücken"], ["Lat Pulldown (Machine)", "Rücken"], ["Lat Pulldown (Single Arm)", "Rücken"],
  ["Lat Pulldown - Underhand (Band)", "Rücken"], ["Lat Pulldown - Underhand (Cable)", "Rücken"], ["Lat Pulldown - Wide Grip (Cable)", "Rücken"],
  ["Lateral Box Jump", "Beine"], ["Lateral Raise (Band)", "Schultern"], ["Lateral Raise (Cable)", "Schultern"], ["Lateral Raise (Dumbbell)", "Schultern"],
  ["Lateral Raise (Machine)", "Schultern"], ["Leg Extension (Machine)", "Beine"], ["Leg Press", "Beine"],
  ["Lunge (Barbell)", "Beine"], ["Lunge (Bodyweight)", "Beine"], ["Lunge (Dumbbell)", "Beine"], ["Lying Leg Curl (Machine)", "Beine"],
  ["Mountain Climber", "Ganzkörper"], ["Muscle Up", "Ganzkörper"], ["Oblique Crunch", "Bauch/Rumpf"],
  ["Overhead Press (Barbell)", "Schultern"], ["Overhead Press (Cable)", "Schultern"], ["Overhead Press (Dumbbell)", "Schultern"],
  ["Overhead Press (Smith Machine)", "Schultern"], ["Overhead Squat (Barbell)", "Olympisch"],
  ["Pec Deck (Machine)", "Brust"], ["Pendlay Row (Barbell)", "Rücken"], ["Pistol Squat", "Beine"], ["Plank", "Bauch/Rumpf"],
  ["Power Clean", "Olympisch"], ["Power Snatch (Barbell)", "Olympisch"],
  ["Preacher Curl (Barbell)", "Arme"], ["Preacher Curl (Dumbbell)", "Arme"], ["Preacher Curl (Machine)", "Arme"],
  ["Press Under (Barbell)", "Olympisch"], ["Pull Up", "Rücken"], ["Pull Up (Assisted)", "Rücken"], ["Pull Up (Band)", "Rücken"],
  ["Pullover (Dumbbell)", "Brust"], ["Pullover (Machine)", "Brust"], ["Push Press", "Schultern"],
  ["Push Up", "Brust"], ["Push Up (Band)", "Brust"], ["Push Up (Knees)", "Brust"],
  ["Rack Pull (Barbell)", "Rücken"], ["Reverse Crunch", "Bauch/Rumpf"],
  ["Reverse Curl (Band)", "Arme"], ["Reverse Curl (Barbell)", "Arme"], ["Reverse Curl (Dumbbell)", "Arme"],
  ["Reverse Fly (Cable)", "Schultern"], ["Reverse Fly (Dumbbell)", "Schultern"], ["Reverse Fly (Machine)", "Schultern"],
  ["Reverse Grip Concentration Curl (Dumbbell)", "Arme"], ["Reverse Plank", "Bauch/Rumpf"],
  ["Romanian Deadlift (Barbell)", "Rücken"], ["Romanian Deadlift (Dumbbell)", "Beine"],
  ["Rudern (Gerät)", "Cardio"], ["Laufen", "Cardio"], ["Laufen (Laufband)", "Cardio"], ["Russian Twist", "Bauch/Rumpf"],
  ["Seated Calf Raise (Machine)", "Beine"], ["Seated Calf Raise (Plate Loaded)", "Beine"],
  ["Seated Leg Curl (Machine)", "Beine"], ["Seated Leg Press (Machine)", "Beine"],
  ["Seated Overhead Press (Barbell)", "Schultern"], ["Seated Overhead Press (Dumbbell)", "Schultern"],
  ["Seated Palms Up Wrist Curl (Dumbbell)", "Arme"], ["Seated Pulldown Single", "Rücken"],
  ["Seated Row (Cable)", "Rücken"], ["Seated Row (Machine)", "Rücken"], ["Seated Wide-Grip Row (Cable)", "Rücken"],
  ["Shoulder Press (Machine)", "Schultern"], ["Shoulder Press (Plate Loaded)", "Schultern"],
  ["Shrug (Barbell)", "Schultern"], ["Shrug (Dumbbell)", "Schultern"], ["Shrug (Machine)", "Schultern"], ["Shrug (Smith Machine)", "Schultern"],
  ["Side Bend (Band)", "Bauch/Rumpf"], ["Side Bend (Cable)", "Bauch/Rumpf"], ["Side Bend (Dumbbell)", "Bauch/Rumpf"],
  ["Side Plank", "Bauch/Rumpf"], ["Single Leg Bridge", "Beine"], ["Sit Up", "Bauch/Rumpf"],
  ["Skaten", "Cardio"], ["Skifahren", "Cardio"], ["Skullcrusher (Barbell)", "Arme"], ["Skullcrusher (Dumbbell)", "Arme"],
  ["Snatch (Barbell)", "Olympisch"], ["Snatch Pull (Barbell)", "Olympisch"], ["Snowboarden", "Cardio"], ["Split Jerk (Barbell)", "Olympisch"],
  ["Squat (Band)", "Beine"], ["Squat (Barbell)", "Beine"], ["Squat (Bodyweight)", "Beine"], ["Squat (Dumbbell)", "Beine"],
  ["Squat (Machine)", "Beine"], ["Squat (Smith Machine)", "Beine"], ["Squat Row (Band)", "Ganzkörper"],
  ["Standing Calf Raise (Barbell)", "Beine"], ["Standing Calf Raise (Bodyweight)", "Beine"], ["Standing Calf Raise (Dumbbell)", "Beine"],
  ["Standing Calf Raise (Machine)", "Beine"], ["Standing Calf Raise (Smith Machine)", "Beine"], ["Step-up", "Beine"],
  ["Stiff Leg Deadlift (Barbell)", "Rücken"], ["Stiff Leg Deadlift (Dumbbell)", "Beine"], ["Straight Leg Deadlift (Band)", "Beine"],
  ["Stretching", "Sonstiges"], ["Strict Military Press (Barbell)", "Schultern"],
  ["Sumo Deadlift (Barbell)", "Rücken"], ["Sumo Deadlift High Pull (Barbell)", "Ganzkörper"],
  ["Superman", "Bauch/Rumpf"], ["Schwimmen", "Cardio"], ["T Bar Row", "Rücken"],
  ["Thruster (Barbell)", "Ganzkörper"], ["Thruster (Kettlebell)", "Ganzkörper"],
  ["Toes To Bar", "Bauch/Rumpf"], ["Torso Rotation (Machine)", "Bauch/Rumpf"], ["Trap Bar Deadlift", "Beine"],
  ["Triceps Dip", "Arme"], ["Triceps Dip (Assisted)", "Arme"], ["Triceps Extension", "Arme"], ["Triceps Extension (Barbell)", "Arme"],
  ["Triceps Extension (Cable)", "Arme"], ["Triceps Extension (Dumbbell)", "Arme"], ["Triceps Extension (Machine)", "Arme"],
  ["Triceps Press", "Arme"], ["Triceps Pushdown (Cable - Straight Bar)", "Arme"],
  ["Upright Row (Barbell)", "Schultern"], ["Upright Row (Cable)", "Schultern"], ["Upright Row (Dumbbell)", "Schultern"],
  ["V Up", "Bauch/Rumpf"], ["Gehen", "Cardio"], ["Wall Balls", "Beine"], ["Wide Pull Up", "Rücken"], ["Wrist Roller", "Arme"],
  ["Yoga", "Cardio"], ["Zercher Squat (Barbell)", "Beine"],
];
const SEED_EXERCISES = SEED_RAW.map(([name, category], i) => ({
  id: "seed-" + i, name, category, muscles: [], equipment: guessEquipment(name), instructions: "", images: [], goalTags: [], baseline: null,
}));

/* ---------- Basis-Lebensmitteldatenbank (Werte pro 100 g) ---------- */
const BUILTIN_FOODS = [
  { name: "Hähnchenbrust (roh)", kcal: 110, protein: 23, carbs: 0, fat: 1.2 },
  { name: "Reis, gekocht", kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: "Haferflocken", kcal: 372, protein: 13.5, carbs: 60, fat: 7 },
  { name: "Banane", kcal: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: "Ei (Vollei)", kcal: 155, protein: 13, carbs: 1.1, fat: 11 },
  { name: "Magerquark", kcal: 67, protein: 12, carbs: 4, fat: 0.2 },
  { name: "Vollkornbrot", kcal: 247, protein: 9, carbs: 41, fat: 3.3 },
  { name: "Erdnussbutter", kcal: 588, protein: 25, carbs: 20, fat: 50 },
  { name: "Brokkoli, gekocht", kcal: 35, protein: 2.4, carbs: 7, fat: 0.4 },
  { name: "Lachs (roh)", kcal: 208, protein: 20, carbs: 0, fat: 13 },
  { name: "Olivenöl", kcal: 884, protein: 0, carbs: 0, fat: 100 },
  { name: "Apfel", kcal: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { name: "Milch 1,5%", kcal: 47, protein: 3.4, carbs: 4.8, fat: 1.5 },
  { name: "Linsen, gekocht", kcal: 116, protein: 9, carbs: 20, fat: 0.4 },
  { name: "Kartoffeln, gekocht", kcal: 87, protein: 1.9, carbs: 20, fat: 0.1 },
  { name: "Griechischer Joghurt 10%", kcal: 115, protein: 6, carbs: 4, fat: 9 },
  { name: "Rinderhack (10% Fett)", kcal: 212, protein: 18, carbs: 0, fat: 15 },
  { name: "Nudeln, gekocht", kcal: 131, protein: 5, carbs: 25, fat: 1.1 },
  { name: "Mandeln", kcal: 579, protein: 21, carbs: 22, fat: 50 },
  { name: "Thunfisch (Dose, im eigenen Saft)", kcal: 116, protein: 26, carbs: 0, fat: 1 },
];

/* ---------- Open Food Facts Anbindung (offene Datenbank, ODbL-Lizenz) ---------- */
function offNutriToFood(product) {
  const n = product.nutriments || {};
  let kcal = n["energy-kcal_100g"];
  if (kcal === undefined || kcal === null) {
    const kj = n["energy_100g"];
    kcal = kj ? kj / 4.184 : 0;
  }
  const brand = product.brands ? product.brands.split(",")[0].trim() : "";
  return {
    name: product.product_name ? (brand ? `${product.product_name} (${brand})` : product.product_name) : "Unbenanntes Produkt",
    kcal: round(kcal),
    protein: round(n["proteins_100g"] || 0, 1),
    carbs: round(n["carbohydrates_100g"] || 0, 1),
    fat: round(n["fat_100g"] || 0, 1),
  };
}
async function searchOpenFoodFacts(query, signal) {
  const url = "https://world.openfoodfacts.org/cgi/search.pl?search_terms=" + encodeURIComponent(query) + "&search_simple=1&action=process&json=1&page_size=8&fields=product_name,brands,nutriments";
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Suche fehlgeschlagen");
  const data = await res.json();
  return (data.products || []).filter((p) => p.product_name).map(offNutriToFood);
}
async function lookupBarcode(code, signal) {
  const url = "https://world.openfoodfacts.org/api/v2/product/" + encodeURIComponent(code) + ".json?fields=product_name,brands,nutriments";
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Abfrage fehlgeschlagen");
  const data = await res.json();
  if (data.status !== 1 || !data.product) throw new Error("Kein Produkt zu diesem Barcode gefunden");
  return offNutriToFood(data.product);
}

const STORAGE_PREFIX = "ptlog-";
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" });
function round(n, d = 0) {
  const f = Math.pow(10, d);
  return Math.round((Number(n) || 0) * f) / f;
}

/* ---------- Storage helpers ----------
   shared=true  -> echte Coachee-/Coach-Daten, liegen im eigenen Backend + Postgres
   shared=false -> geräte-lokale Einstellungen (Rolle, Auswahl), liegen im Browser (localStorage) */
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

async function loadKey(key, shared = true) {
  try {
    if (!shared) {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    }
    const res = await fetch(`${API_BASE}/storage/${encodeURIComponent(STORAGE_PREFIX + key)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.value ? JSON.parse(data.value) : null;
  } catch (e) {
    return null;
  }
}
async function saveKey(key, data, shared = true) {
  try {
    if (!shared) {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
      return true;
    }
    const res = await fetch(`${API_BASE}/storage/${encodeURIComponent(STORAGE_PREFIX + key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: JSON.stringify(data) }),
    });
    return res.ok;
  } catch (e) {
    console.error("Speichern fehlgeschlagen:", key, e);
    return false;
  }
}
async function deleteKeyStorage(key, shared = true) {
  try {
    if (!shared) {
      localStorage.removeItem(STORAGE_PREFIX + key);
      return true;
    }
    const res = await fetch(`${API_BASE}/storage/${encodeURIComponent(STORAGE_PREFIX + key)}`, { method: "DELETE" });
    return res.ok;
  } catch (e) {
    console.error("Löschen fehlgeschlagen:", key, e);
    return false;
  }
}
async function exportCoacheeData(id, name) {
  const [profile, nutrition, weight, plans, sessions] = await Promise.all([
    loadKey(`profile-${id}`), loadKey(`nutrition-${id}`), loadKey(`weight-${id}`), loadKey(`plans-${id}`), loadKey(`sessions-${id}`),
  ]);
  const data = { exportedAt: new Date().toISOString(), name, profile, nutrition, weight, plans, sessions };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(name || "coachee").replace(/\s+/g, "_")}_export.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ---------- Mifflin-St-Jeor Kalorienschätzung ---------- */
function estimateTargets({ gender, age, height, weight, activity, goal }) {
  const a = Number(age) || 0, h = Number(height) || 0, w = Number(weight) || 0;
  let bmr = 10 * w + 6.25 * h - 5 * a;
  if (gender === "m") bmr += 5;
  else if (gender === "w") bmr -= 161;
  else bmr -= 78;
  const factors = { sitzend: 1.2, leicht: 1.375, moderat: 1.55, hoch: 1.725 };
  const tdee = bmr * (factors[activity] || 1.375);
  const goalFactor = { abnehmen: 0.82, halten: 1, aufbauen: 1.1 };
  const kcal = Math.round(tdee * (goalFactor[goal] ?? 1));
  const protein = round(w * 1.8);
  const fat = round(w * 0.8);
  const carbs = Math.max(0, round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal, protein, carbs, fat };
}

/* ---------- Bild-Upload: Datei -> verkleinertes Data-URL-Bild ---------- */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 480;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ---------- Zielangaben formatieren ---------- */
function formatSetTarget(s) {
  const unit = s.unit === "min" ? "Min" : "kg";
  const parts = [];
  if (s.reps && s.weight) parts.push(`${s.reps} × ${s.weight} ${unit}`);
  else if (s.reps) parts.push(`${s.reps} Wdh.`);
  else if (s.weight) parts.push(`${s.weight} ${unit}`);
  if (s.distance) parts.push(s.distance);
  return parts.length ? parts.join(" · ") : "–";
}
function formatLoggedSet(s) {
  const base = formatSetTarget(s);
  const extras = [];
  if (s.rpe) extras.push(`RPE ${s.rpe}`);
  if (s.pain) extras.push("⚠️ Schmerz");
  return extras.length ? `${base} (${extras.join(", ")})` : base;
}
function summarizeItemTarget(item) {
  if (!item.sets || item.sets.length === 0) return "–";
  if (item.sets.length === 1) return formatSetTarget(item.sets[0]);
  const first = item.sets[0];
  const allSame = item.sets.every((s) => s.reps === first.reps && s.weight === first.weight && s.distance === first.distance);
  if (allSame) return `${item.sets.length}× ${formatSetTarget(first)}`;
  return item.sets.map(formatSetTarget).join(" · ");
}
function isSuperset(g) {
  return g.type ? g.type === "superset" : g.items.length > 1;
}
function groupSetCount(g) {
  const per = g.items.reduce((s, i) => s + i.sets.length, 0);
  return isSuperset(g) ? per * (g.rounds || 1) : per;
}
function dayGroupsSetCount(groups) {
  return groups.reduce((s, g) => s + groupSetCount(g), 0);
}
function expandItemSets(item, g) {
  const rounds = isSuperset(g) ? (g.rounds || 1) : 1;
  if (rounds <= 1) return item.sets;
  const expanded = [];
  for (let r = 0; r < rounds; r++) expanded.push(...item.sets);
  return expanded;
}
function planIdActiveOn(history, plans, iso) {
  if (history && history.length) {
    const applicable = history.filter((h) => h.date <= iso).sort((a, b) => b.date.localeCompare(a.date));
    return applicable.length ? applicable[0].planId : null;
  }
  return (plans.find((p) => p.active) || {}).id || null;
}

/* ---------- Verlauf / Session-Statistiken (angelehnt an Strong) ---------- */
function formatDuration(seconds) {
  if (!seconds) return "–";
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}
function formatVolume(kg) {
  return `${Math.round(kg).toLocaleString("de-DE")} kg`;
}
function formatLongDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
}
function monthLabel(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("de-DE", { month: "long", year: "numeric" }).toUpperCase();
}
function daysUntil(iso) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.round((new Date(iso + "T00:00:00") - now) / 86400000);
}
function nextUpcomingEvent(profile) {
  const events = profile?.targetEvents || [];
  const upcoming = events.filter((ev) => daysUntil(ev.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
  return upcoming[0] || null;
}
function bestSetText(entry) {
  const withWeight = entry.sets.filter((s) => Number(s.weight) > 0);
  if (withWeight.length) {
    const best = withWeight.reduce((a, b) => (Number(b.weight) * (Number(b.reps) || 1) > Number(a.weight) * (Number(a.reps) || 1) ? b : a));
    return `${best.weight} kg × ${best.reps || "–"}`;
  }
  const withReps = entry.sets.filter((s) => Number(s.reps) > 0);
  if (withReps.length) {
    const best = withReps.reduce((a, b) => (Number(b.reps) > Number(a.reps) ? b : a));
    return `${best.reps} Wdh.`;
  }
  const withDist = entry.sets.find((s) => s.distance);
  return withDist ? withDist.distance : "–";
}
function getPreviousSetRef(sessions, exerciseId, excludeSessionId, setIdx) {
  const past = sessions.filter((s) => s.id !== excludeSessionId && s.entries.some((e) => e.exerciseId === exerciseId)).sort((a, b) => b.date.localeCompare(a.date));
  if (!past.length) return null;
  const entry = past[0].entries.find((e) => e.exerciseId === exerciseId);
  const s = entry.sets[setIdx];
  if (!s) return null;
  return formatSetTarget({ reps: s.reps, weight: s.weight, distance: s.distance });
}
function previousMaxWeight(sessions, exerciseId) {
  let max = 0;
  sessions.forEach((s) => s.entries.forEach((e) => { if (e.exerciseId === exerciseId) e.sets.forEach((st) => { const w = Number(st.weight) || 0; if (w > max) max = w; }); }));
  return max;
}
function sessionVolume(session) {
  return session.entries.reduce((sum, e) => sum + e.sets.reduce((s2, s) => s2 + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0), 0);
}
function computeTopProgress(sessions, exercises, limit = 3) {
  const byExercise = {};
  [...sessions].sort((a, b) => a.date.localeCompare(b.date)).forEach((s) => {
    s.entries.forEach((e) => {
      const maxW = Math.max(0, ...e.sets.map((st) => Number(st.weight) || 0));
      if (maxW <= 0) return;
      if (!byExercise[e.exerciseId]) byExercise[e.exerciseId] = { first: maxW, last: maxW };
      else byExercise[e.exerciseId].last = maxW;
    });
  });
  return Object.entries(byExercise)
    .map(([exerciseId, v]) => ({ exerciseId, from: v.first, to: v.last, delta: round(v.last - v.first, 1), name: exercises.find((x) => x.id === exerciseId)?.name || "?" }))
    .filter((p) => p.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, limit);
}

/* ---------- Avatar, Skins & Erfolge ---------- */
const AVATAR_EMOJIS = ["🙂", "😄", "🦁", "🐯", "🐻", "🦊", "🐼", "🐸", "🐧", "🦉", "🐺", "🐨", "🐵", "🦄", "🐲", "🥷"];
const SKINS = [
  { id: "default", name: "Standard", ring: "#2B3B48", badge: null },
  { id: "bronze", name: "Bronze-Ring", ring: "linear-gradient(135deg,#CD8155,#8B5A2B)", badge: null },
  { id: "compass", name: "Kompass", ring: "linear-gradient(135deg,#4ADE9E,#1F8F63)", badge: "🧭" },
  { id: "silver", name: "Silber-Ring", ring: "linear-gradient(135deg,#E3E8ED,#8D97A0)", badge: null },
  { id: "gold", name: "Gold-Ring", ring: "linear-gradient(135deg,#FFD76A,#C9922B)", badge: "⭐" },
  { id: "record", name: "Rekord", ring: "linear-gradient(135deg,#FF8F5E,#C24E1F)", badge: "🏅" },
  { id: "recordHunter", name: "Rekordjäger", ring: "linear-gradient(135deg,#FF6B6B,#B3273A)", badge: "🔥" },
  { id: "leaf", name: "Ernährungs-Blatt", ring: "linear-gradient(135deg,#8BD17C,#3E8E4F)", badge: "🥗" },
  { id: "target", name: "Ziel erreicht", ring: "linear-gradient(135deg,#7FB8FF,#2E5FA3)", badge: "🎯" },
  { id: "consistent", name: "Serientäter", ring: "linear-gradient(135deg,#C4D82E,#7C8E12)", badge: "⚡" },
  { id: "iron", name: "Eisen", ring: "linear-gradient(135deg,#9FB0BE,#4A5A66)", badge: "🛠️" },
  { id: "platinum", name: "Platin", ring: "linear-gradient(135deg,#F1F5F9,#A6B4C2)", badge: "💎" },
  { id: "legend", name: "Legende", ring: "linear-gradient(135deg,#B98CFF,#5A2E9E)", badge: "👑" },
  { id: "recordLegend", name: "Rekord-Legende", ring: "linear-gradient(135deg,#FF5CA8,#7A1FBF)", badge: "🏆" },
  { id: "monthStreak", name: "4-Wochen-Streak", ring: "linear-gradient(135deg,#5CC8FF,#1D6FA3)", badge: "📅" },
  { id: "teamplayer", name: "Team-Player", ring: "linear-gradient(135deg,#4EE0C4,#0F8F7A)", badge: "🤝" },
  { id: "freestyle", name: "Eigenregie", ring: "linear-gradient(135deg,#FFC24E,#E0761F)", badge: "🎨" },
  { id: "tonnage", name: "Tonnenschieber", ring: "linear-gradient(135deg,#9AA5B1,#3E4A56)", badge: "⚙️" },
  { id: "heavylifter", name: "Schwerlast-Champion", ring: "linear-gradient(135deg,#B3273A,#5C0F1A)", badge: "🏗️" },
  { id: "allrounder", name: "Allrounder", ring: "linear-gradient(135deg,#FF8F5E,#4EE0C4)", badge: "🧩" },
  { id: "earlybird", name: "Früher Vogel", ring: "linear-gradient(135deg,#FFD76A,#FF6B8B)", badge: "🌅" },
  { id: "nightowl", name: "Nachteule", ring: "linear-gradient(135deg,#4A4E9E,#1B1D3D)", badge: "🌙" },
  { id: "weekendwarrior", name: "Wochenend-Warrior", ring: "linear-gradient(135deg,#4ADE9E,#2E6FA3)", badge: "🏖️" },
  { id: "nutritionPro", name: "Ernährungs-Profi", ring: "linear-gradient(135deg,#A8E063,#3E8E4F)", badge: "🍽️" },
  { id: "loggerFan", name: "Fleißiger Logger", ring: "linear-gradient(135deg,#4EE0C4,#2E9E8E)", badge: "📒" },
  { id: "proteinChampion", name: "Protein-Champion", ring: "linear-gradient(135deg,#FF8F5E,#B3273A)", badge: "💪" },
  { id: "disciplined", name: "Diszipliniert", ring: "linear-gradient(135deg,#8B9EFF,#4E4EA3)", badge: "🧘" },
  { id: "dataCollector", name: "Datenpunkt-Sammler", ring: "linear-gradient(135deg,#B0BEC8,#5A6A78)", badge: "📊" },
  { id: "onTrack", name: "Auf Kurs", ring: "linear-gradient(135deg,#4ADE9E,#1F8F63)", badge: "🚀" },
  { id: "planFinisher", name: "Plan-Vollender", ring: "linear-gradient(135deg,#FFD76A,#B98CFF)", badge: "🏁" },
  { id: "firstKm", name: "Erste Kilometer", ring: "linear-gradient(135deg,#8BD1FF,#2E7FB8)", badge: "🏃" },
  { id: "enduranceCollector", name: "Ausdauer-Sammler", ring: "linear-gradient(135deg,#6FE0C0,#1F8F7A)", badge: "🥾" },
  { id: "hundredKm", name: "100-km-Club", ring: "linear-gradient(135deg,#FFB84E,#B36A1F)", badge: "💯" },
  { id: "runningWonder", name: "Laufwunder", ring: "linear-gradient(135deg,#FF6BA8,#8F1F6A)", badge: "🌟" },
  { id: "halfMarathon", name: "Halbmarathon-Distanz", ring: "linear-gradient(135deg,#8CFFCB,#1F9E6F)", badge: "🎽" },
  { id: "marathon", name: "Marathon-Distanz", ring: "linear-gradient(135deg,#FFD76A,#B3273A)", badge: "🏅" },
  { id: "firstHours", name: "Erste Stunden", ring: "linear-gradient(135deg,#8CD1FF,#3E6FA3)", badge: "⏱️" },
  { id: "fullDay", name: "Ganzer Tag", ring: "linear-gradient(135deg,#FFC24E,#8F5A1F)", badge: "🕛" },
  { id: "hundredHours", name: "Hundert-Stunden-Club", ring: "linear-gradient(135deg,#C58CFF,#5A2E9E)", badge: "⌛" },
  { id: "enduranceSession", name: "Ausdauersitzung", ring: "linear-gradient(135deg,#6FE0C0,#1F6F9E)", badge: "🧗" },
];
const ACHIEVEMENTS = [
  { id: "first_session", skinId: "bronze", name: "Startschuss", desc: "Schließe deine erste Trainingseinheit ab.", check: (s) => s.sessionsCount >= 1 },
  { id: "baseline", skinId: "compass", name: "Ist-Stand erfasst", desc: "Schließe eine Ist-Stand-Einheit ab.", check: (s) => s.baselineDone },
  { id: "five_sessions", skinId: "silver", name: "Fünferpack", desc: "Schließe 5 Trainingseinheiten ab.", check: (s) => s.sessionsCount >= 5 },
  { id: "ten_sessions", skinId: "gold", name: "Zehnkämpfer", desc: "Schließe 10 Trainingseinheiten ab.", check: (s) => s.sessionsCount >= 10 },
  { id: "first_pr", skinId: "record", name: "Erster Rekord", desc: "Erziele deinen ersten persönlichen Rekord.", check: (s) => s.prTotal >= 1 },
  { id: "five_pr", skinId: "recordHunter", name: "Rekordjäger", desc: "Erziele 5 persönliche Rekorde.", check: (s) => s.prTotal >= 5 },
  { id: "nutrition_week", skinId: "leaf", name: "Ernährungs-Tagebuch", desc: "Trage an 7 verschiedenen Tagen Mahlzeiten ein.", check: (s) => s.nutritionDays >= 7 },
  { id: "weight_goal", skinId: "target", name: "Zielgewicht erreicht", desc: "Erreiche dein hinterlegtes Zielgewicht.", check: (s) => s.weightGoalReached },
  { id: "consistent", skinId: "consistent", name: "Serientäter", desc: "3 Trainingseinheiten innerhalb von 7 Tagen.", check: (s) => s.recentSessions7d >= 3 },
  { id: "sessions_20", skinId: "iron", name: "Kein Ausfalltag", desc: "Schließe 20 Trainingseinheiten ab.", check: (s) => s.sessionsCount >= 20 },
  { id: "sessions_50", skinId: "platinum", name: "Halbes Hundert", desc: "Schließe 50 Trainingseinheiten ab.", check: (s) => s.sessionsCount >= 50 },
  { id: "sessions_100", skinId: "legend", name: "Hundertschaft", desc: "Schließe 100 Trainingseinheiten ab.", check: (s) => s.sessionsCount >= 100 },
  { id: "pr_10", skinId: "recordLegend", name: "Rekord-Legende", desc: "Erziele 10 persönliche Rekorde.", check: (s) => s.prTotal >= 10 },
  { id: "month_streak", skinId: "monthStreak", name: "4-Wochen-Streak", desc: "In jeder der letzten 4 Wochen mindestens einmal trainiert.", check: (s) => s.monthStreak },
  { id: "teamplayer", skinId: "teamplayer", name: "Team-Player", desc: "Schließe eine Einheit mit einem Super Set ab.", check: (s) => s.hasSuperset },
  { id: "freestyle", skinId: "freestyle", name: "Eigenregie", desc: "Schließe ein freies Workout ohne Vorlage ab.", check: (s) => s.hasFreestyle },
  { id: "tonnage", skinId: "tonnage", name: "Tonnenschieber", desc: "10.000 kg Gesamtvolumen bewegt.", check: (s) => s.totalVolume >= 10000 },
  { id: "heavylifter", skinId: "heavylifter", name: "Schwerlast-Champion", desc: "50.000 kg Gesamtvolumen bewegt.", check: (s) => s.totalVolume >= 50000 },
  { id: "allrounder", skinId: "allrounder", name: "Allrounder", desc: "5 oder mehr Übungen in einer einzigen Einheit.", check: (s) => s.maxExercisesInSession >= 5 },
  { id: "earlybird", skinId: "earlybird", name: "Früher Vogel", desc: "Trainingseinheit vor 7 Uhr morgens begonnen.", check: (s) => s.earlybird },
  { id: "nightowl", skinId: "nightowl", name: "Nachteule", desc: "Trainingseinheit nach 21 Uhr begonnen.", check: (s) => s.nightowl },
  { id: "weekendwarrior", skinId: "weekendwarrior", name: "Wochenend-Warrior", desc: "Am Wochenende trainiert.", check: (s) => s.weekendTrained },
  { id: "nutrition_30", skinId: "nutritionPro", name: "Ernährungs-Profi", desc: "Trage an 30 verschiedenen Tagen Mahlzeiten ein.", check: (s) => s.nutritionDays >= 30 },
  { id: "logger_50", skinId: "loggerFan", name: "Fleißiger Logger", desc: "Trage insgesamt 50 Mahlzeiten ein.", check: (s) => s.nutritionEntriesTotal >= 50 },
  { id: "protein_champion", skinId: "proteinChampion", name: "Protein-Champion", desc: "An 7 Tagen das Proteinziel erreicht.", check: (s) => s.proteinDaysMet >= 7 },
  { id: "disciplined", skinId: "disciplined", name: "Diszipliniert", desc: "An 14 Tagen das Kalorienziel eingehalten.", check: (s) => s.calorieDaysMet >= 14 },
  { id: "data_collector", skinId: "dataCollector", name: "Datenpunkt-Sammler", desc: "20 Gewichtseinträge erfasst.", check: (s) => s.weightEntries >= 20 },
  { id: "on_track", skinId: "onTrack", name: "Auf Kurs", desc: "Gewichtsverlauf bewegt sich in Richtung deines Ziels.", check: (s) => s.onTrack },
  { id: "plan_finisher", skinId: "planFinisher", name: "Plan-Vollender", desc: "Jeden Trainingstag deines aktiven Plans mindestens einmal absolviert.", check: (s) => s.planFinished },
  { id: "km_5", skinId: "firstKm", name: "Erste Kilometer", desc: "Insgesamt 5 Laufkilometer gesammelt.", check: (s) => s.runningKm >= 5 },
  { id: "km_25", skinId: "enduranceCollector", name: "Ausdauer-Sammler", desc: "Insgesamt 25 Laufkilometer gesammelt.", check: (s) => s.runningKm >= 25 },
  { id: "km_100", skinId: "hundredKm", name: "100-km-Club", desc: "Insgesamt 100 Laufkilometer gesammelt.", check: (s) => s.runningKm >= 100 },
  { id: "km_500", skinId: "runningWonder", name: "Laufwunder", desc: "Insgesamt 500 Laufkilometer gesammelt.", check: (s) => s.runningKm >= 500 },
  { id: "half_marathon", skinId: "halfMarathon", name: "Halbmarathon-Distanz", desc: "21,1 km am Stück gelaufen.", check: (s) => s.bestSingleRunKm >= 21.1 },
  { id: "marathon", skinId: "marathon", name: "Marathon-Distanz", desc: "42,2 km am Stück gelaufen.", check: (s) => s.bestSingleRunKm >= 42.2 },
  { id: "hours_5", skinId: "firstHours", name: "Erste Stunden", desc: "Insgesamt 5 Stunden trainiert.", check: (s) => s.totalTrainingHours >= 5 },
  { id: "hours_24", skinId: "fullDay", name: "Ganzer Tag", desc: "Insgesamt 24 Stunden trainiert.", check: (s) => s.totalTrainingHours >= 24 },
  { id: "hours_100", skinId: "hundredHours", name: "Hundert-Stunden-Club", desc: "Insgesamt 100 Stunden trainiert.", check: (s) => s.totalTrainingHours >= 100 },
  { id: "endurance_session", skinId: "enduranceSession", name: "Ausdauersitzung", desc: "Eine einzelne Einheit von mindestens 90 Minuten.", check: (s) => s.longestSessionMinutes >= 90 },
];
function parseKm(distanceText) {
  if (!distanceText) return 0;
  const text = String(distanceText).toLowerCase().replace(",", ".");
  const km = text.match(/([\d.]+)\s*km/);
  if (km) return parseFloat(km[1]) || 0;
  const m = text.match(/([\d.]+)\s*m\b/);
  if (m) return (parseFloat(m[1]) || 0) / 1000;
  return 0;
}
function isRunningExercise(ex) {
  return !!ex && /lauf|run/i.test(ex.name);
}
function totalRunningKm(sessions, exercises) {
  let total = 0;
  sessions.forEach((s) => s.entries.forEach((e) => {
    const ex = exercises.find((x) => x.id === e.exerciseId);
    if (isRunningExercise(ex)) e.sets.forEach((st) => { total += parseKm(st.distance); });
  }));
  return total;
}
function longestSingleRunKm(sessions, exercises) {
  let max = 0;
  sessions.forEach((s) => s.entries.forEach((e) => {
    const ex = exercises.find((x) => x.id === e.exerciseId);
    if (isRunningExercise(ex)) e.sets.forEach((st) => { const km = parseKm(st.distance); if (km > max) max = km; });
  }));
  return max;
}

/* ---------- Belastungs-/Planungshinweise für den Coach (Heuristiken, kein Autopilot) ---------- */
function computeCoachSuggestions(profile, sessions, exercises) {
  const suggestions = [];
  if (!profile) return suggestions;
  const now = new Date();
  const daysAgo = (dateStr) => Math.floor((now - new Date(dateStr + "T00:00:00")) / 86400000);

  const last7 = sessions.filter((s) => daysAgo(s.date) <= 6);
  const prev7 = sessions.filter((s) => daysAgo(s.date) > 6 && daysAgo(s.date) <= 13);

  const recentPain = [];
  sessions.filter((s) => daysAgo(s.date) <= 13).forEach((s) => s.entries.forEach((e) => {
    if (e.sets.some((st) => st.pain)) {
      const ex = exercises.find((x) => x.id === e.exerciseId);
      recentPain.push({ date: s.date, name: ex ? ex.name : "Übung" });
    }
  }));
  if (recentPain.length > 0) {
    const uniqueNames = [...new Set(recentPain.map((p) => `${p.name} (${fmtDate(p.date)})`))].slice(0, 3);
    suggestions.push({ tone: "warn", text: `Schmerz-Meldung bei: ${uniqueNames.join(", ")} — vor weiterer Belastungssteigerung ansprechen und ggf. Übung anpassen.` });
  }
  const targetFreq = Number(profile.frequency) || null;

  if (targetFreq) {
    if (last7.length < targetFreq - 1) {
      suggestions.push({ tone: "warn", text: `Nur ${last7.length} von ${targetFreq} geplanten Einheiten in den letzten 7 Tagen — für nächste Woche ggf. niedrigschwellig ansetzen oder Hindernisse ansprechen.` });
    } else if (last7.length > targetFreq + 1) {
      suggestions.push({ tone: "warn", text: `${last7.length} Einheiten in den letzten 7 Tagen, mehr als die vereinbarten ${targetFreq} — auf ausreichend Erholung achten, bevor weiter gesteigert wird.` });
    } else {
      suggestions.push({ tone: "good", text: `Trainingsfrequenz liegt mit ${last7.length} Einheiten in den letzten 7 Tagen im vereinbarten Bereich (Ziel: ${targetFreq}).` });
    }
  }

  const volLast7 = last7.reduce((s, x) => s + (x.volume || sessionVolume(x)), 0);
  const volPrev7 = prev7.reduce((s, x) => s + (x.volume || sessionVolume(x)), 0);
  if (volPrev7 > 0) {
    const change = ((volLast7 - volPrev7) / volPrev7) * 100;
    if (change >= 35) suggestions.push({ tone: "warn", text: `Trainingsvolumen ist gegenüber der Vorwoche um rund ${Math.round(change)}% gestiegen — für die kommende Woche eher moderat steigern oder einen leichteren Tag einplanen.` });
    else if (change <= -35) suggestions.push({ tone: "info", text: `Volumen ist gegenüber der Vorwoche um rund ${Math.round(Math.abs(change))}% gesunken — prüfen, ob das bewusst war (z. B. Deload) oder ob wieder gesteigert werden sollte.` });
  }

  const recentSessions = sessions.filter((s) => daysAgo(s.date) <= 13);
  const trainedCategories = new Set();
  recentSessions.forEach((s) => s.entries.forEach((e) => { const ex = exercises.find((x) => x.id === e.exerciseId); if (ex) trainedCategories.add(ex.category); }));
  const mainCategories = ["Beine", "Rücken", "Brust", "Schultern", "Arme", "Bauch/Rumpf"];
  const missing = mainCategories.filter((c) => !trainedCategories.has(c));
  if (recentSessions.length > 0 && missing.length > 0) {
    suggestions.push({ tone: "info", text: `In den letzten 14 Tagen nicht trainiert: ${missing.join(", ")}. Für die kommende Woche einplanen, falls das nicht bewusst ausgelassen wurde.` });
  }

  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  const lastSession = sorted[sorted.length - 1];
  if (lastSession) {
    const gap = daysAgo(lastSession.date);
    if (gap >= 7) suggestions.push({ tone: "warn", text: `Letzte Trainingseinheit liegt ${gap} Tage zurück — ggf. nachfragen und mit einer leichteren Einheit wieder einsteigen.` });
  } else {
    suggestions.push({ tone: "info", text: "Noch keine Trainingseinheit erfasst." });
  }

  if (profile.goalType === "aufbauen") {
    suggestions.push({ tone: "info", text: "Ziel Muskelaufbau: für nächste Woche auf progressive Steigerung (Gewicht oder Wiederholungen) gegenüber der letzten Einheit je Übung achten." });
  } else if (profile.goalType === "abnehmen") {
    suggestions.push({ tone: "info", text: "Ziel Abnehmen: Frequenz und Ernährungsdisziplin sind hier oft wichtiger als reine Belastungssteigerung — im Blick behalten." });
  }

  const nextEvent = nextUpcomingEvent(profile);
  if (nextEvent) {
    const d = daysUntil(nextEvent.date);
    if (d <= 7) {
      suggestions.push({ tone: "warn", text: `${nextEvent.title} in ${d} Tag${d !== 1 ? "en" : ""}: Tapering-Woche — Umfang deutlich reduzieren, Intensität nur kurz anklingen lassen, Erholung priorisieren.` });
      suggestions.push({ tone: "info", text: `Ernährung Richtung ${nextEvent.title}: gleichmäßig ausreichend Kohlenhydrate zuführen, keine neuen Lebensmittel oder Diätexperimente mehr kurz vor dem Termin.` });
    } else if (d <= 21) {
      suggestions.push({ tone: "info", text: `${nextEvent.title} in ${d} Tagen: Belastungsspitze langsam auslaufen lassen, ausreichend Erholungstage zwischen den Einheiten einplanen.` });
    } else if (d <= 56) {
      suggestions.push({ tone: "info", text: `${nextEvent.title} in ${d} Tagen: Aufbauphase — Belastung darf planmäßig weiter ansteigen, dabei regelmäßige Erholungstage nicht streichen.` });
    }
  }

  return suggestions;
}
function computeStats(profile, sessions, nutrition, weights, plans, exercises) {
  const sessionsCount = sessions.length;
  const baselineDone = sessions.some((s) => s.isBaseline);
  const prTotal = sessions.reduce((s, x) => s + (x.prCount || 0), 0);
  const nutritionDays = new Set(nutrition.map((e) => e.date)).size;
  const nutritionEntriesTotal = nutrition.length;
  const weightEntries = weights.length;
  const sortedWeights = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sortedWeights[sortedWeights.length - 1];
  let weightGoalReached = false;
  if (latest && profile?.goalWeight) {
    const diff = latest.weight - Number(profile.goalWeight);
    if (profile.goalType === "abnehmen") weightGoalReached = diff <= 0.3;
    else if (profile.goalType === "aufbauen") weightGoalReached = diff >= -0.3;
    else weightGoalReached = Math.abs(diff) <= 1;
  }
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentSessions7d = sessions.filter((s) => new Date(s.date) >= sevenDaysAgo).length;

  const weekHasSession = (weeksBack) => {
    const end = new Date(); end.setDate(end.getDate() - weeksBack * 7);
    const start = new Date(end); start.setDate(start.getDate() - 7);
    return sessions.some((s) => { const d = new Date(s.date); return d > start && d <= end; });
  };
  const monthStreak = [0, 1, 2, 3].every((w) => weekHasSession(w));

  const hasSuperset = sessions.some((s) => {
    const counts = {};
    s.entries.forEach((e) => { if (e.groupId) counts[e.groupId] = (counts[e.groupId] || 0) + 1; });
    return Object.values(counts).some((c) => c > 1);
  });
  const hasFreestyle = sessions.some((s) => s.workoutId === null);
  const totalVolume = sessions.reduce((s, x) => s + (x.volume || sessionVolume(x)), 0);
  const maxExercisesInSession = Math.max(0, ...sessions.map((s) => s.entries.length));
  const earlybird = sessions.some((s) => s.startedAt && new Date(s.startedAt).getHours() < 7);
  const nightowl = sessions.some((s) => s.startedAt && new Date(s.startedAt).getHours() >= 21);
  const weekendTrained = sessions.some((s) => { const d = new Date(s.date + "T00:00:00").getDay(); return d === 0 || d === 6; });

  const proteinTarget = Number(profile?.proteinTarget) || 0;
  const proteinByDate = {};
  nutrition.forEach((e) => { proteinByDate[e.date] = (proteinByDate[e.date] || 0) + e.protein; });
  const proteinDaysMet = proteinTarget ? Object.values(proteinByDate).filter((v) => v >= proteinTarget).length : 0;

  const kcalTarget = Number(profile?.kcalTarget) || 0;
  const kcalByDate = {};
  nutrition.forEach((e) => { kcalByDate[e.date] = (kcalByDate[e.date] || 0) + e.kcal; });
  const calorieDaysMet = kcalTarget ? Object.values(kcalByDate).filter((v) => v > 0 && v <= kcalTarget * 1.05).length : 0;

  let onTrack = false;
  if (profile?.goalWeight && sortedWeights.length >= 2) {
    const first = sortedWeights[0].weight;
    const last = sortedWeights[sortedWeights.length - 1].weight;
    if (profile.goalType === "abnehmen") onTrack = last < first;
    else if (profile.goalType === "aufbauen") onTrack = last > first;
    else onTrack = Math.abs(last - Number(profile.goalWeight)) < Math.abs(first - Number(profile.goalWeight));
  }

  const activePlan = (plans || []).find((p) => p.active);
  const planDaysWithWorkout = activePlan ? activePlan.days.filter((d) => d.workoutId) : [];
  const planFinished = planDaysWithWorkout.length > 0 && planDaysWithWorkout.every((d) => sessions.some((s) => s.workoutId === d.workoutId));

  const runningKm = totalRunningKm(sessions, exercises || []);
  const bestSingleRunKm = longestSingleRunKm(sessions, exercises || []);
  const totalTrainingHours = sessions.reduce((s, x) => s + (x.durationSeconds || 0), 0) / 3600;
  const longestSessionMinutes = Math.max(0, ...sessions.map((s) => (s.durationSeconds || 0) / 60));

  return {
    sessionsCount, baselineDone, prTotal, nutritionDays, nutritionEntriesTotal, weightEntries, weightGoalReached, recentSessions7d,
    monthStreak, hasSuperset, hasFreestyle, totalVolume, maxExercisesInSession, earlybird, nightowl, weekendTrained,
    proteinDaysMet, calorieDaysMet, onTrack, planFinished, runningKm, bestSingleRunKm, totalTrainingHours, longestSessionMinutes,
  };
}

/* ================= Hauptkomponente ================= */
export default function CoachingLogbuch() {
  const [loadingGlobal, setLoadingGlobal] = useState(true);
  const [loadingCoachee, setLoadingCoachee] = useState(false);
  const [tab, setTab] = useState("overview");
  const [role, setRole] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [selectedCoachId, setSelectedCoachId] = useState(null);
  const [coachees, setCoachees] = useState([]);
  const [selectedCoacheeId, setSelectedCoacheeId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [nutrition, setNutrition] = useState([]);
  const [weights, setWeights] = useState([]);
  const [measurements, setMeasurementsState] = useState([]);
  const [messages, setMessagesState] = useState([]);
  const [checkins, setCheckinsState] = useState([]);
  const [customFoods, setCustomFoods] = useState([]);
  const [exercises, setExercisesState] = useState([]);
  const [plans, setPlansState] = useState([]);
  const [planHistory, setPlanHistoryState] = useState([]);
  const [sessions, setSessionsState] = useState([]);
  const [toast, setToast] = useState("");
  const [privacyAck, setPrivacyAck] = useState(true);

  useEffect(() => {
    (async () => {
      const [co, c, ex, cf, r, sc, ssc, pa] = await Promise.all([
        loadKey("coaches"), loadKey("coachees"), loadKey("exercises"), loadKey("customfoods"),
        loadKey("role", false), loadKey("selected-coachee", false), loadKey("selected-coach", false), loadKey("privacy-ack", false),
      ]);
      setCoaches(co || []);
      setCoachees(c || []);
      setExercisesState(ex || []);
      setCustomFoods(cf || []);
      setRole(r || null);
      const validSelection = sc && (c || []).some((cc) => cc.id === sc) ? sc : null;
      setSelectedCoacheeId(validSelection);
      const validCoachSelection = ssc && (co || []).some((cc) => cc.id === ssc) ? ssc : null;
      setSelectedCoachId(validCoachSelection);
      setPrivacyAck(!!pa);
      setLoadingGlobal(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedCoacheeId) { setProfile(null); setNutrition([]); setWeights([]); setMeasurementsState([]); setMessagesState([]); setCheckinsState([]); setPlansState([]); setSessionsState([]); setPlanHistoryState([]); return; }
    setLoadingCoachee(true);
    (async () => {
      const [p, n, w, me, msg, ci, pl, se, ph] = await Promise.all([
        loadKey(`profile-${selectedCoacheeId}`), loadKey(`nutrition-${selectedCoacheeId}`), loadKey(`weight-${selectedCoacheeId}`),
        loadKey(`measurements-${selectedCoacheeId}`), loadKey(`messages-${selectedCoacheeId}`), loadKey(`checkins-${selectedCoacheeId}`),
        loadKey(`plans-${selectedCoacheeId}`), loadKey(`sessions-${selectedCoacheeId}`), loadKey(`planhistory-${selectedCoacheeId}`),
      ]);
      setProfile(p || null);
      setNutrition(n || []);
      setWeights(w || []);
      setMeasurementsState(me || []);
      setMessagesState(msg || []);
      setCheckinsState(ci || []);
      setPlansState(pl || []);
      setSessionsState(se || []);
      setPlanHistoryState(ph || []);
      setTab("overview");
      setLoadingCoachee(false);
    })();
  }, [selectedCoacheeId]);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const syncCoacheeRegistry = (id, patch) => {
    setCoachees((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...patch } : c));
      saveKey("coachees", updated);
      return updated;
    });
  };

  const updateProfile = useCallback(async (next) => {
    setProfile(next);
    await saveKey(`profile-${selectedCoacheeId}`, next);
    syncCoacheeRegistry(selectedCoacheeId, { name: next.name, avatarEmoji: next.avatarEmoji, skinId: next.skinId });
  }, [selectedCoacheeId]);
  const updateNutrition = useCallback(async (next) => { setNutrition(next); await saveKey(`nutrition-${selectedCoacheeId}`, next); }, [selectedCoacheeId]);
  const updateWeights = useCallback(async (next) => { setWeights(next); await saveKey(`weight-${selectedCoacheeId}`, next); }, [selectedCoacheeId]);
  const updateMeasurements = useCallback(async (next) => { setMeasurementsState(next); await saveKey(`measurements-${selectedCoacheeId}`, next); }, [selectedCoacheeId]);
  const updateMessages = useCallback(async (next) => { setMessagesState(next); await saveKey(`messages-${selectedCoacheeId}`, next); }, [selectedCoacheeId]);
  const updateCheckins = useCallback(async (next) => { setCheckinsState(next); await saveKey(`checkins-${selectedCoacheeId}`, next); }, [selectedCoacheeId]);
  const updateCustomFoods = useCallback(async (next) => { setCustomFoods(next); await saveKey("customfoods", next); }, []);
  const updateExercises = useCallback(async (next) => { setExercisesState(next); await saveKey("exercises", next); }, []);
  const updatePlans = useCallback(async (next) => { setPlansState(next); await saveKey(`plans-${selectedCoacheeId}`, next); }, [selectedCoacheeId]);
  const updateSessions = useCallback(async (next) => { setSessionsState(next); await saveKey(`sessions-${selectedCoacheeId}`, next); }, [selectedCoacheeId]);
  const recordPlanActivation = useCallback(async (planId, date) => {
    setPlanHistoryState((prev) => {
      const next = [...prev, { planId, date: date || todayISO() }];
      saveKey(`planhistory-${selectedCoacheeId}`, next);
      return next;
    });
  }, [selectedCoacheeId]);

  useEffect(() => {
    if (!selectedCoacheeId || plans.length === 0) return;
    const today = todayISO();
    const due = plans.filter((p) => p.scheduledActivationDate && p.scheduledActivationDate <= today).sort((a, b) => b.scheduledActivationDate.localeCompare(a.scheduledActivationDate))[0];
    if (!due || due.active) return;
    const next = plans.map((p) => ({ ...p, active: p.id === due.id, scheduledActivationDate: p.id === due.id ? null : p.scheduledActivationDate }));
    updatePlans(next);
    recordPlanActivation(due.id, due.scheduledActivationDate);
  }, [plans, selectedCoacheeId, updatePlans, recordPlanActivation]);

  const chooseRole = async (next) => { setRole(next); await saveKey("role", next, false); };
  const leaveRole = async () => {
    setRole(null);
    setSelectedCoacheeId(null);
    setSelectedCoachId(null);
    await saveKey("role", null, false);
    await saveKey("selected-coachee", null, false);
    await saveKey("selected-coach", null, false);
  };
  const selectCoachee = async (id) => { setSelectedCoacheeId(id); await saveKey("selected-coachee", id, false); };
  const leaveCoachee = async () => { setSelectedCoacheeId(null); await saveKey("selected-coachee", null, false); };
  const createCoachee = async (name, pin) => {
    const id = uid();
    const rec = { id, name: name?.trim() || "Neuer Coachee", avatarEmoji: AVATAR_EMOJIS[0], skinId: "default", pin: pin?.trim() || null, coachId: selectedCoachId || null };
    const updated = [...coachees, rec];
    setCoachees(updated);
    await saveKey("coachees", updated);
    await selectCoachee(id);
  };
  const claimCoachee = async (id) => {
    const updated = coachees.map((c) => (c.id === id ? { ...c, coachId: selectedCoachId } : c));
    setCoachees(updated);
    await saveKey("coachees", updated);
  };
  const deleteCoachee = async (id) => {
    const updated = coachees.filter((c) => c.id !== id);
    setCoachees(updated);
    await saveKey("coachees", updated);
    await Promise.all([
      deleteKeyStorage(`profile-${id}`), deleteKeyStorage(`nutrition-${id}`), deleteKeyStorage(`weight-${id}`),
      deleteKeyStorage(`plans-${id}`), deleteKeyStorage(`sessions-${id}`), deleteKeyStorage(`planhistory-${id}`),
      deleteKeyStorage(`measurements-${id}`), deleteKeyStorage(`messages-${id}`), deleteKeyStorage(`checkins-${id}`),
    ]);
  };
  const selectCoach = async (id) => { setSelectedCoachId(id); await saveKey("selected-coach", id, false); };
  const switchCoach = async () => { setSelectedCoachId(null); await saveKey("selected-coach", null, false); };
  const createCoach = async (name, pin) => {
    const id = uid();
    const rec = { id, name: name?.trim() || "Neuer Coach", pin: pin?.trim() || null };
    const updated = [...coaches, rec];
    setCoaches(updated);
    await saveKey("coaches", updated);
    await selectCoach(id);
  };
  const acknowledgePrivacy = async () => { setPrivacyAck(true); await saveKey("privacy-ack", true, false); };

  const foodDb = useMemo(() => [...BUILTIN_FOODS, ...customFoods], [customFoods]);

  const TABS_COACH = [
    { id: "overview", label: "Übersicht", icon: LayoutDashboard },
    { id: "onboarding", label: "Onboarding", icon: UserPlus },
    { id: "nutrition", label: "Ernährung", icon: Utensils },
    { id: "weight", label: "Gewicht", icon: Scale },
    { id: "training", label: "Training", icon: Dumbbell },
    { id: "messages", label: "Nachrichten", icon: MessageCircle },
  ];
  const TABS_COACHEE = [
    { id: "overview", label: "Übersicht", icon: LayoutDashboard },
    { id: "onboarding", label: "Onboarding", icon: UserPlus },
    { id: "nutrition", label: "Ernährung", icon: Utensils },
    { id: "weight", label: "Gewicht", icon: Scale },
    { id: "training", label: "Training", icon: Dumbbell },
    { id: "messages", label: "Nachrichten", icon: MessageCircle },
    { id: "avatar", label: "Avatar", icon: Award },
  ];
  const TABS = role === "coachee" ? TABS_COACHEE : TABS_COACH;

  if (!loadingGlobal && !privacyAck) {
    return (<div className="ptlog-root"><style>{CSS}</style><PrivacyNotice onAck={acknowledgePrivacy} /></div>);
  }
  if (!loadingGlobal && !role) {
    return (<div className="ptlog-root"><style>{CSS}</style><RoleGate onChoose={chooseRole} /></div>);
  }
  if (!loadingGlobal && role === "coach" && !selectedCoachId) {
    return (<div className="ptlog-root"><style>{CSS}</style><CoachIdentityGate coaches={coaches} onSelect={selectCoach} onCreate={createCoach} onBack={leaveRole} /></div>);
  }
  if (!loadingGlobal && role === "coachee" && !selectedCoacheeId) {
    return (<div className="ptlog-root"><style>{CSS}</style><CoacheeIdentityGate coachees={coachees} onSelect={selectCoachee} onCreate={createCoachee} onBack={leaveRole} /></div>);
  }

  return (
    <div className="ptlog-root">
      <style>{CSS}</style>

      <header className="ptlog-header">
        {profile ? (
          <AvatarDisplay emoji={profile.avatarEmoji || AVATAR_EMOJIS[0]} skin={SKINS.find((s) => s.id === (profile.skinId || "default")) || SKINS[0]} size={42} />
        ) : (
          <div className="ptlog-avatar">{selectedCoacheeId ? "?" : "👥"}</div>
        )}
        <div className="ptlog-header-text">
          <span className="ptlog-eyebrow">Coaching-Logbuch · {role === "coachee" ? "Coachee-Ansicht" : `Coach: ${coaches.find((c) => c.id === selectedCoachId)?.name || ""}`}</span>
          <h1>{profile ? profile.name : selectedCoacheeId ? (coachees.find((c) => c.id === selectedCoacheeId)?.name || "Coachee") : "Alle Coachees"}</h1>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {role === "coach" && selectedCoacheeId && <button className="ptlog-role-leave" onClick={leaveCoachee}>Alle Coachees</button>}
          {role === "coach" && <button className="ptlog-role-leave" onClick={switchCoach}>Coach wechseln</button>}
          <button className="ptlog-role-leave" onClick={leaveRole}>Rolle wechseln</button>
        </div>
      </header>

      {role === "coach" && !selectedCoacheeId ? (
        <CoachRoster coachees={coachees} onSelect={selectCoachee} onCreate={createCoachee} onDelete={deleteCoachee} onClaim={claimCoachee} exercises={exercises} selectedCoachId={selectedCoachId} />
      ) : (
        <>
          <nav className="ptlog-tabs">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} className={"ptlog-tab" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
                  <Icon size={15} strokeWidth={2.2} />
                  {t.label}
                </button>
              );
            })}
          </nav>

          <main className="ptlog-page">
            {loadingCoachee ? (
              <div className="ptlog-loading">Daten werden geladen …</div>
            ) : (
              <>
                {tab === "overview" && (
                  <Overview profile={profile} nutrition={nutrition} weights={weights} sessions={sessions} exercises={exercises} checkins={checkins} setCheckins={updateCheckins} role={role} goToOnboarding={() => setTab("onboarding")} />
                )}
                {tab === "onboarding" && (
                  <Onboarding profile={profile} weights={weights} readOnly={role !== "coachee"} onSave={(p) => { updateProfile(p); flash("Profil gespeichert"); setTab("overview"); }} />
                )}
                {tab === "nutrition" && (
                  <Nutrition profile={profile} nutrition={nutrition} setNutrition={updateNutrition} foodDb={foodDb} customFoods={customFoods} setCustomFoods={updateCustomFoods} flash={flash} readOnly={role !== "coachee"} />
                )}
                {tab === "weight" && <WeightTab profile={profile} weights={weights} setWeights={updateWeights} measurements={measurements} setMeasurements={updateMeasurements} flash={flash} readOnly={role !== "coachee"} />}
                {tab === "messages" && <MessagesView messages={messages} setMessages={updateMessages} role={role} coacheeId={selectedCoacheeId} coacheeName={profile?.name} />}
                {tab === "avatar" && role === "coachee" && (
                  <AvatarTab profile={profile} updateProfile={updateProfile} sessions={sessions} nutrition={nutrition} weights={weights} plans={plans} exercises={exercises} />
                )}
                {tab === "training" && (
                  role === "coachee" ? (
                    <CoacheeTrainingView plans={plans} exercises={exercises} sessions={sessions} setSessions={updateSessions} setExercises={updateExercises} flash={flash} />
                  ) : (
                    <CoachTrainingView exercises={exercises} setExercises={updateExercises} plans={plans} setPlans={updatePlans} profile={profile} sessions={sessions} coachees={coachees} coacheeId={selectedCoacheeId} planHistory={planHistory} onActivatePlan={recordPlanActivation} />
                  )
                )}
              </>
            )}
          </main>
        </>
      )}

      {toast && <div className="ptlog-toast"><Check size={14} /> {toast}</div>}
    </div>
  );
}

/* ================= Datenschutzhinweis (einmalig) ================= */
function PrivacyNotice({ onAck }) {
  return (
    <div className="ptlog-gate">
      <span className="ptlog-eyebrow">Coaching-Logbuch</span>
      <h1 className="ptlog-gate-title">Bevor es losgeht</h1>
      <div className="ptlog-card">
        <p className="ptlog-goal-text">
          Dieses Tool speichert Trainings-, Ernährungs- und Gewichtsdaten in der Speicherfunktion dieses Claude-Artifacts —
          nicht in einem dediziert für Gesundheitsdaten ausgelegten, Ende-zu-Ende-verschlüsselten System.
        </p>
        <p className="ptlog-goal-text">
          Als Coach bist du verantwortlich dafür, dass deine Coachees wissen, wo und wie ihre Daten gespeichert werden, und
          dem zustimmen. Über die Coachee-Verwaltung kannst du die Daten einzelner Coachees jederzeit als Datei exportieren
          oder vollständig löschen.
        </p>
        <p className="ptlog-goal-text">
          Die PIN-Abfrage für Coach- und Coachee-Zugang ist ein einfacher Schutz gegen versehentliches oder beiläufiges
          Öffnen fremder Daten — keine vollwertige Zugriffskontrolle.
        </p>
      </div>
      <button className="ptlog-btn primary wide" onClick={onAck}>Verstanden, weiter</button>
    </div>
  );
}

/* ================= Coach-Auswahl (für die Coach-Rolle: welcher Coach bist du?) ================= */
function CoachIdentityGate({ coaches, onSelect, onCreate, onBack }) {
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const pick = (c) => {
    if (c.pin) { setPendingId(c.id); setPinInput(""); setPinError(""); }
    else onSelect(c.id);
  };
  const confirmPin = () => {
    const c = coaches.find((x) => x.id === pendingId);
    if (c && pinInput === c.pin) onSelect(c.id);
    else setPinError("PIN stimmt nicht überein.");
  };

  if (pendingId) {
    const c = coaches.find((x) => x.id === pendingId);
    return (
      <div className="ptlog-gate">
        <button className="ptlog-btn" onClick={() => setPendingId(null)} style={{ marginBottom: 14, width: "fit-content" }}><ChevronLeft size={14} /> zurück</button>
        <span className="ptlog-eyebrow">Coaching-Logbuch · Coach-Ansicht</span>
        <h1 className="ptlog-gate-title">PIN für {c?.name}</h1>
        <div className="ptlog-card">
          <Field label="PIN"><input type="password" inputMode="numeric" value={pinInput} onChange={(e) => setPinInput(e.target.value)} /></Field>
          {pinError && <p className="ptlog-inline-error">{pinError}</p>}
          <button className="ptlog-btn primary wide" onClick={confirmPin}>Bestätigen</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ptlog-gate">
      <button className="ptlog-btn" onClick={onBack} style={{ marginBottom: 14, width: "fit-content" }}><ChevronLeft size={14} /> zurück</button>
      <span className="ptlog-eyebrow">Coaching-Logbuch · Coach-Ansicht</span>
      <h1 className="ptlog-gate-title">Welcher Coach bist du?</h1>
      {coaches.length > 0 && (
        <>
          <p className="ptlog-muted">Wähle deinen Namen aus der Liste.</p>
          {coaches.map((c) => (
            <button key={c.id} className="ptlog-gate-btn" onClick={() => pick(c)} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <strong>{c.name}</strong>
              {c.pin && <Lock size={13} style={{ marginLeft: "auto" }} />}
            </button>
          ))}
        </>
      )}
      <div className="ptlog-card" style={{ marginTop: 16 }}>
        <h3>Ich bin neu hier</h3>
        <p className="ptlog-muted" style={{ marginTop: -4 }}>Coachees, die du anlegst, werden automatisch dir zugeordnet.</p>
        <div className="ptlog-add-row">
          <Field label="Dein Name"><input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Vorname" /></Field>
          <Field label="PIN (optional)"><input type="password" inputMode="numeric" value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="schützt deinen Zugang" /></Field>
          <button className="ptlog-btn primary" onClick={() => onCreate(newName, newPin)} disabled={!newName.trim()}>Loslegen</button>
        </div>
      </div>
    </div>
  );
}

/* ================= Rollen-Gate (zwei getrennte Anmeldewege) ================= */
function RoleGate({ onChoose }) {
  return (
    <div className="ptlog-gate">
      <span className="ptlog-eyebrow">Coaching-Logbuch</span>
      <h1 className="ptlog-gate-title">Wer bist du?</h1>
      <p className="ptlog-muted">Wähle deine Rolle. Du siehst danach nur die für dich relevanten Bereiche.</p>
      <button className="ptlog-gate-btn" onClick={() => onChoose("coach")}>
        <strong>Ich bin Coach</strong>
        <span className="ptlog-muted">Übungen, Workouts &amp; Pläne erstellen, Onboarding &amp; Fortschritt aller Coachees einsehen</span>
      </button>
      <button className="ptlog-gate-btn" onClick={() => onChoose("coachee")}>
        <strong>Ich bin Coachee</strong>
        <span className="ptlog-muted">Onboarding ausfüllen, Ernährung &amp; Gewicht eintragen, Training ausführen, Avatar &amp; Erfolge</span>
      </button>
    </div>
  );
}

/* ================= Coachee-Auswahl (für die Coachee-Rolle: wer bin ich?) ================= */
function CoacheeIdentityGate({ coachees, onSelect, onCreate, onBack }) {
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const pick = (c) => {
    if (c.pin) { setPendingId(c.id); setPinInput(""); setPinError(""); }
    else onSelect(c.id);
  };
  const confirmPin = () => {
    const c = coachees.find((x) => x.id === pendingId);
    if (c && pinInput === c.pin) onSelect(c.id);
    else setPinError("PIN stimmt nicht überein.");
  };

  if (pendingId) {
    const c = coachees.find((x) => x.id === pendingId);
    return (
      <div className="ptlog-gate">
        <button className="ptlog-btn" onClick={() => setPendingId(null)} style={{ marginBottom: 14, width: "fit-content" }}><ChevronLeft size={14} /> zurück</button>
        <span className="ptlog-eyebrow">Coaching-Logbuch · Coachee-Ansicht</span>
        <h1 className="ptlog-gate-title">PIN für {c?.name}</h1>
        <div className="ptlog-card">
          <Field label="PIN"><input type="password" inputMode="numeric" value={pinInput} onChange={(e) => setPinInput(e.target.value)} /></Field>
          {pinError && <p className="ptlog-inline-error">{pinError}</p>}
          <button className="ptlog-btn primary wide" onClick={confirmPin}>Bestätigen</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ptlog-gate">
      <button className="ptlog-btn" onClick={onBack} style={{ marginBottom: 14, width: "fit-content" }}><ChevronLeft size={14} /> zurück</button>
      <span className="ptlog-eyebrow">Coaching-Logbuch · Coachee-Ansicht</span>
      <h1 className="ptlog-gate-title">Wer bist du?</h1>
      {coachees.length > 0 && (
        <>
          <p className="ptlog-muted">Wähle deinen Namen aus der Liste.</p>
          {coachees.map((c) => (
            <button key={c.id} className="ptlog-gate-btn" onClick={() => pick(c)} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <AvatarDisplay emoji={c.avatarEmoji || AVATAR_EMOJIS[0]} skin={SKINS.find((s) => s.id === (c.skinId || "default")) || SKINS[0]} size={36} />
              <strong>{c.name}</strong>
              {c.pin && <Lock size={13} style={{ marginLeft: "auto" }} />}
            </button>
          ))}
        </>
      )}
      <div className="ptlog-card" style={{ marginTop: 16 }}>
        <h3>Ich bin neu hier</h3>
        <div className="ptlog-add-row">
          <Field label="Dein Name"><input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Vorname" /></Field>
          <Field label="PIN (optional)"><input type="password" inputMode="numeric" value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="schützt dein Profil" /></Field>
          <button className="ptlog-btn primary" onClick={() => onCreate(newName, newPin)} disabled={!newName.trim()}>Loslegen</button>
        </div>
      </div>
    </div>
  );
}

/* ================= Coachee-Übersicht für den Coach (bei mehreren Coachees) ================= */
function CoachRoster({ coachees, onSelect, onCreate, onDelete, onClaim, exercises, selectedCoachId }) {
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [summaries, setSummaries] = useState({});
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const entries = await Promise.all(coachees.map(async (c) => {
        const [sessions, weights, profile] = await Promise.all([loadKey(`sessions-${c.id}`), loadKey(`weight-${c.id}`), loadKey(`profile-${c.id}`)]);
        const sortedSessions = (sessions || []).sort((a, b) => b.date.localeCompare(a.date));
        const sortedWeights = (weights || []).sort((a, b) => b.date.localeCompare(a.date));
        const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sessionsThisWeek = (sessions || []).filter((s) => new Date(s.date) >= sevenDaysAgo).length;
        const suggestions = computeCoachSuggestions(profile, sessions || [], exercises || []);
        const warnings = suggestions.filter((s) => s.tone === "warn");
        return [c.id, { lastSession: sortedSessions[0] || null, lastWeight: sortedWeights[0] || null, sessionsThisWeek, warnings }];
      }));
      if (!cancelled) { setSummaries(Object.fromEntries(entries)); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [coachees, exercises]);

  const handleDelete = (c) => {
    if (window.confirm(`${c.name} und alle zugehörigen Daten (Profil, Ernährung, Gewicht, Pläne, Sessions) unwiderruflich löschen?`)) {
      onDelete(c.id);
    }
    setMenuOpenId(null);
  };

  const mine = coachees.filter((c) => c.coachId === selectedCoachId);
  const unassigned = coachees.filter((c) => !c.coachId);
  const totalWarnings = mine.reduce((s, c) => s + (summaries[c.id]?.warnings?.length || 0), 0);

  const renderCard = (c) => {
    const s = summaries[c.id] || {};
    return (
      <div key={c.id} className="ptlog-roster-card">
        <button className="ptlog-roster-card-main" onClick={() => onSelect(c.id)}>
          <AvatarDisplay emoji={c.avatarEmoji || AVATAR_EMOJIS[0]} skin={SKINS.find((sk) => sk.id === (c.skinId || "default")) || SKINS[0]} size={44} />
          <div className="ptlog-roster-info">
            <strong>{c.name}{c.pin && <Lock size={11} style={{ marginLeft: 5, verticalAlign: "middle" }} />}</strong>
            <span className="ptlog-muted">{s.lastSession ? `zuletzt: ${fmtDate(s.lastSession.date)}` : "noch kein Training"}</span>
            <span className="ptlog-muted">{s.sessionsThisWeek || 0}× diese Woche{s.lastWeight ? ` · ${s.lastWeight.weight} kg` : ""}</span>
            {s.warnings?.length > 0 && <span className="ptlog-roster-warning">⚠️ {s.warnings[0].text}{s.warnings.length > 1 ? ` (+${s.warnings.length - 1} weitere)` : ""}</span>}
          </div>
        </button>
        <div className="ptlog-roster-menu-wrap">
          <button className="ptlog-btn-x" onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === c.id ? null : c.id); }}><MoreHorizontal size={16} /></button>
          {menuOpenId === c.id && (
            <div className="ptlog-roster-menu">
              {!c.coachId && <button onClick={() => { onClaim(c.id); setMenuOpenId(null); }}>Mir zuweisen</button>}
              <button onClick={() => { exportCoacheeData(c.id, c.name); setMenuOpenId(null); }}>Daten exportieren</button>
              <button onClick={() => handleDelete(c)} style={{ color: COLORS.warn }}>Coachee löschen</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="ptlog-section">
      <h2>Deine Coachees</h2>
      {!loading && totalWarnings > 0 && (
        <p className="ptlog-suggestion tone-warn" style={{ marginBottom: 14 }}>⚠️ {totalWarnings} Hinweis{totalWarnings !== 1 ? "e" : ""} bei deinen Coachees — siehe Markierungen unten.</p>
      )}
      {mine.length === 0 && <p className="ptlog-muted">Dir sind noch keine Coachees zugeordnet.</p>}
      {loading && coachees.length > 0 ? (
        <p className="ptlog-muted">Wird geladen …</p>
      ) : (
        <div className="ptlog-roster-grid">{mine.map(renderCard)}</div>
      )}
      {unassigned.length > 0 && !loading && (
        <>
          <h3 style={{ marginTop: 20 }}>Nicht zugeordnet</h3>
          <p className="ptlog-muted" style={{ marginTop: -6 }}>Coachees ohne festen Coach — über „···" kannst du sie dir zuweisen.</p>
          <div className="ptlog-roster-grid">{unassigned.map(renderCard)}</div>
        </>
      )}
      <div className="ptlog-card" style={{ marginTop: 16 }}>
        <h3>Neuen Coachee anlegen</h3>
        <div className="ptlog-add-row">
          <Field label="Name"><input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Vorname" /></Field>
          <Field label="PIN (optional)"><input type="password" inputMode="numeric" value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="schützt das Profil" /></Field>
          <button className="ptlog-btn primary" onClick={() => { onCreate(newName, newPin); setNewName(""); setNewPin(""); }} disabled={!newName.trim()}><Plus size={14} /> Anlegen</button>
        </div>
      </div>
    </div>
  );
}

/* ================= Übersicht ================= */
function Overview({ profile, nutrition, weights, sessions, exercises, checkins, setCheckins, role, goToOnboarding }) {
  if (!profile) {
    return (
      <div className="ptlog-empty">
        <h2>Noch kein Klientenprofil angelegt</h2>
        {role === "coachee" ? (
          <>
            <p>Fülle zuerst das Onboarding mit deinen Eckdaten aus.</p>
            <button className="ptlog-btn primary" onClick={goToOnboarding}>Zum Onboarding</button>
          </>
        ) : (
          <p>Dein Coachee hat das Onboarding noch nicht ausgefüllt.</p>
        )}
      </div>
    );
  }
  const today = todayISO();
  const todayEntries = nutrition.filter((e) => e.date === today);
  const totals = todayEntries.reduce((s, e) => ({ kcal: s.kcal + e.kcal, protein: s.protein + e.protein, carbs: s.carbs + e.carbs, fat: s.fat + e.fat }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
  const targets = { kcal: Number(profile.kcalTarget) || 0, protein: Number(profile.proteinTarget) || 0, carbs: Number(profile.carbsTarget) || 0, fat: Number(profile.fatTarget) || 0 };

  const sortedWeights = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const latestWeight = sortedWeights[sortedWeights.length - 1];
  const startWeight = Number(profile.startWeight);
  const weightDelta = latestWeight ? round(latestWeight.weight - startWeight, 1) : null;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const sessionsThisWeek = sessions.filter((s) => new Date(s.date) >= oneWeekAgo).length;
  const lastSession = [...sessions].sort((a, b) => b.date.localeCompare(a.date))[0];
  const topProgress = useMemo(() => computeTopProgress(sessions, exercises), [sessions, exercises]);

  return (
    <div className="ptlog-section">
      <div className="ptlog-hero">
        <span className="ptlog-hero-label">Aktuelles Gewicht</span>
        <div className="ptlog-hero-row">
          <span className="ptlog-hero-value">{latestWeight ? latestWeight.weight : "–"}</span>
          <span className="ptlog-hero-unit">kg</span>
          {weightDelta !== null && (
            <span className={"ptlog-chip" + (weightDelta <= 0 ? " good" : " neutral")}>{weightDelta > 0 ? "+" : ""}{weightDelta} kg seit Start</span>
          )}
        </div>
      </div>

      <div className="ptlog-stat-grid">
        <StatCard label="Kalorien heute" value={`${totals.kcal}`} unit="kcal" sub={targets.kcal ? `Ziel ${targets.kcal} kcal` : "kein Ziel gesetzt"} tone={targets.kcal && totals.kcal > targets.kcal ? "warn" : "good"} />
        <StatCard label="Protein heute" value={`${round(totals.protein)}`} unit="g" sub={targets.protein ? `Ziel ${targets.protein} g` : ""} tone="neutral" />
        <StatCard label="Training diese Woche" value={`${sessionsThisWeek}`} unit="×" sub={lastSession ? `zuletzt: ${lastSession.workoutName}` : "noch kein Eintrag"} tone="neutral" />
      </div>

      {(targets.kcal || targets.protein) && (
        <div className="ptlog-card"><h3>Bedarfsdeckung heute</h3><NutrientChart totals={totals} targets={targets} /></div>
      )}

      <CheckinCard checkins={checkins} setCheckins={setCheckins} role={role} />

      {topProgress.length > 0 && (
        <div className="ptlog-card">
          <h3>Größte Kraftzuwächse</h3>
          <ul className="ptlog-entry-list">
            {topProgress.map((p) => (
              <li key={p.exerciseId}>
                <div><strong>{p.name}</strong><div className="ptlog-entry-macros">{p.from} kg → {p.to} kg</div></div>
                <span className="ptlog-chip good">+{p.delta} kg</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="ptlog-card">
        <h3>Ziele</h3>
        <p className="ptlog-goal-text">{profile.goals || "Keine Ziele hinterlegt."}</p>
        {profile.constraints && (<><h4>Einschränkungen / Hinweise</h4><p className="ptlog-goal-text">{profile.constraints}</p></>)}
      </div>
    </div>
  );
}

/* ---------- Wöchentlicher Check-in ---------- */
function CheckinCard({ checkins, setCheckins, role }) {
  const [energy, setEnergy] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [stress, setStress] = useState(3);
  const [motivation, setMotivation] = useState(3);
  const sorted = [...(checkins || [])].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const alreadyToday = latest?.date === todayISO();

  const submit = () => {
    const next = [...(checkins || []).filter((c) => c.date !== todayISO()), { id: uid(), date: todayISO(), energy, sleep, stress, motivation }];
    setCheckins(next);
  };

  const oneWeekAgo = new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const recent = (checkins || []).filter((c) => new Date(c.date) >= oneWeekAgo);
  const prior = (checkins || []).filter((c) => new Date(c.date) >= twoWeeksAgo && new Date(c.date) < oneWeekAgo);
  const avg = (arr, key) => (arr.length ? round(arr.reduce((s, c) => s + Number(c[key]), 0) / arr.length, 1) : null);

  return (
    <div className="ptlog-card">
      <h3>Wöchentlicher Check-in</h3>
      {role === "coachee" ? (
        <>
          {alreadyToday ? (
            <p className="ptlog-muted">Heute schon eingetragen: Energie {latest.energy} · Schlaf {latest.sleep} · Stress {latest.stress} · Motivation {latest.motivation}</p>
          ) : (
            <>
              {[["Energie", energy, setEnergy], ["Schlafqualität", sleep, setSleep], ["Stresslevel", stress, setStress], ["Motivation", motivation, setMotivation]].map(([label, val, setter]) => (
                <div key={label} className="ptlog-checkin-row">
                  <span>{label}</span>
                  <div className="ptlog-checkin-scale">
                    {[1, 2, 3, 4, 5].map((n) => (<button key={n} type="button" className={"ptlog-checkin-dot" + (val === n ? " active" : "")} onClick={() => setter(n)}>{n}</button>))}
                  </div>
                </div>
              ))}
              <button className="ptlog-btn primary" style={{ marginTop: 8 }} onClick={submit}>Check-in abgeben</button>
            </>
          )}
        </>
      ) : (
        latest ? (
          <>
            <p className="ptlog-muted">Letzter Check-in ({fmtDate(latest.date)}): Energie {latest.energy} · Schlaf {latest.sleep} · Stress {latest.stress} · Motivation {latest.motivation}</p>
            {prior.length > 0 && recent.length > 0 && (
              <p className="ptlog-muted">Ø letzte 7 Tage — Energie {avg(recent, "energy")} (vorher {avg(prior, "energy")}) · Stress {avg(recent, "stress")} (vorher {avg(prior, "stress")})</p>
            )}
          </>
        ) : (<p className="ptlog-muted">Noch kein Check-in vom Coachee.</p>)
      )}
    </div>
  );
}
function StatCard({ label, value, unit, sub, tone }) {
  return (
    <div className={"ptlog-stat-card tone-" + tone}>
      <span className="ptlog-stat-label">{label}</span>
      <span className="ptlog-stat-value">{value}<span className="ptlog-stat-unit">{unit}</span></span>
      <span className="ptlog-stat-sub">{sub}</span>
    </div>
  );
}

/* ---------- Bedarfsdeckungs-Chart ---------- */
function NutrientChart({ totals, targets }) {
  const rows = [
    { key: "kcal", name: "Kalorien", unit: "kcal" },
    { key: "protein", name: "Protein", unit: "g" },
    { key: "carbs", name: "Kohlenh.", unit: "g" },
    { key: "fat", name: "Fett", unit: "g" },
  ];
  const data = rows.map((r) => {
    const target = targets[r.key] || 0;
    const value = totals[r.key] || 0;
    return { name: r.name, unit: r.unit, value: round(value, r.key === "kcal" ? 0 : 1), target, pct: target ? round((value / target) * 100) : 0 };
  });
  const maxPct = Math.max(120, ...data.map((d) => d.pct));
  return (
    <div style={{ height: 210 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid stroke={COLORS.border} vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke={COLORS.muted} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke={COLORS.muted} fontSize={11} tickLine={false} axisLine={false} domain={[0, maxPct]} tickFormatter={(v) => v + "%"} />
          <ReferenceLine y={100} stroke={COLORS.muted} strokeDasharray="4 4" />
          <Tooltip content={<NutrientTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
          <Bar dataKey="pct" radius={[6, 6, 0, 0]} maxBarSize={44}>
            {data.map((d, i) => (<Cell key={i} fill={d.pct > 100 ? COLORS.warn : COLORS.accent} />))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
function NutrientTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (<div className="ptlog-tooltip"><strong>{d.name}</strong><div>{d.value} / {d.target || "–"} {d.unit} · {d.pct}%</div></div>);
}

/* ================= Onboarding ================= */
function Onboarding({ profile, onSave, readOnly, weights }) {
  const [f, setF] = useState(profile || {
    name: "", gender: "w", age: "", height: "", startWeight: "", goalWeight: "",
    activity: "leicht", experience: "anfaenger", frequency: "3", goalType: "halten",
    goals: "", constraints: "", kcalTarget: "", proteinTarget: "", carbsTarget: "", fatTarget: "",
    targetEvents: [], startDate: todayISO(),
  });
  const [autoCalc, setAutoCalc] = useState(!profile);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const addEvent = () => {
    if (!newEventTitle.trim() || !newEventDate) return;
    setF((prev) => ({ ...prev, targetEvents: [...(prev.targetEvents || []), { id: uid(), title: newEventTitle.trim(), date: newEventDate }] }));
    setNewEventTitle(""); setNewEventDate("");
  };
  const removeEvent = (id) => setF((prev) => ({ ...prev, targetEvents: (prev.targetEvents || []).filter((ev) => ev.id !== id) }));

  const latestWeight = useMemo(() => {
    const sorted = [...(weights || [])].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0]?.weight || null;
  }, [weights]);
  const weightDrift = latestWeight && f.startWeight ? Math.abs(latestWeight - Number(f.startWeight)) : 0;
  const driftThreshold = f.startWeight ? Math.max(3, Number(f.startWeight) * 0.05) : Infinity;
  const showRecalcHint = !readOnly && latestWeight && weightDrift >= driftThreshold;
  const recalcWithLatestWeight = () => {
    if (!latestWeight || !f.age || !f.height) return;
    const t = estimateTargets({ gender: f.gender, age: f.age, height: f.height, weight: latestWeight, activity: f.activity, goal: f.goalType });
    setF((prev) => ({ ...prev, kcalTarget: t.kcal, proteinTarget: t.protein, carbsTarget: t.carbs, fatTarget: t.fat }));
    setAutoCalc(false);
  };

  useEffect(() => {
    if (readOnly) return;
    if (!autoCalc) return;
    if (!f.age || !f.height || !f.startWeight) return;
    const t = estimateTargets({ gender: f.gender, age: f.age, height: f.height, weight: f.startWeight, activity: f.activity, goal: f.goalType });
    setF((prev) => ({ ...prev, kcalTarget: t.kcal, proteinTarget: t.protein, carbsTarget: t.carbs, fatTarget: t.fat }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.age, f.height, f.startWeight, f.gender, f.activity, f.goalType, autoCalc, readOnly]);

  const submit = (e) => {
    e.preventDefault();
    if (readOnly) return;
    if (!f.name || !f.startWeight) return;
    onSave({ ...f, startDate: f.startDate || todayISO() });
  };

  if (readOnly && !profile) {
    return (<div className="ptlog-empty"><h2>Noch kein Profil</h2><p>Dein Coachee hat das Onboarding noch nicht ausgefüllt.</p></div>);
  }

  return (
    <form className="ptlog-section" onSubmit={submit}>
      <h2>{readOnly ? "Onboarding — Übersicht (nur lesbar)" : profile ? "Profil bearbeiten" : "Onboarding — deine Eckdaten"}</h2>
      {showRecalcHint && (
        <div className="ptlog-suggestion tone-info" style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span>Aktuelles Gewicht ({latestWeight} kg) weicht deutlich vom Startgewicht ({f.startWeight} kg) ab — Ernährungsziele ggf. neu berechnen.</span>
          <button className="ptlog-btn" type="button" onClick={recalcWithLatestWeight}>Neu berechnen</button>
        </div>
      )}
      <div className="ptlog-card">
        <h3>Person</h3>
        <div className="ptlog-grid-2">
          <Field label="Name"><input value={f.name} onChange={set("name")} required disabled={readOnly} /></Field>
          <Field label="Geschlecht (für Kalorienschätzung)">
            <select value={f.gender} onChange={set("gender")} disabled={readOnly}><option value="w">weiblich</option><option value="m">männlich</option><option value="d">divers</option></select>
          </Field>
          <Field label="Alter (Jahre)"><input type="number" min="10" max="100" value={f.age} onChange={set("age")} disabled={readOnly} /></Field>
          <Field label="Größe (cm)"><input type="number" min="100" max="230" value={f.height} onChange={set("height")} disabled={readOnly} /></Field>
          <Field label="Startgewicht (kg)"><input type="number" step="0.1" value={f.startWeight} onChange={set("startWeight")} required disabled={readOnly} /></Field>
          <Field label="Zielgewicht (kg, optional)"><input type="number" step="0.1" value={f.goalWeight} onChange={set("goalWeight")} disabled={readOnly} /></Field>
        </div>
      </div>
      <div className="ptlog-card">
        <h3>Trainingshintergrund</h3>
        <div className="ptlog-grid-2">
          <Field label="Erfahrung">
            <select value={f.experience} onChange={set("experience")} disabled={readOnly}><option value="anfaenger">Anfänger:in</option><option value="fortgeschritten">Fortgeschritten</option><option value="erfahren">Erfahren</option></select>
          </Field>
          <Field label="Geplante Trainingsfrequenz (×/Woche)"><input type="number" min="1" max="14" value={f.frequency} onChange={set("frequency")} disabled={readOnly} /></Field>
          <Field label="Aktivitätslevel im Alltag">
            <select value={f.activity} onChange={set("activity")} disabled={readOnly}><option value="sitzend">überwiegend sitzend</option><option value="leicht">leicht aktiv</option><option value="moderat">moderat aktiv</option><option value="hoch">sehr aktiv</option></select>
          </Field>
          <Field label="Ernährungsziel">
            <select value={f.goalType} onChange={set("goalType")} disabled={readOnly}><option value="abnehmen">Abnehmen</option><option value="halten">Gewicht halten</option><option value="aufbauen">Muskelaufbau</option></select>
          </Field>
        </div>
        <Field label="Ziele (frei formuliert)"><textarea rows={3} value={f.goals} onChange={set("goals")} placeholder="z. B. in 4 Monaten 10 kg Bankdrücken steigern, allgemein fitter für den Alltag werden …" disabled={readOnly} /></Field>
        <Field label="Einschränkungen, Verletzungen, Unverträglichkeiten (optional)"><textarea rows={2} value={f.constraints} onChange={set("constraints")} disabled={readOnly} /></Field>
        <Field label="Konkrete Ziel-Termine (optional, z. B. ein Wettkampf)">
          {(f.targetEvents || []).length === 0 && readOnly && <p className="ptlog-muted" style={{ margin: "4px 0" }}>Keine Ziel-Termine hinterlegt.</p>}
          {(f.targetEvents || []).map((ev) => (
            <div key={ev.id} className="ptlog-add-row" style={{ marginTop: 6, alignItems: "center" }}>
              <span style={{ flex: 1, fontSize: 14 }}>{ev.title} — {fmtDate(ev.date)}</span>
              {!readOnly && <button className="ptlog-btn-x" type="button" onClick={() => removeEvent(ev.id)}><X size={14} /></button>}
            </div>
          ))}
          {!readOnly && (
            <div className="ptlog-add-row">
              <Field label="Bezeichnung"><input value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} placeholder="z. B. Berlin-Marathon" /></Field>
              <Field label="Datum"><input type="date" value={newEventDate} onChange={(e) => setNewEventDate(e.target.value)} /></Field>
              <button className="ptlog-btn" type="button" onClick={addEvent}><Plus size={13} /> Hinzufügen</button>
            </div>
          )}
        </Field>
      </div>
      <div className="ptlog-card">
        <div className="ptlog-card-header-row">
          <h3>Ernährungsziele</h3>
          {!readOnly && <label className="ptlog-checkbox"><input type="checkbox" checked={autoCalc} onChange={(e) => setAutoCalc(e.target.checked)} /> automatisch schätzen (Mifflin-St-Jeor)</label>}
        </div>
        <div className="ptlog-grid-4">
          <Field label="Kalorien (kcal/Tag)"><input type="number" value={f.kcalTarget} onChange={(e) => { setAutoCalc(false); setF({ ...f, kcalTarget: e.target.value }); }} disabled={readOnly} /></Field>
          <Field label="Protein (g)"><input type="number" value={f.proteinTarget} onChange={(e) => { setAutoCalc(false); setF({ ...f, proteinTarget: e.target.value }); }} disabled={readOnly} /></Field>
          <Field label="Kohlenhydrate (g)"><input type="number" value={f.carbsTarget} onChange={(e) => { setAutoCalc(false); setF({ ...f, carbsTarget: e.target.value }); }} disabled={readOnly} /></Field>
          <Field label="Fett (g)"><input type="number" value={f.fatTarget} onChange={(e) => { setAutoCalc(false); setF({ ...f, fatTarget: e.target.value }); }} disabled={readOnly} /></Field>
        </div>
      </div>
      {!readOnly && <button className="ptlog-btn primary" type="submit">{profile ? "Änderungen speichern" : "Profil anlegen"}</button>}
    </form>
  );
}
function Field({ label, children }) {
  return (<label className="ptlog-field"><span>{label}</span>{children}</label>);
}

/* ================= Ernährung ================= */
function Nutrition({ profile, nutrition, setNutrition, foodDb, customFoods, setCustomFoods, flash, readOnly }) {
  const [date, setDate] = useState(todayISO());
  const [mode, setMode] = useState("search");
  const [amount, setAmount] = useState(100);
  const [saveToDb, setSaveToDb] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [selectedFromOff, setSelectedFromOff] = useState(false);
  const [offResults, setOffResults] = useState([]);
  const [offLoading, setOffLoading] = useState(false);
  const [offError, setOffError] = useState("");
  const [barcode, setBarcode] = useState("");
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [barcodeError, setBarcodeError] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [custom, setCustom] = useState({ name: "", kcal: "", protein: "", carbs: "", fat: "" });

  const localMatches = useMemo(() => {
    if (mode !== "search" || !query.trim()) return [];
    const q = query.toLowerCase();
    return foodDb.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query, foodDb, mode]);

  useEffect(() => {
    if (mode !== "search" || query.trim().length < 2 || selected) { setOffResults([]); setOffError(""); return; }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setOffLoading(true); setOffError("");
      try { setOffResults(await searchOpenFoodFacts(query.trim(), controller.signal)); }
      catch (e) { if (e.name !== "AbortError") setOffError("Online-Suche momentan nicht erreichbar."); }
      finally { setOffLoading(false); }
    }, 450);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, mode, selected]);

  const runBarcodeLookup = async (code) => {
    const target = (code || barcode).trim();
    if (!target) return;
    setBarcodeLoading(true); setBarcodeError("");
    try { const food = await lookupBarcode(target); setSelected(food); setSelectedFromOff(true); setBarcode(target); }
    catch (e) { setBarcodeError(e.message || "Produkt nicht gefunden"); }
    finally { setBarcodeLoading(false); }
  };

  const activeFood = mode === "custom"
    ? { name: custom.name, kcal: Number(custom.kcal) || 0, protein: Number(custom.protein) || 0, carbs: Number(custom.carbs) || 0, fat: Number(custom.fat) || 0 }
    : selected;

  const preview = activeFood ? {
    kcal: round((activeFood.kcal * amount) / 100), protein: round((activeFood.protein * amount) / 100, 1),
    carbs: round((activeFood.carbs * amount) / 100, 1), fat: round((activeFood.fat * amount) / 100, 1),
  } : null;

  const resetSelection = () => {
    setQuery(""); setSelected(null); setSelectedFromOff(false); setOffResults([]);
    setBarcode(""); setBarcodeError(""); setCustom({ name: "", kcal: "", protein: "", carbs: "", fat: "" }); setAmount(100);
  };

  const addEntry = () => {
    if (!activeFood || !activeFood.name || !amount) return;
    const entry = { id: uid(), date, name: activeFood.name, amount: Number(amount), kcal: preview.kcal, protein: preview.protein, carbs: preview.carbs, fat: preview.fat };
    setNutrition([...nutrition, entry]);
    if ((mode === "custom" || selectedFromOff) && saveToDb && activeFood.name) {
      const exists = customFoods.some((f) => f.name.toLowerCase() === activeFood.name.toLowerCase());
      if (!exists) setCustomFoods([...customFoods, { name: activeFood.name, kcal: activeFood.kcal, protein: activeFood.protein, carbs: activeFood.carbs, fat: activeFood.fat }]);
    }
    flash("Eintrag hinzugefügt");
    resetSelection();
  };
  const removeEntry = (id) => setNutrition(nutrition.filter((e) => e.id !== id));

  const dayEntries = nutrition.filter((e) => e.date === date);
  const totals = dayEntries.reduce((s, e) => ({ kcal: s.kcal + e.kcal, protein: s.protein + e.protein, carbs: s.carbs + e.carbs, fat: s.fat + e.fat }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
  const targets = profile ? { kcal: Number(profile.kcalTarget) || 0, protein: Number(profile.proteinTarget) || 0, carbs: Number(profile.carbsTarget) || 0, fat: Number(profile.fatTarget) || 0 } : null;

  return (
    <div className="ptlog-section">
      <div className="ptlog-row-between"><h2>Ernährung</h2><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>

      {!readOnly && (
      <div className="ptlog-card">
        <h3>Mahlzeit hinzufügen</h3>
        <div className="ptlog-mode-tabs">
          <button className={"ptlog-mode-btn" + (mode === "search" ? " active" : "")} type="button" onClick={() => { setMode("search"); resetSelection(); }}><Search size={13} /> Suchen</button>
          <button className={"ptlog-mode-btn" + (mode === "scan" ? " active" : "")} type="button" onClick={() => { setMode("scan"); resetSelection(); }}><Camera size={13} /> Barcode</button>
          <button className={"ptlog-mode-btn" + (mode === "custom" ? " active" : "")} type="button" onClick={() => { setMode("custom"); resetSelection(); }}><Plus size={13} /> Eigenes</button>
        </div>

        {mode === "search" && (
          <div>
            {selected ? (<SelectedChip food={selected} onClear={resetSelection} />) : (
              <div className="ptlog-food-search">
                <input autoFocus placeholder="z. B. Hähnchen, Skyr, Banane …" value={query} onChange={(e) => setQuery(e.target.value)} />
                {(localMatches.length > 0 || offResults.length > 0 || offLoading) && (
                  <ul className="ptlog-suggest-list">
                    {localMatches.map((m) => (<li key={"l-" + m.name} onClick={() => { setSelected(m); setSelectedFromOff(false); }}><span>{m.name}</span><span className="ptlog-suggest-sub">{m.kcal} kcal /100g</span></li>))}
                    {(offResults.length > 0 || offLoading) && localMatches.length > 0 && <li className="ptlog-suggest-divider">Open Food Facts</li>}
                    {offLoading && <li className="ptlog-suggest-loading">wird online gesucht …</li>}
                    {offResults.map((r, i) => (<li key={"o-" + i} onClick={() => { setSelected(r); setSelectedFromOff(true); }}><span>{r.name}</span><span className="ptlog-suggest-sub">{r.kcal} kcal /100g</span></li>))}
                  </ul>
                )}
                {offError && <p className="ptlog-inline-error">{offError}</p>}
              </div>
            )}
          </div>
        )}

        {mode === "scan" && (
          <div>
            {selected ? (<SelectedChip food={selected} onClear={resetSelection} />) : scannerOpen ? (
              <CameraScanner onDetected={(code) => { setScannerOpen(false); setBarcode(code); runBarcodeLookup(code); }} onClose={() => setScannerOpen(false)} />
            ) : (
              <>
                <button className="ptlog-btn primary wide" type="button" onClick={() => setScannerOpen(true)}><Camera size={15} /> Kamera-Scanner öffnen</button>
                <div className="ptlog-or-divider">oder Nummer eingeben</div>
                <div className="ptlog-add-row">
                  <Field label="Barcode"><input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="z. B. 4000417025005" /></Field>
                  <button className="ptlog-btn" type="button" onClick={() => runBarcodeLookup()} disabled={barcodeLoading}>{barcodeLoading ? "Suche …" : "Nachschlagen"}</button>
                </div>
                {barcodeError && <p className="ptlog-inline-error">{barcodeError}</p>}
              </>
            )}
            <p className="ptlog-attribution">Daten: Open Food Facts, ODbL-Lizenz</p>
          </div>
        )}

        {mode === "custom" && (
          <div className="ptlog-grid-4">
            <Field label="Bezeichnung"><input value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} /></Field>
            <Field label="kcal /100g"><input type="number" value={custom.kcal} onChange={(e) => setCustom({ ...custom, kcal: e.target.value })} /></Field>
            <Field label="Protein /100g"><input type="number" value={custom.protein} onChange={(e) => setCustom({ ...custom, protein: e.target.value })} /></Field>
            <Field label="Kohlenhydrate /100g"><input type="number" value={custom.carbs} onChange={(e) => setCustom({ ...custom, carbs: e.target.value })} /></Field>
            <Field label="Fett /100g"><input type="number" value={custom.fat} onChange={(e) => setCustom({ ...custom, fat: e.target.value })} /></Field>
          </div>
        )}

        {(mode === "custom" || (mode === "scan" && selected) || (mode === "search" && selectedFromOff)) && (
          <label className="ptlog-checkbox" style={{ marginTop: 8 }}><input type="checkbox" checked={saveToDb} onChange={(e) => setSaveToDb(e.target.checked)} /> in eigener Datenbank merken</label>
        )}

        <div className="ptlog-add-row">
          <Field label="Menge (g)"><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
          {preview && (<div className="ptlog-preview">{preview.kcal} kcal · {preview.protein} g P · {preview.carbs} g KH · {preview.fat} g F</div>)}
          <button className="ptlog-btn primary" onClick={addEntry} disabled={!activeFood || !activeFood.name}>Hinzufügen</button>
        </div>
      </div>
      )}

      {targets && (targets.kcal || targets.protein) && (<div className="ptlog-card"><h3>Tagesbilanz — {fmtDate(date)}</h3><NutrientChart totals={totals} targets={targets} /></div>)}

      <div className="ptlog-card">
        <h3>Einträge</h3>
        {dayEntries.length === 0 ? (<p className="ptlog-muted">Für diesen Tag ist noch nichts eingetragen.</p>) : (
          <ul className="ptlog-entry-list">
            {dayEntries.map((e) => (
              <li key={e.id}>
                <div><strong>{e.name}</strong><span className="ptlog-muted"> · {e.amount} g</span></div>
                <div className="ptlog-entry-macros">{e.kcal} kcal · {e.protein}g P · {e.carbs}g KH · {e.fat}g F</div>
                {!readOnly && <button className="ptlog-btn-x" onClick={() => removeEntry(e.id)} aria-label="Löschen"><X size={15} /></button>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
function SelectedChip({ food, onClear }) {
  return (
    <div className="ptlog-off-chip">
      <div><strong>{food.name}</strong><div className="ptlog-suggest-sub">{food.kcal} kcal · {food.protein}g P · {food.carbs}g KH · {food.fat}g F /100g</div></div>
      <button className="ptlog-btn" type="button" onClick={onClear}>andere Auswahl</button>
    </div>
  );
}

/* ---------- Kamera-Barcode-Scanner (native BarcodeDetector API) ---------- */
function CameraScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const [status, setStatus] = useState("starting");
  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!("BarcodeDetector" in window)) { setStatus("unsupported"); return; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
        setStatus("active");
        const detector = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"] });
        const loop = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes && codes.length > 0) { onDetected(codes[0].rawValue); return; }
          } catch (e) {}
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (e) { setStatus("denied"); }
    }
    start();
    return () => { cancelled = true; if (rafRef.current) cancelAnimationFrame(rafRef.current); if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop()); };
  }, []);
  return (
    <div className="ptlog-scanner">
      {status === "unsupported" && <p className="ptlog-inline-error">Dein Browser unterstützt keine Kamera-Barcode-Erkennung. Bitte Nummer manuell eingeben.</p>}
      {status === "denied" && <p className="ptlog-inline-error">Kamera konnte nicht gestartet werden (Zugriff erlaubt?).</p>}
      {(status === "starting" || status === "active") && (<div className="ptlog-scanner-frame"><video ref={videoRef} muted playsInline /><div className="ptlog-scanner-guide" /></div>)}
      <button className="ptlog-btn wide" type="button" onClick={onClose}>Scanner schließen</button>
    </div>
  );
}

/* ================= Gewicht ================= */
function WeightTab({ profile, weights, setWeights, measurements, setMeasurements, flash, readOnly }) {
  const [date, setDate] = useState(todayISO());
  const [weight, setWeight] = useState("");
  const add = () => {
    if (!weight) return;
    setWeights([...weights.filter((w) => w.date !== date), { id: uid(), date, weight: Number(weight) }]);
    flash("Gewicht gespeichert"); setWeight("");
  };
  const remove = (id) => setWeights(weights.filter((w) => w.id !== id));
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const chartData = sorted.map((w) => ({ date: fmtDate(w.date), weight: w.weight }));
  const goal = profile ? Number(profile.goalWeight) : null;

  const [mDate, setMDate] = useState(todayISO());
  const [mVals, setMVals] = useState({ waist: "", hip: "", chest: "", arm: "", thigh: "" });
  const MEASURE_FIELDS = [["waist", "Taille"], ["hip", "Hüfte"], ["chest", "Brust"], ["arm", "Oberarm"], ["thigh", "Oberschenkel"]];
  const addMeasurement = () => {
    const values = Object.fromEntries(Object.entries(mVals).filter(([, v]) => v !== ""));
    if (Object.keys(values).length === 0) return;
    setMeasurements([...(measurements || []).filter((m) => m.date !== mDate), { id: uid(), date: mDate, values }]);
    flash("Körpermaße gespeichert");
    setMVals({ waist: "", hip: "", chest: "", arm: "", thigh: "" });
  };
  const removeMeasurement = (id) => setMeasurements((measurements || []).filter((m) => m.id !== id));
  const sortedMeasurements = [...(measurements || [])].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="ptlog-section">
      <h2>Gewicht</h2>
      {!readOnly && (
      <div className="ptlog-card">
        <div className="ptlog-add-row">
          <Field label="Datum"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Gewicht (kg)"><input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} /></Field>
          <button className="ptlog-btn primary" onClick={add}>Eintragen</button>
        </div>
      </div>
      )}
      {chartData.length > 1 && (
        <div className="ptlog-card">
          <h3>Verlauf</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.border} vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke={COLORS.muted} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={COLORS.muted} fontSize={12} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ background: COLORS.surface2, border: "1px solid " + COLORS.border, borderRadius: 8, fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.text }} />
                {goal && <ReferenceLine y={goal} stroke={COLORS.warn} strokeDasharray="4 4" label={{ value: "Ziel", fill: COLORS.warn, fontSize: 11 }} />}
                <Line type="monotone" dataKey="weight" stroke={COLORS.accent} strokeWidth={2.5} dot={{ fill: COLORS.accent, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <div className="ptlog-card">
        <h3>Messungen</h3>
        {sorted.length === 0 ? (<p className="ptlog-muted">Noch keine Messung erfasst.</p>) : (
          <ul className="ptlog-entry-list">
            {[...sorted].reverse().map((w) => (<li key={w.id}><div><strong>{w.weight} kg</strong><span className="ptlog-muted"> · {fmtDate(w.date)}</span></div>{!readOnly && <button className="ptlog-btn-x" onClick={() => remove(w.id)} aria-label="Löschen"><X size={15} /></button>}</li>))}
          </ul>
        )}
      </div>

      <div className="ptlog-card">
        <div className="ptlog-card-header-row"><h3><Ruler size={15} style={{ verticalAlign: "-2px", marginRight: 4 }} />Körpermaße</h3></div>
        {!readOnly && (
          <>
            <div className="ptlog-grid-4">
              <Field label="Datum"><input type="date" value={mDate} onChange={(e) => setMDate(e.target.value)} /></Field>
              {MEASURE_FIELDS.map(([key, label]) => (
                <Field key={key} label={`${label} (cm)`}><input type="number" step="0.5" value={mVals[key]} onChange={(e) => setMVals({ ...mVals, [key]: e.target.value })} /></Field>
              ))}
            </div>
            <button className="ptlog-btn primary" onClick={addMeasurement} style={{ marginTop: 4 }}>Eintragen</button>
          </>
        )}
        {sortedMeasurements.length === 0 ? (
          <p className="ptlog-muted" style={{ marginTop: 10 }}>Noch keine Körpermaße erfasst.</p>
        ) : (
          <ul className="ptlog-entry-list" style={{ marginTop: 10 }}>
            {sortedMeasurements.map((m) => (
              <li key={m.id}>
                <div>
                  <strong>{fmtDate(m.date)}</strong>
                  <div className="ptlog-entry-macros">{MEASURE_FIELDS.filter(([key]) => m.values[key] !== undefined).map(([key, label]) => `${label}: ${m.values[key]} cm`).join(" · ")}</div>
                </div>
                {!readOnly && <button className="ptlog-btn-x" onClick={() => removeMeasurement(m.id)} aria-label="Löschen"><X size={15} /></button>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ================= Nachrichten ================= */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
async function enablePushNotifications(subscriberKey) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return { ok: false, reason: "unsupported" };
  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidKey) return { ok: false, reason: "not_configured" };
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return { ok: false, reason: "denied" };
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidKey) });
    await saveKey(subscriberKey, sub.toJSON());
    return { ok: true };
  } catch (e) {
    console.error("Push-Registrierung fehlgeschlagen:", e);
    return { ok: false, reason: "error" };
  }
}
async function sendPushNotify(targetKey, title, body) {
  try {
    await fetch(`${API_BASE}/push/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetKey: STORAGE_PREFIX + targetKey, title, body }),
    });
  } catch (e) {}
}

function MessagesView({ messages, setMessages, role, coacheeId, coacheeName }) {
  const [text, setText] = useState("");
  const [pushStatus, setPushStatus] = useState(null);
  const otherRole = role === "coach" ? "coachee" : "coach";

  const send = () => {
    if (!text.trim()) return;
    setMessages([...messages, { id: uid(), from: role, text: text.trim(), at: new Date().toISOString() }]);
    if (coacheeId) {
      sendPushNotify(
        `push-sub-${otherRole}-${coacheeId}`,
        role === "coach" ? "Neue Nachricht von deinem Coach" : `Neue Nachricht von ${coacheeName || "deinem Coachee"}`,
        text.trim()
      );
    }
    setText("");
  };

  const activatePush = async () => {
    if (!coacheeId) return;
    setPushStatus("…");
    const r = await enablePushNotifications(`push-sub-${role}-${coacheeId}`);
    setPushStatus(r.ok ? "Aktiviert — du bekommst jetzt Benachrichtigungen auf diesem Gerät." : r.reason === "denied" ? "Erlaubnis wurde nicht erteilt." : r.reason === "not_configured" ? "Push ist serverseitig noch nicht eingerichtet." : "Auf diesem Gerät/Browser nicht unterstützt.");
  };

  const sorted = [...messages].sort((a, b) => a.at.localeCompare(b.at));
  return (
    <div className="ptlog-section">
      <h2>Nachrichten{coacheeName ? ` mit ${coacheeName}` : ""}</h2>
      <div className="ptlog-card">
        <div className="ptlog-row-between" style={{ marginBottom: 10 }}>
          <span className="ptlog-muted" style={{ fontSize: 12 }}>Benachrichtigungen für neue Nachrichten auf diesem Gerät</span>
          <button className="ptlog-btn" type="button" onClick={activatePush}>🔔 Aktivieren</button>
        </div>
        {pushStatus && <p className="ptlog-muted" style={{ marginTop: -4 }}>{pushStatus}</p>}
        {sorted.length === 0 ? (
          <p className="ptlog-muted">Noch keine Nachrichten.</p>
        ) : (
          <div className="ptlog-chat">
            {sorted.map((m) => (
              <div key={m.id} className={"ptlog-chat-bubble" + (m.from === role ? " mine" : "")}>
                <div>{m.text}</div>
                <span className="ptlog-chat-meta">{m.from === "coach" ? "Coach" : "Coachee"} · {new Date(m.at).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            ))}
          </div>
        )}
        <div className="ptlog-add-row" style={{ marginTop: 12 }}>
          <Field label="Nachricht"><textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Nachricht schreiben…" /></Field>
          <button className="ptlog-btn primary" onClick={send} disabled={!text.trim()}>Senden</button>
        </div>
      </div>
    </div>
  );
}

/* ================= Trainingsplanung — Coach ================= */
function CoachTrainingView({ exercises, setExercises, plans, setPlans, profile, sessions, coachees, coacheeId, planHistory, onActivatePlan }) {
  const [sub, setSub] = useState("plans");
  return (
    <div className="ptlog-section">
      <h2>Trainingsplanung</h2>
      <div className="ptlog-mode-tabs">
        <button className={"ptlog-mode-btn" + (sub === "plans" ? " active" : "")} onClick={() => setSub("plans")}>Pläne</button>
        <button className={"ptlog-mode-btn" + (sub === "history" ? " active" : "")} onClick={() => setSub("history")}>Verlauf</button>
        <button className={"ptlog-mode-btn" + (sub === "library" ? " active" : "")} onClick={() => setSub("library")}>Übungen</button>
        <button className={"ptlog-mode-btn" + (sub === "calendar" ? " active" : "")} onClick={() => setSub("calendar")}>Kalender</button>
      </div>
      <div className="ptlog-card">
        {sub === "plans" && <PlanManager plans={plans} setPlans={setPlans} exercises={exercises} onActivate={onActivatePlan} coacheeName={coachees.find((c) => c.id === coacheeId)?.name} />}
        {sub === "history" && <SessionHistoryList sessions={sessions} exercises={exercises} />}
        {sub === "library" && <ExerciseLibraryManager exercises={exercises} setExercises={setExercises} />}
        {sub === "calendar" && <CoachCalendar sessions={sessions} exercises={exercises} profile={profile} plans={plans} planHistory={planHistory} />}
      </div>
    </div>
  );
}

const MAIN_MUSCLE_CATEGORIES = ["Beine", "Rücken", "Brust", "Schultern", "Arme", "Bauch/Rumpf"];

function CoachCalendar({ sessions, exercises, profile, plans, planHistory }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);

  const suggestions = useMemo(() => computeCoachSuggestions(profile, sessions, exercises), [profile, sessions, exercises]);
  const activePlan = plans.find((p) => p.active) || null;

  const base = new Date();
  base.setDate(1);
  base.setMonth(base.getMonth() + monthOffset);
  const year = base.getFullYear(), month = base.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = base.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const isoFor = (d) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const today = todayISO();

  const sessionsByDate = useMemo(() => {
    const map = {};
    sessions.forEach((s) => { (map[s.date] = map[s.date] || []).push(s); });
    return map;
  }, [sessions]);

  const dayStatus = (iso) => {
    const planId = planIdActiveOn(planHistory, plans, iso);
    const planForDay = plans.find((p) => p.id === planId);
    if (!planForDay) return null;
    const weekdayIdx = (new Date(iso + "T00:00:00").getDay() + 6) % 7;
    const planDay = planForDay.days.find((d) => d.weekday === weekdayIdx);
    if (!planDay) return null;
    const actual = sessionsByDate[iso] || [];
    if (planDay.isRestDay) return actual.length > 0 ? { type: "extra", planDay } : { type: "restday", planDay };
    if (actual.length > 0) {
      const matched = actual.some((s) => s.planDayId === planDay.id);
      return matched ? { type: "matched", planDay } : { type: "deviated", planDay };
    }
    const doneElsewhere = sessions.some((s) => s.planDayId === planDay.id);
    if (doneElsewhere) return { type: "caughtup", planDay };
    return iso < today ? { type: "missed", planDay } : { type: "upcoming", planDay };
  };

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const categoriesForWeek = (week) => {
    const isos = week.filter((d) => d !== null).map(isoFor);
    const trained = new Set();
    isos.forEach((iso) => (sessionsByDate[iso] || []).forEach((s) => s.entries.forEach((e) => {
      const ex = exercises.find((x) => x.id === e.exerciseId);
      if (ex) trained.add(ex.category);
    })));
    return trained;
  };

  const nextEvent = useMemo(() => nextUpcomingEvent(profile), [profile]);
  const eventsByDate = useMemo(() => {
    const map = {};
    (profile?.targetEvents || []).forEach((ev) => { (map[ev.date] = map[ev.date] || []).push(ev); });
    return map;
  }, [profile]);

  return (
    <div>
      {nextEvent && (
        <div className="ptlog-event-banner">🏁 Nächstes Ziel: {nextEvent.title} am {fmtDate(nextEvent.date)} (in {daysUntil(nextEvent.date)} Tagen)</div>
      )}
      {suggestions.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3>Hinweise für die kommende Woche</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {suggestions.map((s, i) => (<div key={i} className={"ptlog-suggestion tone-" + s.tone}>{s.text}</div>))}
          </div>
        </div>
      )}

      <div className="ptlog-row-between" style={{ marginBottom: 10 }}>
        <button className="ptlog-btn" onClick={() => { setMonthOffset((m) => m - 1); setSelectedDate(null); }}><ChevronLeft size={14} /></button>
        <strong style={{ fontFamily: "'Sora',sans-serif" }}>{monthLabel}</strong>
        <button className="ptlog-btn" onClick={() => { setMonthOffset((m) => m + 1); setSelectedDate(null); }}>weiter</button>
      </div>

      {!activePlan && <p className="ptlog-muted" style={{ marginBottom: 10 }}>Kein aktiver Plan — der Kalender zeigt nur die tatsächlichen Einheiten, ohne Plan-Abgleich.</p>}

      <div className="ptlog-cal-weekdays">{["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => <span key={d}>{d}</span>)}</div>

      {weeks.map((week, wi) => (
        <div key={wi}>
          <div className="ptlog-cal-grid">
            {week.map((d, i) => {
              if (!d) return <div key={i} className="ptlog-cal-cell empty" />;
              const iso = isoFor(d);
              const daySessions = sessionsByDate[iso] || [];
              const status = dayStatus(iso);
              const statusClass = status ? " status-" + status.type : "";
              const dayEvents = eventsByDate[iso] || [];
              return (
                <button key={i} type="button" className={"ptlog-cal-cell" + statusClass + (daySessions.length ? " has-session" : "") + (iso === today ? " is-today" : "") + (selectedDate === iso ? " selected" : "")} onClick={() => setSelectedDate(iso === selectedDate ? null : iso)}>
                  <span>{d}</span>
                  {dayEvents.length > 0 && <span className="ptlog-cal-flag">🏁</span>}
                  {daySessions.length > 0 && <span className="ptlog-cal-dot" />}
                </button>
              );
            })}
          </div>
          <div className="ptlog-week-chips">
            {(() => {
              const trained = categoriesForWeek(week);
              return MAIN_MUSCLE_CATEGORIES.map((c) => (<span key={c} className={"ptlog-week-chip" + (trained.has(c) ? " lit" : "")}>{c}</span>));
            })()}
          </div>
        </div>
      ))}

      {activePlan && (
        <div className="ptlog-cal-legend">
          <span><span className="ptlog-cal-dot" style={{ background: COLORS.good }} /> wie geplant</span>
          <span><span className="ptlog-cal-dot" style={{ background: COLORS.accent }} /> abgewichen</span>
          <span><span className="ptlog-cal-dot" style={{ background: "#5EA8E0" }} /> nachgeholt</span>
          <span><span className="ptlog-cal-dot" style={{ background: COLORS.warn }} /> verpasst</span>
        </div>
      )}

      {selectedDate && (
        <div className="ptlog-block-card" style={{ marginTop: 14 }}>
          <h4 style={{ marginTop: 0 }}>{formatLongDate(selectedDate)}</h4>
          {(eventsByDate[selectedDate] || []).map((ev) => (<p key={ev.id} className="ptlog-event-line">🏁 {ev.title}</p>))}
          {(() => {
            const status = dayStatus(selectedDate);
            if (status?.planDay) {
              const label = { matched: "wie geplant absolviert", deviated: "abweichend vom Plan", missed: "verpasst", caughtup: "an anderem Tag nachgeholt", extra: "zusätzlich zum Ruhetag trainiert", restday: "Ruhetag laut Plan", upcoming: "noch bevorstehend" }[status.type];
              return (<p className="ptlog-muted" style={{ marginTop: -6 }}>Laut Plan: {status.planDay.isRestDay ? "Ruhetag" : (status.planDay.sessionName || "Training")} — {label}</p>);
            }
            return null;
          })()}
          {(sessionsByDate[selectedDate] || []).length === 0 ? (
            <p className="ptlog-muted">Keine Trainingseinheit an diesem Tag.</p>
          ) : (
            (sessionsByDate[selectedDate] || []).map((s) => (
              <div key={s.id} style={{ marginBottom: 10 }}>
                <strong>{s.workoutName}</strong>
                <div className="ptlog-entry-macros">{formatDuration(s.durationSeconds)} · {formatVolume(s.volume || sessionVolume(s))}{s.prCount ? ` · ${s.prCount} PR` : ""}</div>
                <ul className="ptlog-entry-list">
                  {s.entries.map((e) => {
                    const ex = exercises.find((x) => x.id === e.exerciseId);
                    return (<li key={e.id}><div>{ex ? ex.name : "?"}</div><div className="ptlog-entry-macros">{e.sets.map(formatLoggedSet).join(" · ")}</div></li>);
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ExerciseLibraryManager({ exercises, setExercises }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const empty = { name: "", category: CATEGORY_OPTIONS[0], muscles: [], equipment: "Körpergewicht", instructions: "", images: [], goalTags: [] };
  const [f, setF] = useState(empty);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const startNew = () => { setF(empty); setEditingId(null); setShowForm(true); };
  const startEdit = (ex) => { setF({ category: CATEGORY_OPTIONS[0], ...ex }); setEditingId(ex.id); setShowForm(true); };
  const toggleMuscle = (m) => setF((prev) => ({ ...prev, muscles: prev.muscles.includes(m) ? prev.muscles.filter((x) => x !== m) : [...prev.muscles, m] }));
  const toggleGoalTag = (g) => setF((prev) => ({ ...prev, goalTags: prev.goalTags.includes(g) ? prev.goalTags.filter((x) => x !== g) : [...prev.goalTags, g] }));
  const addImageUrl = (url) => { if (!url) return; setF((prev) => ({ ...prev, images: [...prev.images, { id: uid(), src: url }] })); };
  const addImageFile = async (file) => {
    try { const dataUrl = await fileToDataUrl(file); setF((prev) => ({ ...prev, images: [...prev.images, { id: uid(), src: dataUrl }] })); }
    catch (e) { console.error(e); }
  };
  const removeImage = (id) => setF((prev) => ({ ...prev, images: prev.images.filter((i) => i.id !== id) }));

  const save = () => {
    if (!f.name.trim()) return;
    if (editingId) setExercises(exercises.map((e) => (e.id === editingId ? { ...f, id: editingId, baseline: e.baseline } : e)));
    else setExercises([...exercises, { ...f, id: uid(), baseline: null }]);
    setShowForm(false);
  };
  const remove = (id) => setExercises(exercises.filter((e) => e.id !== id));

  const missingSeedCount = SEED_EXERCISES.filter((s) => !exercises.some((e) => e.name.toLowerCase() === s.name.toLowerCase())).length;
  const importSeeds = () => {
    const toAdd = SEED_EXERCISES.filter((s) => !exercises.some((e) => e.name.toLowerCase() === s.name.toLowerCase())).map((s) => ({ ...s, id: uid() }));
    if (toAdd.length) setExercises([...exercises, ...toAdd]);
  };

  const filtered = exercises.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) && (!categoryFilter || e.category === categoryFilter));

  return (
    <div>
      {!showForm ? (
        <>
          {missingSeedCount > 0 && (
            <button className="ptlog-btn wide" style={{ marginBottom: 12 }} onClick={importSeeds}>
              {missingSeedCount} Standardübungen importieren (Namen &amp; Kategorien, ohne Bilder/Werte)
            </button>
          )}
          <div className="ptlog-row-between" style={{ marginBottom: 12, gap: 8 }}>
            <input placeholder="Übung suchen…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1 }} />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ maxWidth: 140 }}>
              <option value="">Alle Kategorien</option>
              {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button className="ptlog-btn primary wide" onClick={startNew} style={{ marginBottom: 12 }}><Plus size={14} /> Eigene Übung</button>
          {filtered.length === 0 && <p className="ptlog-muted">Keine Übungen gefunden.</p>}
          <div className="ptlog-exercise-grid">
            {filtered.map((ex) => (
              <div key={ex.id} className="ptlog-exercise-card" onClick={() => startEdit(ex)}>
                <div className="ptlog-exercise-thumb">{ex.images?.[0] ? <img src={ex.images[0].src} alt="" /> : <Dumbbell size={20} />}</div>
                <div className="ptlog-exercise-info">
                  <strong>{ex.name}</strong>
                  <span className="ptlog-muted">{ex.category || "—"}</span>
                  {ex.baseline && <span className="ptlog-tag-mini">Ist-Stand erfasst</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div>
          <div className="ptlog-card-header-row"><h3>{editingId ? "Übung bearbeiten" : "Neue Übung"}</h3><button className="ptlog-btn" onClick={() => setShowForm(false)}><X size={14} /></button></div>
          <div className="ptlog-grid-2">
            <Field label="Name"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label="Kategorie"><select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}</select></Field>
            <Field label="Ausrüstung"><select value={f.equipment} onChange={(e) => setF({ ...f, equipment: e.target.value })}>{EQUIPMENT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}</select></Field>
          </div>
          <Field label="Zielmuskeln (optional, feiner als die Kategorie)"><div className="ptlog-tag-picker">{MUSCLE_GROUPS.map((m) => (<button type="button" key={m} className={"ptlog-tag-btn" + (f.muscles.includes(m) ? " active" : "")} onClick={() => toggleMuscle(m)}>{m}</button>))}</div></Field>
          <Field label="Passt besonders zu Ziel (optional)"><div className="ptlog-tag-picker">{[["abnehmen", "Abnehmen"], ["halten", "Halten"], ["aufbauen", "Aufbau"]].map(([k, l]) => (<button type="button" key={k} className={"ptlog-tag-btn" + (f.goalTags.includes(k) ? " active" : "")} onClick={() => toggleGoalTag(k)}>{l}</button>))}</div></Field>
          <Field label="Anleitung / Hinweise für den Coachee"><textarea rows={3} value={f.instructions} onChange={(e) => setF({ ...f, instructions: e.target.value })} /></Field>
          <Field label="Bilder">
            <div className="ptlog-image-row">
              {f.images.map((img) => (<div key={img.id} className="ptlog-image-thumb"><img src={img.src} alt="" /><button type="button" onClick={() => removeImage(img.id)}><X size={12} /></button></div>))}
              <label className="ptlog-image-upload"><Camera size={16} /><input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) addImageFile(e.target.files[0]); e.target.value = ""; }} /></label>
            </div>
            <ImageUrlInput onAdd={addImageUrl} />
          </Field>
          <div className="ptlog-add-row">
            <button className="ptlog-btn primary" onClick={save}>Speichern</button>
            {editingId && <button className="ptlog-btn" onClick={() => { remove(editingId); setShowForm(false); }} style={{ color: COLORS.warn }}>Löschen</button>}
          </div>
        </div>
      )}
    </div>
  );
}
function ImageUrlInput({ onAdd }) {
  const [url, setUrl] = useState("");
  return (<div className="ptlog-add-row" style={{ marginTop: 8 }}><input placeholder="Bild-URL einfügen…" value={url} onChange={(e) => setUrl(e.target.value)} style={{ flex: 1 }} /><button className="ptlog-btn" type="button" onClick={() => { onAdd(url); setUrl(""); }}>Hinzufügen</button></div>);
}

function ExercisePicker({ exercises, profile, onPick, placeholder }) {
  const [q, setQ] = useState("");
  const matches = useMemo(() => {
    if (!q.trim()) return [];
    const query = q.toLowerCase();
    let list = exercises.filter((e) => e.name.toLowerCase().includes(query));
    if (profile?.goalType) list = [...list].sort((a, b) => (b.goalTags?.includes(profile.goalType) ? 1 : 0) - (a.goalTags?.includes(profile.goalType) ? 1 : 0));
    return list.slice(0, 6);
  }, [q, exercises, profile]);
  return (
    <div className="ptlog-food-search" style={{ marginTop: 8 }}>
      <input placeholder={placeholder || "Übung suchen…"} value={q} onChange={(e) => setQ(e.target.value)} />
      {matches.length > 0 && (
        <ul className="ptlog-suggest-list">
          {matches.map((m) => (
            <li key={m.id} onClick={() => { onPick(m.id); setQ(""); }}>
              <span>{m.name}{profile?.goalType && m.goalTags?.includes(profile.goalType) && <span className="ptlog-tag-mini" style={{ marginLeft: 6 }}>passt zum Ziel</span>}</span>
              <span className="ptlog-suggest-sub">{m.muscles?.length ? m.muscles.slice(0, 2).join(", ") : m.category || ""}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* Übung per echtem Dropdown auswählen (statt Suchliste) — gruppiert nach Kategorie */
function ExerciseSelect({ exercises, onPick, placeholder }) {
  const grouped = useMemo(() => {
    const map = {};
    [...exercises].sort((a, b) => a.name.localeCompare(b.name)).forEach((e) => {
      const cat = e.category || "Sonstiges";
      (map[cat] = map[cat] || []).push(e);
    });
    return map;
  }, [exercises]);
  return (
    <select
      value=""
      onChange={(e) => { if (e.target.value) onPick(e.target.value); }}
      style={{ marginTop: 8 }}
    >
      <option value="">{placeholder || "Übung auswählen…"}</option>
      {Object.entries(grouped).map(([cat, list]) => (
        <optgroup key={cat} label={cat}>
          {list.map((e) => (<option key={e.id} value={e.id}>{e.name}</option>))}
        </optgroup>
      ))}
    </select>
  );
}

function SetRowsEditor({ sets, onChange, unit = "kg" }) {
  const update = (i, key, val) => { const next = [...sets]; next[i] = { ...next[i], [key]: val }; onChange(next); };
  const add = () => onChange([...sets, { reps: "", weight: "", distance: "", unit }]);
  const remove = (i) => onChange(sets.filter((_, idx) => idx !== i));
  const unitLabel = unit === "min" ? "Min" : "kg";
  return (
    <div className="ptlog-setrows">
      <div className="ptlog-setrow-header"><span>Satz</span><span>{unitLabel}</span><span>Wdh.</span><span>Strecke/Zeit</span><span></span></div>
      {sets.map((s, i) => (
        <div key={i} className="ptlog-setrow">
          <span className="ptlog-muted">{i + 1}</span>
          <input placeholder={unitLabel} type="number" value={s.weight} onChange={(e) => update(i, "weight", e.target.value)} />
          <input placeholder="Wdh." type="number" value={s.reps} onChange={(e) => update(i, "reps", e.target.value)} />
          <input placeholder="z. B. 2 km" value={s.distance} onChange={(e) => update(i, "distance", e.target.value)} />
          <button className="ptlog-btn-x" type="button" onClick={() => remove(i)} disabled={sets.length === 1}><X size={13} /></button>
        </div>
      ))}
      <button className="ptlog-btn" type="button" onClick={add}><Plus size={12} /> Satz</button>
    </div>
  );
}

const WEEKDAY_ABBR = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const WEEKDAY_FULL = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
function emptyPlanDays() {
  return WEEKDAY_FULL.map((name, idx) => ({
    id: uid(), weekday: idx, label: WEEKDAY_ABBR[idx].toLowerCase() + ".",
    isRestDay: true, sessionName: "", isBaseline: false, groups: [],
  }));
}

/* ================= Druckbare Planansicht ("PDF" via Browser-Druck) ================= */
function PrintablePlan({ plan, exercises, coacheeName }) {
  return (
    <div className="ptlog-print-only">
      <h1>{plan.name}</h1>
      {coacheeName && <p>Für: {coacheeName}</p>}
      {plan.days.map((d) => (
        <div key={d.id} className="ptlog-print-day">
          <h2>{WEEKDAY_FULL[d.weekday]}{d.isRestDay ? " · Ruhetag" : d.sessionName ? ` · ${d.sessionName}` : ""}</h2>
          {!d.isRestDay && d.groups.map((g) => (
            <div key={g.id}>
              {isSuperset(g) && <p><strong>Super Set · {g.rounds} Runden</strong></p>}
              <ul>
                {g.items.map((item) => {
                  const ex = exercises.find((e) => e.id === item.exerciseId);
                  return (<li key={item.id}>{ex ? ex.name : "?"} — {summarizeItemTarget(item)}{item.note ? ` (${item.note})` : ""}</li>);
                })}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ================= Trainingspläne — direkt mit Inhalt pro Tag (Coach) ================= */
function PlanManager({ plans, setPlans, exercises, profile, onActivate, coacheeName }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedDayId, setExpandedDayId] = useState(null);
  const [printPlan, setPrintPlan] = useState(null);
  const [schedulingId, setSchedulingId] = useState(null);
  const [scheduleDate, setScheduleDate] = useState(todayISO());
  const [f, setF] = useState({ name: "", days: emptyPlanDays() });

  const startNew = () => { setF({ name: "", days: emptyPlanDays() }); setEditingId(null); setShowForm(true); setExpandedDayId(null); };
  const startEdit = (p) => { setF({ ...p }); setEditingId(p.id); setShowForm(true); setExpandedDayId(null); };
  const duplicatePlan = (p) => { setF({ ...p, name: p.name + " (Kopie)" }); setEditingId(null); setShowForm(true); setExpandedDayId(null); };

  const updateDay = (dayId, updater) => setF((prev) => ({ ...prev, days: prev.days.map((d) => (d.id === dayId ? updater(d) : d)) }));
  const toggleRestDay = (dayId) => updateDay(dayId, (d) => ({ ...d, isRestDay: !d.isRestDay }));
  const setDayField = (dayId, key, val) => updateDay(dayId, (d) => ({ ...d, [key]: val }));
  const addBlock = (dayId, type) => updateDay(dayId, (d) => ({ ...d, groups: [...d.groups, { id: uid(), type, purpose: "training", rounds: 1, items: [] }] }));
  const removeBlock = (dayId, gid) => updateDay(dayId, (d) => ({ ...d, groups: d.groups.filter((g) => g.id !== gid) }));
  const updateBlockRounds = (dayId, gid, rounds) => updateDay(dayId, (d) => ({ ...d, groups: d.groups.map((g) => (g.id === gid ? { ...g, rounds } : g)) }));
  const updateBlockPurpose = (dayId, gid, purpose) => updateDay(dayId, (d) => ({ ...d, groups: d.groups.map((g) => (g.id === gid ? { ...g, purpose } : g)) }));
  const addItemToBlock = (dayId, gid, exerciseId) => updateDay(dayId, (d) => ({ ...d, groups: d.groups.map((g) => (g.id === gid ? { ...g, items: [...g.items, { id: uid(), exerciseId, restSeconds: 90, unit: "kg", note: "", sets: [{ reps: "", weight: "", distance: "", unit: "kg" }] }] } : g)) }));
  const removeItem = (dayId, gid, itemId) => updateDay(dayId, (d) => ({ ...d, groups: d.groups.map((g) => (g.id === gid ? { ...g, items: g.items.filter((i) => i.id !== itemId) } : g)) }));
  const updateItemSets = (dayId, gid, itemId, sets) => updateDay(dayId, (d) => ({ ...d, groups: d.groups.map((g) => (g.id === gid ? { ...g, items: g.items.map((i) => (i.id === itemId ? { ...i, sets } : i)) } : g)) }));
  const updateItemRest = (dayId, gid, itemId, restSeconds) => updateDay(dayId, (d) => ({ ...d, groups: d.groups.map((g) => (g.id === gid ? { ...g, items: g.items.map((i) => (i.id === itemId ? { ...i, restSeconds } : i)) } : g)) }));
  const updateItemUnit = (dayId, gid, itemId, unit) => updateDay(dayId, (d) => ({ ...d, groups: d.groups.map((g) => (g.id === gid ? { ...g, items: g.items.map((i) => (i.id === itemId ? { ...i, unit, sets: i.sets.map((s) => ({ ...s, unit })) } : i)) } : g)) }));
  const updateItemNote = (dayId, gid, itemId, note) => updateDay(dayId, (d) => ({ ...d, groups: d.groups.map((g) => (g.id === gid ? { ...g, items: g.items.map((i) => (i.id === itemId ? { ...i, note } : i)) } : g)) }));

  const save = () => {
    if (!f.name.trim()) return;
    if (editingId) setPlans(plans.map((p) => (p.id === editingId ? { ...f, id: editingId, active: p.active } : p)));
    else setPlans([...plans, { ...f, id: uid(), active: plans.length === 0 }]);
    setShowForm(false);
  };
  const remove = (id) => setPlans(plans.filter((p) => p.id !== id));
  const activate = (id) => { setPlans(plans.map((p) => ({ ...p, active: p.id === id, scheduledActivationDate: p.id === id ? null : p.scheduledActivationDate }))); onActivate && onActivate(id); };
  const setSchedule = (id, date) => setPlans(plans.map((p) => (p.id === id ? { ...p, scheduledActivationDate: date } : p)));
  const clearSchedule = (id) => setPlans(plans.map((p) => (p.id === id ? { ...p, scheduledActivationDate: null } : p)));
  const triggerPrint = (p) => { setPrintPlan(p); setTimeout(() => window.print(), 80); };
  const dayExerciseCount = (d) => d.groups.reduce((s, g) => s + g.items.length, 0);
  const daySetCount = (d) => dayGroupsSetCount(d.groups);

  return (
    <div>
      {printPlan && <PrintablePlan plan={printPlan} exercises={exercises} coacheeName={coacheeName} />}
      {!showForm ? (
        <>
          <div className="ptlog-row-between" style={{ marginBottom: 12 }}><h3 style={{ margin: 0 }}>Trainingspläne</h3><button className="ptlog-btn primary" onClick={startNew}><Plus size={14} /> Plan</button></div>
          {plans.length === 0 && <p className="ptlog-muted">Noch kein Plan angelegt.</p>}
          <ul className="ptlog-entry-list">
            {plans.map((p) => (
              <li key={p.id} style={{ flexWrap: "wrap" }}>
                <div onClick={() => startEdit(p)} style={{ cursor: "pointer" }}>
                  <strong>{p.name}</strong>{p.active && <span className="ptlog-tag-mini good">aktiv</span>}
                  <div className="ptlog-entry-macros">{(p.days || []).filter((d) => !d.isRestDay).length} Trainingstage/Woche</div>
                  {p.scheduledActivationDate && <div className="ptlog-schedule-badge">🕒 aktiviert sich automatisch am {fmtDate(p.scheduledActivationDate)}</div>}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <button className="ptlog-btn-x" onClick={() => duplicatePlan(p)} aria-label="Duplizieren"><Copy size={15} /></button>
                  <button className="ptlog-btn-x" onClick={() => triggerPrint(p)} aria-label="Drucken / als PDF speichern"><Printer size={15} /></button>
                  <button className="ptlog-btn-x" onClick={() => { if (window.confirm(`Plan "${p.name}" wirklich löschen?`)) remove(p.id); }} aria-label="Löschen" style={{ color: COLORS.warn }}><Trash2 size={15} /></button>
                  {!p.active && p.scheduledActivationDate && (
                    <button className="ptlog-btn-x" onClick={() => clearSchedule(p.id)} aria-label="Geplante Aktivierung aufheben"><X size={15} /></button>
                  )}
                  {!p.active && !p.scheduledActivationDate && schedulingId !== p.id && (
                    <button className="ptlog-btn-x" onClick={() => { setSchedulingId(p.id); setScheduleDate(todayISO()); }} aria-label="Aktivierung planen"><Clock size={15} /></button>
                  )}
                  {!p.active && schedulingId === p.id && (
                    <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} style={{ width: 140 }} />
                      <button className="ptlog-btn" onClick={() => { setSchedule(p.id, scheduleDate); setSchedulingId(null); }}>Planen</button>
                      <button className="ptlog-btn-x" onClick={() => setSchedulingId(null)}><X size={13} /></button>
                    </span>
                  )}
                  {!p.active && <button className="ptlog-btn" onClick={() => activate(p.id)}>jetzt aktivieren</button>}
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div>
          <div className="ptlog-card-header-row"><h3>{editingId ? "Plan bearbeiten" : "Neuer Plan"}</h3><button className="ptlog-btn" onClick={() => setShowForm(false)}><X size={14} /></button></div>
          <Field label="Name des Plans"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="z. B. Aufbauphase September" /></Field>
          {profile && <p className="ptlog-goal-banner">Ziel des Coachees: <strong>{GOAL_LABELS[profile.goalType] || profile.goalType}</strong>{profile.goals ? ` — ${profile.goals}` : ""}</p>}
          <p className="ptlog-muted" style={{ marginTop: -6, marginBottom: 10 }}>Für jeden Tag festlegen, was zu tun ist, oder als Ruhetag lassen. Für eine neue Woche einen bestehenden Plan über <Copy size={11} style={{ verticalAlign: "-1px" }} /> duplizieren statt neu aufzubauen.</p>

          {f.days.map((d) => {
            const exCount = dayExerciseCount(d);
            const setCount = daySetCount(d);
            const expanded = expandedDayId === d.id;
            return (
              <div key={d.id} className="ptlog-day-card">
                <div className="ptlog-day-card-header" onClick={() => setExpandedDayId(expanded ? null : d.id)}>
                  <div>
                    <strong>{WEEKDAY_FULL[d.weekday]}</strong>
                    <div className="ptlog-entry-macros">{d.isRestDay ? "Ruhetag" : `${d.sessionName || "Training"} · ${exCount} Übung${exCount !== 1 ? "en" : ""} · ${setCount} Satz${setCount !== 1 ? "e" : ""}`}</div>
                  </div>
                  <ChevronDown size={16} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform .15s", flexShrink: 0 }} />
                </div>
                {expanded && (
                  <div className="ptlog-day-card-body">
                    <label className="ptlog-checkbox" style={{ marginBottom: 10 }}>
                      <input type="checkbox" checked={d.isRestDay} onChange={() => toggleRestDay(d.id)} /> Ruhetag
                    </label>
                    {!d.isRestDay && (
                      <>
                        <div className="ptlog-grid-2">
                          <Field label="Bezeichnung (z. B. Brusttraining, Laufen)"><input value={d.sessionName} onChange={(e) => setDayField(d.id, "sessionName", e.target.value)} /></Field>
                          <label className="ptlog-checkbox" style={{ alignSelf: "center" }}>
                            <input type="checkbox" checked={d.isBaseline} onChange={(e) => setDayField(d.id, "isBaseline", e.target.checked)} /> Ist-Stand-Test
                          </label>
                        </div>

                        {d.groups.map((g, gi) => {
                          const superset = isSuperset(g);
                          return (
                            <div key={g.id} className="ptlog-block-card">
                              <div className="ptlog-row-between">
                                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                  <strong>{superset ? "Super Set" : "Übung"} {gi + 1}</strong>
                                  <select value={g.purpose || "training"} onChange={(e) => updateBlockPurpose(d.id, g.id, e.target.value)} style={{ width: "auto", fontSize: 12, padding: "4px 8px" }}>
                                    {WORKOUT_TYPES.map(([k, l]) => (<option key={k} value={k}>{l}</option>))}
                                  </select>
                                </div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                  {superset && <input type="number" min="1" value={g.rounds} onChange={(e) => updateBlockRounds(d.id, g.id, e.target.value)} style={{ width: 56 }} />}
                                  {superset && <span className="ptlog-muted" style={{ fontSize: 12 }}>Runden</span>}
                                  <button className="ptlog-btn-x" onClick={() => removeBlock(d.id, g.id)}><X size={14} /></button>
                                </div>
                              </div>
                              {g.items.map((item, ii) => {
                                const ex = exercises.find((e) => e.id === item.exerciseId);
                                return (
                                  <div key={item.id} className="ptlog-block-item">
                                    <div className="ptlog-row-between">
                                      <span>{superset ? String.fromCharCode(65 + ii) + " · " : ""}{ex ? ex.name : "?"}</span>
                                      <button className="ptlog-btn-x" onClick={() => removeItem(d.id, g.id, item.id)}><X size={13} /></button>
                                    </div>
                                    <div className="ptlog-mode-tabs" style={{ margin: "4px 0" }}>
                                      <button type="button" className={"ptlog-mode-btn" + ((item.unit || "kg") === "kg" ? " active" : "")} onClick={() => updateItemUnit(d.id, g.id, item.id, "kg")}>kg</button>
                                      <button type="button" className={"ptlog-mode-btn" + (item.unit === "min" ? " active" : "")} onClick={() => updateItemUnit(d.id, g.id, item.id, "min")}>Minuten</button>
                                    </div>
                                    <SetRowsEditor sets={item.sets} unit={item.unit || "kg"} onChange={(sets) => updateItemSets(d.id, g.id, item.id, sets)} />
                                    <div className="ptlog-field" style={{ marginTop: 6 }}>
                                      <span>Notiz für den Coachee (z. B. Ausführungshinweis)</span>
                                      <textarea rows={2} value={item.note || ""} onChange={(e) => updateItemNote(d.id, g.id, item.id, e.target.value)} placeholder="z. B. locker traben, auf saubere Technik achten…" />
                                    </div>
                                    <div className="ptlog-field" style={{ marginTop: 6, maxWidth: 160 }}>
                                      <span>Pause zwischen Sätzen (Sek.)</span>
                                      <input type="number" min="0" step="15" value={item.restSeconds ?? 90} onChange={(e) => updateItemRest(d.id, g.id, item.id, Number(e.target.value))} />
                                    </div>
                                  </div>
                                );
                              })}
                              {(superset || g.items.length === 0) && (
                                <ExerciseSelect exercises={exercises} onPick={(exId) => addItemToBlock(d.id, g.id, exId)} placeholder="Übung auswählen…" />
                              )}
                            </div>
                          );
                        })}
                        <div className="ptlog-add-row">
                          <button className="ptlog-btn" type="button" onClick={() => addBlock(d.id, "normal")}><Plus size={13} /> Übung</button>
                          <button className="ptlog-btn" type="button" onClick={() => addBlock(d.id, "superset")}><Plus size={13} /> Supersatz</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="ptlog-add-row">
            <button className="ptlog-btn primary" onClick={save}>Plan speichern</button>
            {editingId && <button className="ptlog-btn" onClick={() => { if (window.confirm(`Plan "${f.name}" wirklich löschen?`)) { remove(editingId); setShowForm(false); } }} style={{ color: COLORS.warn }}>Löschen</button>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= Trainingsplanung — Coachee (Ausführung) ================= */
function CoacheeTrainingView({ plans, exercises, sessions, setSessions, setExercises, flash }) {
  const [homeTab, setHomeTab] = useState("plan"); // plan | start | history
  const [view, setView] = useState("home"); // home | day | session
  const [activeDay, setActiveDay] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [modalExerciseId, setModalExerciseId] = useState(null);
  const [restTimer, setRestTimer] = useState(null); // {entryId, remaining, total}
  const [pendingFeedback, setPendingFeedback] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [nowTick, setNowTick] = useState(Date.now());
  const activePlan = plans.find((p) => p.active);

  useEffect(() => {
    if (view !== "session") return;
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, [view]);

  useEffect(() => {
    if (!restTimer || restTimer.remaining <= 0) return;
    const t = setTimeout(() => setRestTimer((prev) => (prev ? { ...prev, remaining: prev.remaining - 1 } : null)), 1000);
    return () => clearTimeout(t);
  }, [restTimer]);

  const startDaySession = (day) => {
    const session = {
      id: uid(), planDayId: day.id, workoutName: day.sessionName || WEEKDAY_FULL[day.weekday], planId: activePlan?.id || null,
      isBaseline: !!day.isBaseline, date: todayISO(), startedAt: new Date().toISOString(),
      entries: day.groups.flatMap((g) => g.items.map((item) => ({
        id: uid(), exerciseId: item.exerciseId, groupId: g.id, restSeconds: item.restSeconds ?? 90, coachNote: item.note || "",
        sets: expandItemSets(item, g).map((s) => ({ target: { ...s }, reps: "", weight: "", distance: "", unit: item.unit || "kg", rpe: "", pain: false, done: false })),
        clientNote: "",
      }))),
    };
    setActiveSession(session);
    setView("session");
  };
  const startEmptyWorkout = () => {
    setActiveSession({ id: uid(), planDayId: null, workoutName: "Freies Workout", planId: null, isBaseline: false, date: todayISO(), startedAt: new Date().toISOString(), entries: [] });
    setView("session");
  };
  const addAdHocExercise = (exerciseId) => {
    setActiveSession((prev) => ({ ...prev, entries: [...prev.entries, { id: uid(), exerciseId, restSeconds: 90, unit: "kg", sets: [{ target: { unit: "kg" }, reps: "", weight: "", distance: "", unit: "kg", rpe: "", pain: false, done: false }], clientNote: "" }] }));
  };
  const setEntryUnit = (entryId, unit) => setActiveSession((prev) => ({ ...prev, entries: prev.entries.map((e) => (e.id === entryId ? { ...e, unit, sets: e.sets.map((s) => ({ ...s, unit, target: { ...s.target, unit } })) } : e)) }));
  const addSetToEntry = (entryId) => setActiveSession((prev) => ({ ...prev, entries: prev.entries.map((e) => (e.id === entryId ? { ...e, sets: [...e.sets, { target: { unit: e.unit || "kg" }, reps: "", weight: "", distance: "", unit: e.unit || "kg", rpe: "", pain: false, done: false }] } : e)) }));
  const updateEntrySet = (entryId, setIdx, key, val) => setActiveSession((prev) => ({ ...prev, entries: prev.entries.map((e) => (e.id === entryId ? { ...e, sets: e.sets.map((s, i) => (i === setIdx ? { ...s, [key]: val } : s)) } : e)) }));
  const toggleSetDone = (entryId, setIdx) => {
    setActiveSession((prev) => {
      const entry = prev.entries.find((e) => e.id === entryId);
      const wasDone = entry.sets[setIdx].done;
      if (!wasDone) setRestTimer({ entryId, setIdx, remaining: entry.restSeconds || 90, total: entry.restSeconds || 90 });
      return { ...prev, entries: prev.entries.map((e) => (e.id === entryId ? { ...e, sets: e.sets.map((s, i) => (i === setIdx ? { ...s, done: !s.done } : s)) } : e)) };
    });
  };
  const updateEntryNote = (entryId, note) => setActiveSession((prev) => ({ ...prev, entries: prev.entries.map((e) => (e.id === entryId ? { ...e, clientNote: note } : e)) }));

  const finishSession = () => {
    const finishedAt = new Date().toISOString();
    const durationSeconds = Math.round((new Date(finishedAt) - new Date(activeSession.startedAt)) / 1000);
    const volume = sessionVolume(activeSession);
    let prCount = 0;
    activeSession.entries.forEach((e) => {
      const prevMax = previousMaxWeight(sessions, e.exerciseId);
      const newMax = Math.max(0, ...e.sets.map((s) => Number(s.weight) || 0));
      if (newMax > 0 && newMax > prevMax) prCount += 1;
    });
    const finalSession = { ...activeSession, finishedAt, durationSeconds, volume, prCount };
    if (activeSession.isBaseline) {
      setExercises(exercises.map((ex) => {
        const entry = activeSession.entries.find((e) => e.exerciseId === ex.id);
        if (!entry) return ex;
        return { ...ex, baseline: { date: activeSession.date, sets: entry.sets.map((s) => ({ reps: s.reps, weight: s.weight, distance: s.distance })) } };
      }));
    }
    setPendingFeedback(finalSession);
    setFeedbackRating(0);
    setFeedbackComment("");
    setView("feedback");
  };

  const submitFeedback = (skip) => {
    const withFeedback = skip ? pendingFeedback : { ...pendingFeedback, feedback: { rating: feedbackRating || null, comment: feedbackComment.trim() || null } };
    setSessions([...sessions, withFeedback]);
    flash("Trainingseinheit gespeichert");
    setPendingFeedback(null);
    setActiveSession(null);
    setRestTimer(null);
    setView("home");
  };

  if (view === "feedback" && pendingFeedback) {
    return (
      <div className="ptlog-section" style={{ paddingBottom: 70 }}>
        <h2>Wie war das Training?</h2>
        <p className="ptlog-muted" style={{ marginTop: -8 }}>{pendingFeedback.workoutName} · {formatDuration(pendingFeedback.durationSeconds)}</p>
        <div className="ptlog-card">
          <div className="ptlog-checkin-row">
            <span>Gefühl</span>
            <div className="ptlog-checkin-scale">
              {[1, 2, 3, 4, 5].map((n) => (<button key={n} type="button" className={"ptlog-checkin-dot" + (feedbackRating === n ? " active" : "")} onClick={() => setFeedbackRating(n)}>{n}</button>))}
            </div>
          </div>
          <Field label="Kommentar (optional)"><textarea rows={3} value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} placeholder="z. B. lief gut, Schulter hat gezwickt, war heute zäh…" /></Field>
        </div>
        <button className="ptlog-btn primary wide sticky-bottom" onClick={() => submitFeedback(false)}>Feedback speichern</button>
        <button className="ptlog-btn wide" style={{ marginTop: 8 }} onClick={() => submitFeedback(true)}>Ohne Feedback speichern</button>
      </div>
    );
  }

  if (view === "day" && activeDay) {
    const day = activeDay.day;
    const allMuscles = [...new Set(day.groups.flatMap((g) => g.items.map((i) => exercises.find((e) => e.id === i.exerciseId)).filter(Boolean).flatMap((e) => e.muscles)))];
    return (
      <div className="ptlog-section" style={{ paddingBottom: 70 }}>
        <button className="ptlog-btn" onClick={() => setView("home")} style={{ marginBottom: 10 }}><ChevronLeft size={14} /> zurück</button>
        <h2>{WEEKDAY_FULL[day.weekday]}{day.sessionName ? ` · ${day.sessionName}` : ""}</h2>
        {allMuscles.length > 0 && (<div className="ptlog-tag-picker" style={{ marginBottom: 14 }}>{allMuscles.map((m) => (<span key={m} className="ptlog-tag-static">{m}</span>))}</div>)}
        <div className="ptlog-block-card">
          {day.groups.map((g, gi) => (
            <div key={g.id} className={gi > 0 ? "ptlog-block-divider" : ""}>
              {isSuperset(g) && <div className="ptlog-muted" style={{ fontSize: 12, margin: "6px 0" }}>Super Set · {g.rounds} Runde{g.rounds != 1 ? "n" : ""}</div>}
              {g.items.map((item, ii) => {
                const ex = exercises.find((e) => e.id === item.exerciseId);
                return (
                  <div key={item.id} className="ptlog-exercise-row" onClick={() => setModalExerciseId(item.exerciseId)}>
                    <div className="ptlog-exercise-thumb small">{ex?.images?.[0] ? <img src={ex.images[0].src} alt="" /> : <Dumbbell size={16} />}</div>
                    <div className="ptlog-exercise-info">
                      <strong>{ex ? ex.name : "?"}</strong>
                      <span className="ptlog-muted">{summarizeItemTarget(item)}</span>
                      {item.note && <span className="ptlog-coach-note">📝 {item.note}</span>}
                    </div>
                    {isSuperset(g) && <span className="ptlog-letter-badge">{String.fromCharCode(65 + ii)}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <button className="ptlog-btn primary wide sticky-bottom" onClick={() => startDaySession(day)}>Trainingseinheit beginnen</button>
        {modalExerciseId && <ExerciseDetailModal exercise={exercises.find((e) => e.id === modalExerciseId)} sessions={sessions} onClose={() => setModalExerciseId(null)} />}
      </div>
    );
  }

  if (view === "session" && activeSession) {
    const elapsed = Math.max(0, Math.round((nowTick - new Date(activeSession.startedAt).getTime()) / 1000));
    return (
      <div className="ptlog-section" style={{ paddingBottom: 70 }}>
        <div className="ptlog-row-between">
          <h2 style={{ marginBottom: 0 }}>{activeSession.workoutName}</h2>
          <span className="ptlog-chip neutral">{formatDuration(elapsed)}</span>
        </div>
        <p className="ptlog-muted">{fmtDate(activeSession.date)}</p>
        {activeSession.entries.map((entry) => {
          const ex = exercises.find((e) => e.id === entry.exerciseId);
          return (
            <div key={entry.id} className="ptlog-block-card">
              <div className="ptlog-exercise-row" style={{ padding: 0, marginBottom: 8, cursor: "pointer" }} onClick={() => setModalExerciseId(entry.exerciseId)}>
                <div className="ptlog-exercise-thumb small">{ex?.images?.[0] ? <img src={ex.images[0].src} alt="" /> : <Dumbbell size={16} />}</div>
                <strong>{ex ? ex.name : "?"}</strong>
              </div>
              {entry.coachNote && <div className="ptlog-coach-note-banner">📝 {entry.coachNote}</div>}
              {activeSession.planDayId === null && (
                <div className="ptlog-mode-tabs" style={{ margin: "0 0 6px" }}>
                  <button type="button" className={"ptlog-mode-btn" + ((entry.unit || "kg") === "kg" ? " active" : "")} onClick={() => setEntryUnit(entry.id, "kg")}>kg</button>
                  <button type="button" className={"ptlog-mode-btn" + (entry.unit === "min" ? " active" : "")} onClick={() => setEntryUnit(entry.id, "min")}>Minuten</button>
                </div>
              )}
              <div className="ptlog-settable-header">
                <span>Satz</span><span>Vorherige</span><span>{(entry.unit || entry.sets[0]?.target?.unit) === "min" ? "Min" : "kg"}</span><span>Wdh.</span><span></span>
              </div>
              {entry.sets.map((s, si) => {
                const prevRef = getPreviousSetRef(sessions, entry.exerciseId, activeSession.id, si);
                const unitLabel = (s.target.unit || entry.unit) === "min" ? "Min" : "kg";
                return (
                  <React.Fragment key={si}>
                    <div className={"ptlog-settable-row" + (s.done ? " done" : "")}>
                      <span className="ptlog-muted">{si + 1}</span>
                      <span className="ptlog-settable-prev">{prevRef || "—"}</span>
                      <input type="number" placeholder={s.target.weight || unitLabel} value={s.weight} onChange={(e) => updateEntrySet(entry.id, si, "weight", e.target.value)} />
                      <input type="number" placeholder={s.target.reps || "Wdh."} value={s.reps} onChange={(e) => updateEntrySet(entry.id, si, "reps", e.target.value)} />
                      <button type="button" className={"ptlog-check-btn" + (s.done ? " done" : "")} onClick={() => toggleSetDone(entry.id, si)}><Check size={14} /></button>
                    </div>
                    {s.target.distance || s.distance ? (
                      <input className="ptlog-settable-distance" placeholder={s.target.distance || "Strecke/Zeit"} value={s.distance} onChange={(e) => updateEntrySet(entry.id, si, "distance", e.target.value)} />
                    ) : null}
                    <div className="ptlog-log-setrow-extra">
                      <input type="number" min="1" max="10" placeholder="RPE" value={s.rpe} onChange={(e) => updateEntrySet(entry.id, si, "rpe", e.target.value)} />
                      <button type="button" className={"ptlog-pain-btn" + (s.pain ? " active" : "")} onClick={() => updateEntrySet(entry.id, si, "pain", !s.pain)}>⚠️ Schmerz</button>
                    </div>
                    {restTimer && restTimer.entryId === entry.id && restTimer.setIdx === si && restTimer.remaining > 0 && (
                      <div className="ptlog-rest-timer-inline">
                        <span className="ptlog-rest-line" />
                        <span>{Math.floor(restTimer.remaining / 60)}:{String(restTimer.remaining % 60).padStart(2, "0")}</span>
                        <span className="ptlog-rest-line" />
                        <button className="ptlog-btn-x" type="button" onClick={() => setRestTimer(null)} aria-label="Pause überspringen"><X size={13} /></button>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              <button className="ptlog-btn" type="button" onClick={() => addSetToEntry(entry.id)} style={{ marginTop: 6 }}><Plus size={12} /> Satz</button>
            </div>
          );
        })}
        {activeSession.planDayId === null && (
          <div className="ptlog-block-card">
            <ExercisePicker exercises={exercises} onPick={addAdHocExercise} placeholder="Übung hinzufügen…" />
          </div>
        )}
        <button className="ptlog-btn primary wide sticky-bottom" onClick={finishSession}>Einheit abschließen</button>
        {modalExerciseId && (
          <ExerciseDetailModal
            exercise={exercises.find((e) => e.id === modalExerciseId)}
            sessions={sessions}
            clientNote={activeSession.entries.find((e) => e.exerciseId === modalExerciseId)?.clientNote || ""}
            onNoteChange={(note) => { const entry = activeSession.entries.find((e) => e.exerciseId === modalExerciseId); if (entry) updateEntryNote(entry.id, note); }}
            onClose={() => setModalExerciseId(null)}
          />
        )}
      </div>
    );
  }

  // view === "home"
  return (
    <div className="ptlog-section">
      <h2>Training</h2>
      <div className="ptlog-mode-tabs">
        <button className={"ptlog-mode-btn" + (homeTab === "plan" ? " active" : "")} onClick={() => setHomeTab("plan")}>Plan</button>
        <button className={"ptlog-mode-btn" + (homeTab === "start" ? " active" : "")} onClick={() => setHomeTab("start")}>Workout beginnen</button>
        <button className={"ptlog-mode-btn" + (homeTab === "history" ? " active" : "")} onClick={() => setHomeTab("history")}>Verlauf</button>
      </div>

      {homeTab === "plan" && (
        !activePlan ? (
          <div className="ptlog-empty"><h2>Noch kein aktiver Plan</h2><p>Dein Coach hat noch keinen Trainingsplan aktiviert.</p></div>
        ) : (
          <>
            <p className="ptlog-muted" style={{ marginTop: -8, marginBottom: 14 }}>{activePlan.name} — Planübersicht</p>
            <ul className="ptlog-plan-days">
              {activePlan.days.map((d) => {
                const exCount = d.groups.reduce((s, g) => s + g.items.length, 0);
                const setCount = dayGroupsSetCount(d.groups);
                return (
                  <li key={d.id} className="ptlog-plan-day" onClick={() => { if (!d.isRestDay) { setActiveDay({ day: d }); setView("day"); } }} style={{ cursor: d.isRestDay ? "default" : "pointer" }}>
                    <div className="ptlog-plan-day-thumb"><Dumbbell size={18} /></div>
                    <div className="ptlog-plan-day-info"><strong>{d.label} {!d.isRestDay && (d.sessionName || "Training")}</strong><span className="ptlog-muted">{!d.isRestDay ? `${exCount} Übung${exCount !== 1 ? "en" : ""} · ${setCount} Satz${setCount !== 1 ? "e" : ""}` : "Ruhetag"}</span></div>
                  </li>
                );
              })}
            </ul>
          </>
        )
      )}

      {homeTab === "start" && (
        <>
          <button className="ptlog-btn primary wide" onClick={startEmptyWorkout} style={{ marginBottom: 16 }}>Ein leeres Workout beginnen</button>
          {!activePlan || activePlan.days.every((d) => d.isRestDay) ? (
            <p className="ptlog-muted">Dein Coach hat noch keine Trainingstage im aktiven Plan angelegt.</p>
          ) : (
            <>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, margin: "0 0 10px" }}>Tage aus deinem Plan</h3>
              <p className="ptlog-muted" style={{ marginTop: -6, marginBottom: 10 }}>Falls du z. B. den Mittwochs-Tag lieber am Donnerstag machst.</p>
              <div className="ptlog-template-grid">
                {activePlan.days.filter((d) => !d.isRestDay).map((d) => {
                  const exCount = d.groups.reduce((s, g) => s + g.items.length, 0);
                  const setCount = dayGroupsSetCount(d.groups);
                  const names = d.groups.flatMap((g) => g.items.map((i) => exercises.find((e) => e.id === i.exerciseId)?.name).filter(Boolean)).join(", ");
                  return (
                    <div key={d.id} className="ptlog-template-card" onClick={() => { setActiveDay({ day: d }); setView("day"); }}>
                      <strong>{d.label} {d.sessionName || "Training"}</strong>
                      <span className="ptlog-muted" style={{ fontSize: 12 }}>{exCount} Übung{exCount !== 1 ? "en" : ""} · {setCount} Satz{setCount !== 1 ? "e" : ""}</span>
                      <span className="ptlog-muted" style={{ fontSize: 12 }}>{names.slice(0, 60)}{names.length > 60 ? "…" : ""}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {homeTab === "history" && <SessionHistoryList sessions={sessions} exercises={exercises} />}
    </div>
  );
}

function SessionHistoryList({ sessions, exercises, limit }) {
  const sorted = [...sessions].sort((a, b) => (b.finishedAt || b.date).localeCompare(a.finishedAt || a.date));
  const list = limit ? sorted.slice(0, limit) : sorted;
  if (list.length === 0) return <p className="ptlog-muted">Noch keine Trainingseinheit abgeschlossen.</p>;
  return (
    <div>
      {list.map((s, i, arr) => {
        const showMonthHeader = i > 0 && monthLabel(s.date) !== monthLabel(arr[i - 1].date);
        return (
          <React.Fragment key={s.id}>
            {showMonthHeader && <div className="ptlog-history-group-label">{monthLabel(s.date)}</div>}
            <div className="ptlog-history-card">
              <strong>{s.workoutName}</strong>
              <span className="ptlog-muted">{formatLongDate(s.date)}</span>
              <div className="ptlog-history-stats">
                <span>{formatDuration(s.durationSeconds)}</span>
                <span>{formatVolume(s.volume || sessionVolume(s))}</span>
                <span>{s.prCount || 0} PRs</span>
              </div>
              <div className="ptlog-history-exercises">
                {s.entries.map((e) => {
                  const ex = exercises.find((x) => x.id === e.exerciseId);
                  return (<div key={e.id} className="ptlog-history-exercise-row"><span>{e.sets.length} × {ex ? ex.name : "?"}</span><span>{bestSetText(e)}</span></div>);
                })}
              </div>
              {s.feedback && (s.feedback.rating || s.feedback.comment) && (
                <div className="ptlog-history-feedback">
                  {s.feedback.rating && <span>Gefühl: {s.feedback.rating}/5</span>}
                  {s.feedback.comment && <span className="ptlog-muted">„{s.feedback.comment}"</span>}
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function ExerciseDetailModal({ exercise, sessions, clientNote, onNoteChange, onClose }) {
  const [tab, setTab] = useState("details");
  const [imgIndex, setImgIndex] = useState(0);
  if (!exercise) return null;

  const history = sessions.map((s) => {
    const entry = s.entries.find((e) => e.exerciseId === exercise.id);
    if (!entry) return null;
    const maxWeight = Math.max(0, ...entry.sets.map((x) => Number(x.weight) || 0));
    const maxReps = Math.max(0, ...entry.sets.map((x) => Number(x.reps) || 0));
    return { date: s.date, maxWeight, maxReps, sets: entry.sets };
  }).filter(Boolean).sort((a, b) => a.date.localeCompare(b.date));

  const hasWeightData = history.some((h) => h.maxWeight > 0);
  const chartData = history.map((h) => ({ date: fmtDate(h.date), value: hasWeightData ? h.maxWeight : h.maxReps }));

  return (
    <div className="ptlog-modal-overlay" onClick={onClose}>
      <div className="ptlog-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ptlog-modal-header">
          <div className="ptlog-mode-tabs">
            <button className={"ptlog-mode-btn" + (tab === "details" ? " active" : "")} onClick={() => setTab("details")}>Trainingsdetails</button>
            <button className={"ptlog-mode-btn" + (tab === "history" ? " active" : "")} onClick={() => setTab("history")}>Verlauf</button>
          </div>
          <button className="ptlog-btn-x" onClick={onClose}><X size={18} /></button>
        </div>
        <h2 style={{ marginTop: 10 }}>{exercise.name}</h2>

        {tab === "details" && (
          <div>
            {exercise.images?.length > 0 && (
              <div className="ptlog-modal-image">
                <img src={exercise.images[imgIndex].src} alt="" />
                {exercise.images.length > 1 && (<div className="ptlog-image-dots">{exercise.images.map((_, i) => (<span key={i} className={i === imgIndex ? "active" : ""} onClick={() => setImgIndex(i)} />))}</div>)}
              </div>
            )}
            <span className="ptlog-tag-static">{exercise.equipment}</span>
            {exercise.instructions && (<><h4>Notiz des Coaches</h4><p className="ptlog-goal-text">{exercise.instructions}</p></>)}
            {onNoteChange && (<><h4>Deine Notiz</h4><textarea rows={2} value={clientNote} onChange={(e) => onNoteChange(e.target.value)} placeholder="Schreibe eine Notiz, die nur du siehst." /></>)}
          </div>
        )}

        {tab === "history" && (
          <div>
            {exercise.baseline && (<p className="ptlog-muted">Ist-Stand ({fmtDate(exercise.baseline.date)}): {exercise.baseline.sets.map(formatSetTarget).join(" · ")}</p>)}
            {chartData.length > 1 ? (
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke={COLORS.border} vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke={COLORS.muted} fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke={COLORS.muted} fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: COLORS.surface2, border: "1px solid " + COLORS.border, borderRadius: 8, fontSize: 12, color: COLORS.text }} />
                    <Line type="monotone" dataKey="value" stroke={COLORS.accent} strokeWidth={2.5} dot={{ fill: COLORS.accent, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (<p className="ptlog-muted">Noch nicht genug Einträge für einen Verlauf.</p>)}
            <ul className="ptlog-entry-list">
              {[...history].reverse().map((h, i) => (<li key={i}><div><strong>{fmtDate(h.date)}</strong></div><div className="ptlog-entry-macros">{h.sets.map(formatLoggedSet).join(" · ")}</div></li>))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= Avatar ================= */
function AvatarDisplay({ emoji, skin, size }) {
  return (
    <div className="ptlog-avatar-display" style={{ width: size, height: size, background: skin.ring }}>
      <div className="ptlog-avatar-inner" style={{ fontSize: size * 0.5 }}>{emoji}</div>
      {skin.badge && <span className="ptlog-avatar-badge" style={{ fontSize: size * 0.22, width: size * 0.32, height: size * 0.32 }}>{skin.badge}</span>}
    </div>
  );
}

function AvatarTab({ profile, updateProfile, sessions, nutrition, weights, plans, exercises }) {
  if (!profile) return (<div className="ptlog-empty"><h2>Noch kein Profil</h2><p>Lege zuerst im Onboarding ein Profil an.</p></div>);
  const stats = computeStats(profile, sessions, nutrition, weights, plans, exercises);
  const unlockedSkinIds = new Set(["default", ...ACHIEVEMENTS.filter((a) => a.check(stats)).map((a) => a.skinId)]);
  const currentEmoji = profile.avatarEmoji || AVATAR_EMOJIS[0];
  const currentSkin = SKINS.find((s) => s.id === (profile.skinId || "default")) || SKINS[0];

  const setEmoji = (e) => updateProfile({ ...profile, avatarEmoji: e });
  const setSkin = (id) => { if (unlockedSkinIds.has(id)) updateProfile({ ...profile, skinId: id }); };

  return (
    <div className="ptlog-section">
      <h2>Avatar</h2>
      <div className="ptlog-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <AvatarDisplay emoji={currentEmoji} skin={currentSkin} size={96} />
        <strong>{profile.name}</strong>
        <span className="ptlog-muted">{unlockedSkinIds.size - 1} von {ACHIEVEMENTS.length} Erfolgen freigeschaltet</span>
        {stats.runningKm > 0 && <span className="ptlog-muted">{stats.runningKm.toLocaleString("de-DE", { maximumFractionDigits: 1 })} km gelaufen</span>}
      </div>

      <div className="ptlog-card">
        <h3>Emoji wählen</h3>
        <div className="ptlog-emoji-grid">
          {AVATAR_EMOJIS.map((e) => (
            <button key={e} type="button" className={"ptlog-emoji-btn" + (e === currentEmoji ? " active" : "")} onClick={() => setEmoji(e)}>{e}</button>
          ))}
        </div>
      </div>

      <div className="ptlog-card">
        <h3>Skins</h3>
        <div className="ptlog-skin-grid">
          {SKINS.map((skin) => {
            const unlocked = unlockedSkinIds.has(skin.id);
            return (
              <button key={skin.id} type="button" className={"ptlog-skin-card" + (skin.id === currentSkin.id ? " active" : "") + (unlocked ? "" : " locked")} onClick={() => setSkin(skin.id)} disabled={!unlocked}>
                <AvatarDisplay emoji={currentEmoji} skin={skin} size={48} />
                <span>{skin.name}</span>
                {!unlocked && <Lock size={12} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="ptlog-card">
        <h3>Erfolge</h3>
        <ul className="ptlog-entry-list">
          {ACHIEVEMENTS.map((a) => {
            const done = a.check(stats);
            return (
              <li key={a.id}>
                <div>
                  <strong>{done ? "✅ " : "🔒 "}{a.name}</strong>
                  <div className="ptlog-entry-macros">{a.desc}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ================= Styles ================= */
const CSS = `
.ptlog-print-only { display: none; }
@media print {
  body * { visibility: hidden; }
  .ptlog-print-only, .ptlog-print-only * { visibility: visible; }
  .ptlog-print-only { display: block; position: absolute; top: 0; left: 0; width: 100%; color: #000; background: #fff; padding: 20px; }
  .ptlog-print-day { margin-bottom: 18px; page-break-inside: avoid; }
  .ptlog-print-day h2 { font-size: 15px; margin: 0 0 4px; }
  .ptlog-print-only ul { margin: 4px 0 8px 18px; padding: 0; }
}
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

.ptlog-root {
  --bg: #101820; --surface: #182430; --surface2: #1F2E3B; --border: #2B3B48;
  --text: #EAF2F5; --muted: #8DA0AC; --accent: #FF8F5E; --good: #4ADE9E; --warn: #FF6B6B;
  font-family: 'Inter', sans-serif; color: var(--text); background: var(--bg);
  max-width: 720px; margin: 0 auto; padding: 18px 16px 40px; line-height: 1.5; border-radius: 18px;
}
.ptlog-root * { box-sizing: border-box; }

.ptlog-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
.ptlog-avatar { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, var(--accent), #FFB088); color: #1A1006; display: flex; align-items: center; justify-content: center; font-family: 'Sora', sans-serif; font-weight: 700; font-size: 17px; flex-shrink: 0; }
.ptlog-header-text { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.ptlog-eyebrow { font-size: 11px; color: var(--muted); }
.ptlog-header h1 { font-family: 'Sora', sans-serif; font-weight: 600; font-size: 21px; margin: 1px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ptlog-role-switch { display: flex; background: var(--surface2); border: 1px solid var(--border); border-radius: 999px; padding: 3px; }
.ptlog-role-switch button { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; background: transparent; border: none; color: var(--muted); padding: 6px 12px; border-radius: 999px; cursor: pointer; }
.ptlog-role-switch button.active { background: var(--accent); color: #1A1006; font-weight: 600; }
.ptlog-role-leave { font-family: 'Inter', sans-serif; font-size: 11px; background: var(--surface2); border: 1px solid var(--border); color: var(--muted); padding: 6px 10px; border-radius: 999px; cursor: pointer; white-space: nowrap; flex-shrink: 0; }

.ptlog-gate { display: flex; flex-direction: column; gap: 6px; padding: 60px 8px 20px; text-align: left; }
.ptlog-gate-title { font-family: 'Sora', sans-serif; font-size: 26px; font-weight: 700; margin: 4px 0 4px; }
.ptlog-gate-btn { text-align: left; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 16px 18px; margin-top: 14px; cursor: pointer; display: flex; flex-direction: column; gap: 4px; color: var(--text); }
.ptlog-gate-btn strong { font-family: 'Sora', sans-serif; font-size: 16px; }
.ptlog-gate-btn:hover { border-color: var(--accent); }

.ptlog-roster-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; margin-bottom: 16px; }
.ptlog-roster-card { display: flex; align-items: center; gap: 12px; text-align: left; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px; cursor: pointer; color: var(--text); }
.ptlog-roster-card:hover { border-color: var(--accent); }
.ptlog-roster-info { display: flex; flex-direction: column; gap: 2px; font-size: 13px; min-width: 0; }
.ptlog-roster-info strong { font-family: 'Sora', sans-serif; font-size: 15px; }
.ptlog-roster-card { position: relative; padding: 0; align-items: stretch; }
.ptlog-roster-card-main { display: flex; align-items: center; gap: 12px; text-align: left; background: transparent; border: none; padding: 14px; cursor: pointer; color: var(--text); width: 100%; }
.ptlog-roster-menu-wrap { position: absolute; top: 8px; right: 8px; }
.ptlog-roster-menu { position: absolute; right: 0; top: 26px; background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; z-index: 10; min-width: 160px; }
.ptlog-roster-menu button { display: block; width: 100%; text-align: left; background: transparent; border: none; padding: 10px 12px; font-size: 13px; color: var(--text); cursor: pointer; }
.ptlog-roster-menu button:hover { background: var(--surface); }

.ptlog-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 16px; }
.ptlog-tab { font-family: 'Inter', sans-serif; font-weight: 500; font-size: 13px; display: flex; align-items: center; gap: 6px; background: var(--surface); border: 1px solid var(--border); color: var(--muted); padding: 8px 14px; cursor: pointer; border-radius: 999px; white-space: nowrap; flex-shrink: 0; }
.ptlog-tab.active { background: var(--accent); border-color: var(--accent); color: #1A1006; font-weight: 600; }

.ptlog-section h2 { font-family: 'Sora', sans-serif; font-size: 19px; margin: 0 0 14px; }
.ptlog-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 16px 18px; margin-bottom: 14px; }
.ptlog-card h3 { font-family: 'Sora', sans-serif; font-size: 15px; margin: 0 0 12px; }
.ptlog-card h4 { font-size: 12px; margin: 10px 0 4px; color: var(--muted); }
.ptlog-card-header-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
.ptlog-card-header-row h3 { margin: 0; }
.ptlog-row-between { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }

.ptlog-hero { background: linear-gradient(135deg, var(--surface2), var(--surface)); border: 1px solid var(--border); border-radius: 16px; padding: 18px 20px; margin-bottom: 14px; }
.ptlog-hero-label { font-size: 12px; color: var(--muted); }
.ptlog-hero-row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
.ptlog-hero-value { font-family: 'Sora', sans-serif; font-size: 40px; font-weight: 700; line-height: 1; }
.ptlog-hero-unit { font-size: 15px; color: var(--muted); }
.ptlog-chip { font-size: 12px; padding: 3px 10px; border-radius: 999px; background: var(--surface2); color: var(--muted); margin-left: auto; }
.ptlog-chip.good { background: rgba(74,222,158,0.14); color: var(--good); }
.ptlog-chip.neutral { background: rgba(255,143,94,0.14); color: var(--accent); }

.ptlog-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ptlog-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; align-items: end; }
@media (max-width: 620px) { .ptlog-grid-2, .ptlog-grid-4 { grid-template-columns: 1fr; } }

.ptlog-field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; font-size: 13px; }
.ptlog-field span { color: var(--muted); font-size: 12px; }
.ptlog-root input, .ptlog-root select, .ptlog-root textarea { font-family: 'Inter', sans-serif; font-size: 14px; padding: 8px 10px; border: 1px solid var(--border); background: var(--surface2); color: var(--text); border-radius: 8px; width: 100%; }
.ptlog-root input:focus, .ptlog-root select:focus, .ptlog-root textarea:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
.ptlog-root input:disabled, .ptlog-root select:disabled, .ptlog-root textarea:disabled { opacity: 0.7; cursor: default; }
.ptlog-root textarea { resize: vertical; }

.ptlog-checkbox { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--muted); }

.ptlog-btn { font-family: 'Inter', sans-serif; font-weight: 500; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 9px 15px; cursor: pointer; border-radius: 9px; }
.ptlog-btn.primary { background: var(--accent); color: #1A1006; border-color: var(--accent); font-weight: 600; }
.ptlog-btn.wide { width: 100%; justify-content: center; }
.ptlog-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.ptlog-btn-x { background: transparent; border: none; color: var(--warn); display: inline-flex; align-items: center; cursor: pointer; padding: 4px; border-radius: 6px; flex-shrink: 0; }
.ptlog-btn-x:disabled { opacity: 0.3; cursor: not-allowed; }

.ptlog-stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
@media (max-width: 560px) { .ptlog-stat-grid { grid-template-columns: 1fr 1fr; } }
.ptlog-stat-card { border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 2px; background: var(--surface); }
.ptlog-stat-card.tone-good { border-color: rgba(74,222,158,0.4); }
.ptlog-stat-card.tone-warn { border-color: rgba(255,107,107,0.4); }
.ptlog-stat-label { font-size: 11px; color: var(--muted); }
.ptlog-stat-value { font-family: 'Sora', sans-serif; font-size: 21px; font-weight: 600; }
.ptlog-stat-unit { font-size: 12px; color: var(--muted); font-family: 'Inter', sans-serif; margin-left: 3px; }
.ptlog-stat-sub { font-size: 11px; color: var(--muted); }
.ptlog-goal-text { white-space: pre-wrap; font-size: 14px; }
.ptlog-goal-banner { font-size: 12px; color: var(--muted); background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; margin-bottom: 10px; }

.ptlog-tooltip { background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; font-size: 12px; color: var(--text); }

.ptlog-mode-tabs { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
.ptlog-mode-btn { font-family: 'Inter', sans-serif; font-size: 12px; display: inline-flex; align-items: center; gap: 5px; background: var(--surface2); border: 1px solid var(--border); color: var(--muted); padding: 7px 13px; cursor: pointer; border-radius: 999px; }
.ptlog-mode-btn.active { background: var(--accent); color: #1A1006; border-color: var(--accent); font-weight: 600; }

.ptlog-food-search { position: relative; }
.ptlog-suggest-list { list-style: none; margin: 6px 0 0; padding: 0; border: 1px solid var(--border); border-radius: 10px; background: var(--surface2); max-height: 240px; overflow-y: auto; }
.ptlog-suggest-list li { padding: 9px 12px; display: flex; justify-content: space-between; cursor: pointer; font-size: 13px; border-bottom: 1px solid var(--border); }
.ptlog-suggest-list li:last-child { border-bottom: none; }
.ptlog-suggest-list li:hover { background: rgba(255,143,94,0.08); }
.ptlog-suggest-sub { color: var(--muted); }
.ptlog-suggest-divider { cursor: default !important; font-size: 11px; color: var(--muted); background: var(--surface); }
.ptlog-suggest-divider:hover { background: var(--surface) !important; }
.ptlog-suggest-loading { cursor: default !important; color: var(--muted); font-style: italic; font-size: 12px; }

.ptlog-off-chip { display: flex; justify-content: space-between; align-items: center; gap: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface2); padding: 12px 14px; flex-wrap: wrap; }
.ptlog-inline-error { color: var(--warn); font-size: 12px; margin: 6px 0; }
.ptlog-attribution { color: var(--muted); font-size: 11px; margin: 10px 0 0; }
.ptlog-or-divider { text-align: center; color: var(--muted); font-size: 12px; margin: 12px 0; }

.ptlog-scanner { display: flex; flex-direction: column; gap: 10px; }
.ptlog-scanner-frame { position: relative; border-radius: 12px; overflow: hidden; background: #000; aspect-ratio: 4 / 3; }
.ptlog-scanner-frame video { width: 100%; height: 100%; object-fit: cover; display: block; }
.ptlog-scanner-guide { position: absolute; top: 30%; left: 10%; right: 10%; bottom: 30%; border: 2px solid var(--accent); border-radius: 10px; box-shadow: 0 0 0 999px rgba(0,0,0,0.35); }

.ptlog-add-row { display: flex; align-items: flex-end; gap: 14px; flex-wrap: wrap; margin-top: 10px; }
.ptlog-add-row > .ptlog-field { flex: 1; min-width: 100px; }
.ptlog-preview { font-size: 13px; color: var(--muted); padding-bottom: 8px; }

.ptlog-entry-list { list-style: none; margin: 0; padding: 0; }
.ptlog-entry-list li { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 14px; }
.ptlog-entry-list li:last-child { border-bottom: none; }
.ptlog-entry-macros { font-size: 12px; color: var(--muted); }

.ptlog-empty { text-align: center; padding: 40px 10px; }
.ptlog-empty h2 { font-family: 'Sora', sans-serif; }
.ptlog-muted { color: var(--muted); font-size: 13px; }
.ptlog-loading { text-align: center; padding: 40px; color: var(--muted); }

.ptlog-toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: var(--accent); color: #1A1006; display: flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 999px; font-size: 13px; font-weight: 600; z-index: 50; }

/* Trainingsplanung */
.ptlog-exercise-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
.ptlog-exercise-card { border: 1px solid var(--border); border-radius: 12px; padding: 10px; cursor: pointer; background: var(--surface2); display: flex; flex-direction: column; gap: 6px; }
.ptlog-exercise-thumb { width: 100%; aspect-ratio: 1.4; border-radius: 8px; background: var(--surface); display: flex; align-items: center; justify-content: center; color: var(--muted); overflow: hidden; }
.ptlog-exercise-thumb img { width: 100%; height: 100%; object-fit: cover; }
.ptlog-exercise-thumb.small { width: 40px; height: 40px; aspect-ratio: unset; border-radius: 8px; flex-shrink: 0; }
.ptlog-exercise-info { display: flex; flex-direction: column; gap: 2px; font-size: 13px; }
.ptlog-coach-note { font-size: 12px; color: var(--accent); font-style: italic; }
.ptlog-coach-note-banner { background: rgba(255,143,94,0.12); border: 1px solid var(--accent); border-radius: 8px; padding: 8px 10px; font-size: 13px; color: var(--accent); margin-bottom: 8px; }
.ptlog-tag-mini { display: inline-block; font-size: 10px; background: rgba(74,222,158,0.16); color: var(--good); padding: 2px 7px; border-radius: 999px; margin-top: 3px; width: fit-content; }
.ptlog-tag-mini.good { background: rgba(74,222,158,0.16); color: var(--good); }

.ptlog-tag-picker { display: flex; flex-wrap: wrap; gap: 6px; }
.ptlog-tag-btn { font-size: 12px; background: var(--surface2); border: 1px solid var(--border); color: var(--muted); padding: 6px 11px; border-radius: 999px; cursor: pointer; }
.ptlog-tag-btn.active { background: var(--accent); color: #1A1006; border-color: var(--accent); font-weight: 600; }
.ptlog-tag-static { display: inline-block; font-size: 11px; background: var(--surface2); border: 1px solid var(--border); color: var(--muted); padding: 4px 10px; border-radius: 999px; margin: 0 6px 6px 0; }

.ptlog-image-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 6px; }
.ptlog-image-thumb { position: relative; width: 60px; height: 60px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); }
.ptlog-image-thumb img { width: 100%; height: 100%; object-fit: cover; }
.ptlog-image-thumb button { position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); border: none; color: #fff; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; }
.ptlog-image-upload { width: 60px; height: 60px; border-radius: 8px; border: 1px dashed var(--border); display: flex; align-items: center; justify-content: center; color: var(--muted); cursor: pointer; }

.ptlog-block-card { border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; margin-bottom: 12px; background: var(--surface2); }
.ptlog-block-divider { border-top: 1px solid var(--border); padding-top: 10px; margin-top: 10px; }
.ptlog-day-card { border: 1px solid var(--border); border-radius: 12px; margin-bottom: 10px; overflow: hidden; background: var(--surface2); }
.ptlog-day-card-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; cursor: pointer; }
.ptlog-day-card-body { padding: 0 14px 14px; border-top: 1px solid var(--border); }
.ptlog-block-item { border-top: 1px solid var(--border); padding-top: 8px; margin-top: 8px; font-size: 13px; }
.ptlog-setrows { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
.ptlog-setrow { display: grid; grid-template-columns: 24px 60px 60px 1fr 26px; gap: 8px; align-items: center; }

.ptlog-day-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.ptlog-weekday-picker { display: flex; gap: 3px; }
.ptlog-weekday-btn { font-size: 11px; padding: 5px 7px; background: var(--surface2); border: 1px solid var(--border); color: var(--muted); border-radius: 6px; cursor: pointer; }
.ptlog-weekday-btn.active { background: var(--accent); color: #1A1006; border-color: var(--accent); font-weight: 600; }

.ptlog-plan-days { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.ptlog-plan-day { display: flex; align-items: center; gap: 12px; border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; background: var(--surface); }
.ptlog-plan-day-thumb { width: 40px; height: 40px; border-radius: 10px; background: var(--surface2); display: flex; align-items: center; justify-content: center; color: var(--accent); flex-shrink: 0; }
.ptlog-plan-day-info { display: flex; flex-direction: column; gap: 2px; flex: 1; font-size: 14px; }

.ptlog-exercise-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border); cursor: pointer; }
.ptlog-exercise-row:last-child { border-bottom: none; }
.ptlog-letter-badge { width: 22px; height: 22px; border-radius: 6px; background: var(--surface); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 11px; color: var(--muted); flex-shrink: 0; }

.ptlog-log-setrow { display: grid; grid-template-columns: 18px 1fr 1fr 1fr 32px; gap: 6px; align-items: center; margin-bottom: 6px; }
.ptlog-log-setrow-extra { display: flex; gap: 6px; margin: -2px 0 8px 24px; }
.ptlog-log-setrow-extra input { width: 60px; font-size: 12px; padding: 5px 8px; }
.ptlog-pain-btn { font-size: 11px; padding: 5px 9px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--muted); cursor: pointer; }
.ptlog-pain-btn.active { background: rgba(255,107,107,0.15); border-color: var(--warn); color: var(--warn); font-weight: 600; }
.ptlog-check-btn { width: 28px; height: 28px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--muted); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.ptlog-check-btn.done { background: var(--good); border-color: var(--good); color: #0B2018; }

.sticky-bottom { position: sticky; bottom: 10px; margin-top: 10px; }

.ptlog-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: flex-end; justify-content: center; z-index: 100; }
.ptlog-modal { background: var(--bg); border: 1px solid var(--border); border-radius: 18px 18px 0 0; width: 100%; max-width: 720px; max-height: 85vh; overflow-y: auto; padding: 16px 18px 24px; }
.ptlog-modal-header { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.ptlog-modal-image { position: relative; border-radius: 12px; overflow: hidden; margin-bottom: 10px; background: var(--surface2); }
.ptlog-modal-image img { width: 100%; max-height: 260px; object-fit: cover; display: block; }
.ptlog-image-dots { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); display: flex; gap: 5px; }
.ptlog-image-dots span { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.4); cursor: pointer; }
.ptlog-image-dots span.active { background: #fff; }

.ptlog-suggestion { font-size: 13px; border: 1px solid var(--border); border-left: 3px solid var(--muted); border-radius: 8px; padding: 10px 12px; background: var(--surface2); }
.ptlog-suggestion.tone-good { border-left-color: var(--good); }
.ptlog-suggestion.tone-warn { border-left-color: var(--warn); }
.ptlog-suggestion.tone-info { border-left-color: var(--accent); }

.ptlog-chat { display: flex; flex-direction: column; gap: 10px; max-height: 420px; overflow-y: auto; }
.ptlog-chat-bubble { align-self: flex-start; max-width: 80%; background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 8px 12px; font-size: 14px; }
.ptlog-chat-bubble.mine { align-self: flex-end; background: rgba(255,143,94,0.14); border-color: var(--accent); }
.ptlog-chat-meta { display: block; font-size: 10px; color: var(--muted); margin-top: 4px; }

.ptlog-cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; font-size: 11px; color: var(--muted); text-align: center; margin-bottom: 4px; }
.ptlog-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.ptlog-cal-cell { aspect-ratio: 1; border: 1px solid var(--border); border-radius: 8px; background: var(--surface2); color: var(--text); font-size: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; cursor: pointer; position: relative; }
.ptlog-cal-cell.empty { border: none; background: transparent; cursor: default; }
.ptlog-cal-cell.is-today { border-color: var(--muted); font-weight: 700; }
.ptlog-cal-cell.has-session { border-color: var(--accent); }
.ptlog-cal-cell.selected { background: var(--accent); color: #1A1006; }
.ptlog-cal-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); }
.ptlog-cal-cell.selected .ptlog-cal-dot { background: #1A1006; }
.ptlog-cal-cell.status-matched { border-color: var(--good); }
.ptlog-cal-cell.status-matched .ptlog-cal-dot { background: var(--good); }
.ptlog-cal-cell.status-deviated { border-color: var(--accent); }
.ptlog-cal-cell.status-missed { border-color: var(--warn); background: rgba(255,107,107,0.1); }
.ptlog-cal-cell.status-missed .ptlog-cal-dot { background: var(--warn); }
.ptlog-cal-cell.status-caughtup { border-color: #5EA8E0; }
.ptlog-cal-cell.status-caughtup .ptlog-cal-dot { background: #5EA8E0; }
.ptlog-cal-cell.status-restday { opacity: 0.55; }
.ptlog-week-chips { display: flex; flex-wrap: wrap; gap: 4px; margin: 6px 0 12px; }
.ptlog-week-chip { font-size: 10px; padding: 3px 7px; border-radius: 999px; background: var(--surface2); border: 1px solid var(--border); color: var(--muted); }
.ptlog-week-chip.lit { background: rgba(255,143,94,0.16); border-color: var(--accent); color: var(--accent); font-weight: 600; }
.ptlog-cal-legend { display: flex; flex-wrap: wrap; gap: 14px; font-size: 11px; color: var(--muted); margin: 4px 0 10px; }
.ptlog-cal-legend span { display: inline-flex; align-items: center; gap: 5px; }
.ptlog-event-banner { background: rgba(255,143,94,0.14); border: 1px solid var(--accent); color: var(--accent); font-size: 13px; font-weight: 600; border-radius: 10px; padding: 10px 14px; margin-bottom: 14px; }
.ptlog-cal-flag { position: absolute; top: 2px; right: 3px; font-size: 9px; }
.ptlog-event-line { font-size: 13px; font-weight: 600; color: var(--accent); margin: -4px 0 8px; }
.ptlog-checkin-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; gap: 10px; }
.ptlog-checkin-scale { display: flex; gap: 4px; }
.ptlog-checkin-dot { width: 26px; height: 26px; border-radius: 50%; border: 1px solid var(--border); background: var(--surface2); color: var(--muted); font-size: 12px; cursor: pointer; }
.ptlog-checkin-dot.active { background: var(--accent); border-color: var(--accent); color: #1A1006; font-weight: 700; }
.ptlog-roster-warning { font-size: 11px; color: var(--warn); margin-top: 2px; }

.ptlog-set-block { margin-bottom: 6px; }
.ptlog-setrow-header { display: grid; grid-template-columns: 24px 60px 60px 1fr 26px; gap: 8px; font-size: 11px; color: var(--muted); margin-bottom: 4px; }
.ptlog-settable-header { display: grid; grid-template-columns: 22px 1fr 55px 55px 32px; gap: 6px; font-size: 11px; color: var(--muted); margin: 6px 0 4px; }
.ptlog-settable-row { display: grid; grid-template-columns: 22px 1fr 55px 55px 32px; gap: 6px; align-items: center; padding: 6px 4px; border-radius: 8px; margin-bottom: 2px; }
.ptlog-settable-row.done { background: rgba(74,222,158,0.14); }
.ptlog-settable-prev { font-size: 12px; color: var(--muted); }
.ptlog-settable-distance { width: 100%; margin: 0 0 6px 28px; font-size: 12px; }
.ptlog-rest-timer-inline { display: grid; grid-template-columns: 1fr auto 1fr auto; align-items: center; gap: 8px; margin: 2px 0 8px; color: var(--accent); font-weight: 700; font-size: 13px; }
.ptlog-rest-line { height: 1px; background: rgba(255,143,94,0.35); }
.ptlog-prev-value { font-size: 11px; color: var(--muted); margin-bottom: 3px; padding-left: 24px; }
.ptlog-rest-timer { display: flex; justify-content: space-between; align-items: center; background: var(--surface); border: 1px solid var(--accent); border-radius: 10px; padding: 8px 12px; margin-top: 8px; font-size: 13px; color: var(--accent); font-weight: 600; }

.ptlog-template-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
.ptlog-template-card { border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; background: var(--surface); cursor: pointer; display: flex; flex-direction: column; gap: 4px; }

.ptlog-history-group-label { font-size: 11px; letter-spacing: 0.04em; color: var(--muted); margin: 18px 0 8px; }
.ptlog-history-card { border: 1px solid var(--border); border-radius: 14px; padding: 14px 16px; margin-bottom: 12px; background: var(--surface); display: flex; flex-direction: column; gap: 4px; }
.ptlog-history-stats { display: flex; gap: 14px; font-size: 12px; color: var(--muted); margin: 4px 0 8px; }
.ptlog-history-exercises { display: flex; flex-direction: column; gap: 3px; border-top: 1px solid var(--border); padding-top: 8px; }
.ptlog-history-exercise-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); }
.ptlog-history-feedback { display: flex; flex-direction: column; gap: 2px; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); font-size: 13px; }
.ptlog-schedule-badge { font-size: 11px; color: var(--accent); margin-top: 2px; }

/* Avatar */
.ptlog-avatar-display { border-radius: 50%; padding: 4px; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; }
.ptlog-avatar-inner { width: 100%; height: 100%; border-radius: 50%; background: var(--surface); display: flex; align-items: center; justify-content: center; line-height: 1; }
.ptlog-avatar-badge { position: absolute; bottom: -2px; right: -2px; background: var(--surface2); border: 1px solid var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.ptlog-emoji-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(44px, 1fr)); gap: 8px; }
.ptlog-emoji-btn { font-size: 22px; background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 8px; cursor: pointer; }
.ptlog-emoji-btn.active { border-color: var(--accent); background: rgba(255,143,94,0.14); }
.ptlog-skin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 10px; }
.ptlog-skin-card { display: flex; flex-direction: column; align-items: center; gap: 6px; background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 12px 8px; cursor: pointer; font-size: 11px; color: var(--muted); }
.ptlog-skin-card.active { border-color: var(--accent); color: var(--text); }
.ptlog-skin-card.locked { opacity: 0.4; cursor: not-allowed; }
`;
