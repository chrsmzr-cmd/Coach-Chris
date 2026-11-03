/* Workout-Vorlagen des Coaches (aus seinen Trainingsplan-Tabellen übernommen).
   Zeile: [Muskel, Übung, Ausführung 1, Ausführung 2, Sätze, Wiederholungen, RiR]
   Neue Pläne werden einfach als weitere Einträge in WORKOUT_TEMPLATES ergänzt. */

const LH = "Langhantel", KH = "Kurzhantel", MA = "Maschine", KZ = "Kabelzug", KT = "Kabelturm";
const R = "Rücken", BR = "Brust", SC = "Schultern", HS = "Hintere Schulter", TR = "Trizeps", BI = "Bizeps";
const QU = "Quadrizeps", HA = "Hamstrings", GL = "Glutes", WA = "Waden", BA = "Bauch";

export const WORKOUT_TEMPLATES = [
  /* ---------- Push / Pull / Beine ---------- */
  { title: "01.Push A", rows: [
    [BR, "Bankdrücken", LH, "", 3, "6-8", "1"], [BR, "Schrägbankdrücken", MA, "", 3, "8-10", "1"], [BR, "Fliegende", KZ, "", 2, "12-15", "0-1"],
    [SC, "Schulterdrücken", LH, "", 3, "6-8", "1"], [SC, "Seitheben", MA, "", 3, "12-15", "0-1"], [SC, "Seitheben", "einseitig", KZ, 2, "12-15", "0-1"],
    [TR, "Überkopf Trizepsdrücken", "Seil", KZ, 3, "12-15", "0-1"], [TR, "Trizepsdrücken einseitig", "Seil", KZ, 3, "12-15", "0-1"],
  ] },
  { title: "03.Push A", rows: [
    [BR, "Schrägbankdrücken", LH, "", 4, "6-8", "1"], [BR, "Bankdrücken", MA, "", 3, "8-10", "1"], [BR, "Fliegende", KZ, "", 3, "12-15", "1"],
    [SC, "Schulterdrücken", LH, "", 3, "6-8", "1"], [SC, "Seitheben", KH, "", 3, "12-15", "0-1"], [SC, "Seitheben", "einseitig", KZ, 3, "12-15", "0-1"],
    [TR, "Trizepsdrücken", "V-Griff", KZ, 3, "12-15", "0-1"], [TR, "Überkopf Trizepsdrücken", "Seil", KZ, 3, "12-15", "0-1"], [TR, "Trizepsdrücken einseitig", "Seil", KZ, 3, "12-15", "0-1"],
  ] },
  { title: "04.Push B", rows: [
    [BR, "Schrägbankdrücken", LH, "", 3, "6-8", "1"], [BR, "Bankdrücken", MA, "", 3, "8-10", "1"], [BR, "Butterfly", MA, "", 2, "12-15", "0-1"],
    [SC, "Schulterdrücken", MA, "", 3, "8-10", "1"], [SC, "Seitheben", KH, "", 3, "12-15", "0-1"], [SC, "Frontheben", "Seil", KZ, 2, "12-15", "0-1"],
    [TR, "Trizepsdrücken", "V-Griff", KZ, 3, "12-15", "0-1"], [TR, "Überkopf Trizepsdrücken", "Seil", KZ, 3, "12-15", "0-1"], [TR, "Trizepsdrücken einseitig", "Seil", KZ, 3, "12-15", "0-1"],
  ] },
  { title: "02.Pull A", rows: [
    [R, "T-Bar Rudern", LH, "eng", 3, "8-10", "1"], [R, "Latzug", "Breit", KT, 2, "8-10", "1"], [R, "Rudern", "Breit", MA, 2, "8-10", "1"],
    [R, "High Row", "eng", MA, 2, "8-10", "1"], [R, "Überzüge", "Seil", KZ, 2, "12-15", "0-1"],
    [BI, "Hammer Curls", KH, "", 3, "8-10", "0-1"], [BI, "Preacher Curls", MA, "", 3, "10-12", "0-1"],
  ] },
  { title: "04.Pull A", rows: [
    [R, "Rudern", "Breit", MA, 3, "8-10", "1"], [R, "High Row", "Breit", MA, 3, "8-10", "1"], [R, "Latzug", "eng", KT, 3, "8-10", "1"],
    [R, "Überzüge", "Seil", KZ, 3, "12-15", "0-1"], [HS, "Facepulls", "Seil", KZ, 3, "12-15", "0-1"],
    [BI, "Bizeps Curls", "eindrehen", KH, 3, "12-15", "0-1"], [BI, "Hammer Curls", "Seil", KZ, 3, "12-15", "0-1"], [BI, "Preacher Curls", MA, "", 3, "12-15", "0-1"],
  ] },
  { title: "05.Pull B", rows: [
    [R, "Rudern", "Breit", MA, 3, "8-10", "1"], [R, "Latzug", "eng", KT, 2, "8-10", "1"], [R, "High Row", "Breit", MA, 2, "8-10", "1"], [R, "Rudern", "eng", KT, 2, "8-10", "1"],
    [HS, "Facepulls", KZ, "oder Band", 3, "12-15", "0-1"],
    [BI, "Bizeps Curls", "rotieren", KH, 3, "8-10", "0-1"], [BI, "Hammer Curls", "Seil", KZ, 3, "12-15", "0-1"], [BI, "Bizeps Curls Schräg Bank", KH, "", 3, "12-15", "0-1"],
  ] },
  { title: "03.Beine A", rows: [
    [QU, "Kniebeuge", LH, "", 3, "6-8", "1"], [HA, "Rumänisches Kreuzheben", LH, "", 3, "8-10", "1"], [QU, "Bulgarian Split Squats", KH, "", 3, "12-15", "0-1"],
    [HA, "Glut Ham Raises", MA, "", 3, "12-15", "0-1"], [WA, "Wadenheben", "Sitzend", "Beinpresse", 4, "12-15", "0-1"], [BA, "Crunches", "Seil", KZ, 4, "12-15", "0-1"],
  ] },
  { title: "06.Leg B", rows: [
    [HA, "Kreuzheben", LH, "", 3, "6-8", "1"], [QU, "V-Squat", MA, "", 3, "8-10", "1"], [GL, "Hüftheben", LH, "", 3, "10-15", "1"],
    [QU, "Beinstrecker", MA, "", 3, "10-12", "0-1"], [HA, "Beinbeuger", "liegend", MA, 3, "10-12", "0-1"],
    [WA, "Wadenheben", "Sitzend", MA, 4, "10-12", "0-1"], [BA, "Klappmesser-Crunches", "", "", 4, "10-12", "0-1"],
  ] },
  { title: "06.Beine B", rows: [
    [HA, "Kreuzheben", LH, "", 3, "6-8", "1"], [QU, "V-Squat", MA, "", 3, "8-10", "1"], [GL, "Hüftheben", LH, "", 3, "10-15", "1"],
    [QU, "Beinstrecker", MA, "", 3, "10-12", "0-1"], [HA, "Beinbeuger", "liegend", MA, 3, "10-12", "0-1"],
    [WA, "Wadenheben", "Sitzend", MA, 4, "10-12", "0-1"], [BA, "Klappmesser-Crunches", "", "", 4, "10-12", "0-1"],
  ] },

  /* ---------- Oberkörper / Unterkörper ---------- */
  { title: "01.Oberkörper A", rows: [
    [BR, "Bankdrücken", LH, "", 3, "6-8", "1"], [R, "Rudern", "eng", KT, 3, "8-10", "1"], [BR, "Schrägbankdrücken", MA, "", 2, "8-10", "1"],
    [R, "Latzug", "Breit", KT, 3, "8-10", "1"], [SC, "Schulterdrücken", LH, "", 3, "6-8", "1"], [SC, "Seitheben", "Kabel", "", 3, "12-15", "0-1"],
    [BI, "Hammer Curls", KH, "", 3, "8-10", "0-1"], [TR, "Überkopf Trizepsdrücken", "Seil", KZ, 3, "12-15", "0-1"],
    [BI, "Bizeps Curls", "SZ-Bar", KZ, 2, "12-15", "0-1"], [TR, "Trizepsdrücken einseitig", "Seil", KZ, 2, "12-15", "0-1"],
  ] },
  { title: "01.Oberkörper A (Variante 2)", rows: [
    [BR, "Bankdrücken", LH, "", 3, "6-8", "1"], [R, "Rudern", "eng", KT, 3, "8-10", "1"], [BR, "Schrägbankdrücken", MA, "", 3, "8-10", "1"],
    [R, "Latzug", "Breit", KT, 3, "8-10", "1"], [SC, "Schulterdrücken", MA, "", 3, "8-10", "1"], [SC, "Seitheben", KH, "", 3, "12-15", "0-1"],
    [BI, "Hammer Curls", KH, "", 3, "8-10", "0-1"], [TR, "Überkopf Trizepsdrücken", "Seil", KZ, 3, "12-15", "0-1"],
    [BI, "Bizeps Curls Schräg Bank", KH, "", 3, "12-15", "0-1"], [TR, "Trizepsdrücken einseitig", "Seil", KZ, 3, "12-15", "0-1"],
  ] },
  { title: "03.Oberkörper B", rows: [
    [BR, "Schrägbankdrücken", LH, "", 3, "6-8", "1"], [R, "Rudern", "Breit", KT, 3, "8-10", "1"], [BR, "Bankdrücken", MA, "", 2, "8-10", "1"],
    [R, "Latzug", "eng", KT, 3, "8-10", "1"], [HS, "Facepulls", "Seil", KZ, 3, "12-15", "0-1"], [SC, "Seitheben", KH, "", 3, "12-15", "0-1"],
    [TR, "Trizepsdrücken", "V-Griff", KZ, 3, "12-15", "0-1"], [BI, "Bizeps Curls", "rotieren", KH, 3, "12-15", "0-1"],
    [TR, "Überkopf Trizepsdrücken", "Seil", KZ, 2, "12-15", "0-1"], [BI, "Hammer Curls", "Seil", KZ, 2, "12-15", "0-1"],
  ] },
  { title: "05.Oberkörper C", rows: [
    [BR, "Bankdrücken", KH, "", 3, "6-8", "1"], [R, "Rudern", "eng", MA, 3, "8-10", "1"], [BR, "Butterfly", MA, "", 3, "12-15", "1"],
    [R, "High Row", "Breit", MA, 3, "8-10", "1"], [SC, "Schulterdrücken", MA, "", 3, "8-10", "1"], [SC, "Seitheben", KZ, "", 3, "12-15", "0-1"],
    [BI, "Preacher Curls", MA, "", 3, "12-15", "0-1"], [TR, "Trizepsdrücken", "Seil", KZ, 3, "12-15", "0-1"],
    [BI, "Bizeps Curls Schräg Bank", KH, "", 2, "12-15", "0-1"], [TR, "Überkopf Trizepsdrücken", "Seil", KZ, 2, "12-15", "0-1"],
  ] },
  { title: "02.Unterkörper A", rows: [
    [QU, "Kniebeuge", LH, "", 3, "6-8", "1"], [HA, "Rumänisches Kreuzheben", LH, "", 2, "8-10", "1"], [QU, "Beinstrecker", MA, "", 2, "12-15", "1"],
    [HA, "Beinbeuger", "liegend", MA, 3, "12-15", "0-1"], [WA, "Wadenheben", "Sitzend", "Beinpresse", 3, "12-15", "0-1"], [BA, "Crunches", "Seil", KZ, 3, "12-15", "0-1"],
  ] },
  { title: "02.Unterkörper A (Variante 2)", rows: [
    [QU, "Kniebeuge", LH, "", 3, "6-8", "1"], [HA, "Rumänisches Kreuzheben", LH, "", 3, "8-10", "1"], [QU, "Bulgarian Split Squats", KH, "", 3, "12-15", "1"],
    [HA, "Glut Ham Raises", "", "", 3, "12-15", "0-1"], [WA, "Wadenheben", "Sitzend", "Beinpresse", 4, "12-15", "0-1"], [BA, "Crunches", "Seil", KZ, 4, "12-15", "0-1"],
  ] },
  { title: "04.Unterkörper B", rows: [
    [HA, "Kreuzheben", LH, "", 3, "6-8", "1"], [QU, "Beinpresse", MA, "", 2, "8-10", "1"], [HA, "Beinbeuger", "Sitzend", MA, 2, "12-15", "0-1"],
    [QU, "Beinstrecker", MA, "", 2, "12-15", "0-1"], [WA, "Wadenheben", "Sitzend", MA, 3, "12-15", "0-1"], [BA, "Klappmesser-Crunches", "", "", 3, "12-15", "0-1"],
  ] },
  { title: "05.Unterkörper B", rows: [
    [HA, "Kreuzheben", LH, "", 3, "6-8", "1"], [QU, "V-Squat", MA, "", 3, "8-10", "1"], [GL, "Hüftheben", LH, "", 3, "8-10", "1"],
    [QU, "Beinstrecker", MA, "", 3, "12-15", "0-1"], [HA, "Beinbeuger", "liegend", MA, 3, "12-15", "0-1"],
    [WA, "Wadenheben", "Sitzend", MA, 4, "12-15", "0-1"], [BA, "Klappmesser-Crunches", "", "", 4, "12-15", "0-1"],
  ] },
  { title: "06.Unterkörper C", rows: [
    [QU, "V-Squat", MA, "", 3, "6-8", "1"], [GL, "Hüftheben", LH, "", 2, "8-10", "1"], [QU, "Bulgarian Split Squats", KH, "", 2, "12-15", "1"],
    [HA, "Hyperextension", KH, "", 3, "12-15", "0-1"], [HA, "Beinbeuger", "liegend", MA, 2, "12-15", "0-1"],
    [WA, "Wadenheben", "Sitzend", "Beinpresse", 3, "12-15", "0-1"], [BA, "Beinheben", "", "", 3, "12-15", "0-1"],
  ] },

  /* ---------- Ganzkörper ---------- */
  { title: "01.Ganzkörper A", rows: [
    [QU, "Kniebeuge", LH, "", 3, "6-8", "1"], [HA, "Beinbeuger", "liegend", MA, 3, "8-10", "1"], [BR, "Bankdrücken", MA, "", 2, "6-8", "1"],
    [R, "Latzug", "Breit", KT, 3, "8-10", "1"], [SC, "Schulterdrücken", MA, "", 3, "6-10", "1"],
    [BI, "Bizeps Curls", KH, "eindrehen", 3, "12-15", "0-1"], [TR, "Überkopf Trizepsdrücken", "Seil", KZ, 3, "12-15", "0-1"],
    [WA, "Wadenheben", "Sitzend", "Beinpresse", 3, "12-15", "0-1"], [BA, "Crunches", "Seil", KZ, 3, "12-15", "0-1"],
  ] },
  { title: "02.Ganzkörper B", rows: [
    [BR, "Schrägbankdrücken", LH, "", 3, "6-8", "1"], [HA, "Kreuzheben", LH, "", 3, "6-10", "1"], [QU, "Beinstrecker", MA, "", 2, "12-15", "0-1"],
    [R, "Rudern", "Breit", MA, 3, "8-10", "1"], [SC, "Seitheben", KH, "", 3, "12-15", "0-1"], [BI, "Hammer Curls", KH, "", 3, "8-10", "0-1"],
    [TR, "Trizepsdrücken", "V-Griff", KZ, 3, "12-15", "0-1"], [BA, "Crunches", "Seil", KZ, 3, "12-15", "0-1"],
  ] },
  { title: "03.Ganzkörper C", rows: [
    [R, "Rudern", "eng", KT, 3, "8-10", "1"], [QU, "Bulgarian Split Squats", KH, "", 3, "10-15", "1"], [BR, "Bankdrücken", LH, "", 3, "6-10", "1"],
    [GL, "Hüftheben", LH, "", 3, "10-15", "1"], [SC, "Schulterdrücken", LH, "", 3, "8-12", "1"], [BI, "Bizeps Curls", KH, "", 3, "10-12", "0-1"],
    [TR, "Trizepsdrücken einseitig", "Seil", KT, 3, "12-15", "0-1"], [WA, "Wadenheben", "Sitzend", MA, 3, "8-10", "0-1"],
  ] },
  { title: "01.Ganzkörper Push A", rows: [
    [BR, "Bankdrücken", LH, "", 3, "6-8", "1"], [BR, "Butterfly", MA, "", 2, "12-15", "0-1"], [SC, "Schulterdrücken", MA, "", 3, "8-10", "1"],
    [SC, "Seitheben", KH, "", 2, "12-15", "0-1"], [QU, "V-Squat", MA, "", 3, "12-15", "1"], [QU, "Beinstrecker", MA, "", 2, "12-15", "0-1"],
    [TR, "Überkopf Trizepsdrücken", "Seil", KZ, 3, "12-15", "0-1"], [TR, "Trizepsdrücken einseitig", "Seil", KZ, 2, "12-15", "0-1"],
    [WA, "Wadenheben", "Sitzend", "Beinpresse", 3, "12-15", "0-1"],
  ] },
  { title: "03.Ganzkörper Push B", rows: [
    [QU, "Kniebeuge", LH, "", 3, "6-8", "1"], [QU, "Bulgarian Split Squats", KH, "", 2, "12-15", "1"], [BR, "Schrägbankdrücken", LH, "", 3, "6-8", "1"],
    [BR, "Bankdrücken", MA, "", 3, "8-10", "1"], [SC, "Schulterdrücken", KH, "", 3, "8-10", "1"], [SC, "Seitheben", KZ, "", 3, "12-15", "0-1"],
    [TR, "Trizepsdrücken", "V-Griff", KZ, 3, "12-15", "0-1"], [TR, "Überkopf Trizepsdrücken", "Seil", KZ, 2, "12-15", "0-1"],
    [WA, "Wadenheben", "Sitzend", MA, 3, "12-15", "0-1"],
  ] },
  { title: "05.Ganzkörper Push C", rows: [
    [SC, "Schulterdrücken", LH, "", 3, "6-8", "1"], [SC, "Seitheben", KH, "", 2, "12-15", "0-1"], [QU, "Beinpresse", MA, "", 2, "8-10", "1"],
    [GL, "Hüftheben", LH, "", 3, "8-10", "1"], [QU, "Beinstrecker", MA, "", 2, "12-15", "0-1"], [BR, "Schrägbankdrücken", MA, "", 3, "8-10", "1"],
    [BR, "Fliegende", KZ, "", 2, "12-15", "0-1"], [TR, "Trizepsdrücken", "SZ-Bar", KZ, 2, "12-15", "0-1"],
    [TR, "Überkopf Trizepsdrücken", "Seil", KZ, 3, "12-15", "0-1"], [WA, "Wadenheben", "Sitzend", "Beinpresse", 3, "12-15", "0-1"],
  ] },
  { title: "02.Ganzkörper Pull A", rows: [
    [R, "Rudern", "eng", KT, 3, "8-10", "1"], [R, "Latzug", "Breit", KT, 3, "8-10", "1"], [HA, "Rumänisches Kreuzheben", LH, "", 2, "8-10", "1"],
    [HA, "Hyperextension", KH, "", 3, "12-15", "0-1"], [HS, "Facepulls", "Seil", KZ, 2, "12-15", "0-1"], [BI, "Hammer Curls", KH, "", 3, "8-10", "0-1"],
    [BI, "Bizeps Curls", "SZ-Bar", KZ, 2, "12-15", "0-1"], [BA, "Crunches", "Seil", KZ, 3, "12-15", "0-1"],
  ] },
  { title: "04.Ganzkörper Pull B", rows: [
    [HA, "Glut Ham Raises", MA, "", 2, "12-15", "0-1"], [HA, "Beinbeuger", "liegend", MA, 2, "12-15", "0-1"], [R, "Rudern", "Breit", KT, 3, "8-10", "1"],
    [R, "Latzug", "eng", KT, 3, "8-10", "1"], [R, "Überzüge", "Seil", KZ, 2, "12-15", "0-1"], [BI, "Bizeps Curls", "rotieren", KH, 3, "12-15", "0-1"],
    [BI, "Hammer Curls", "Seil", KZ, 2, "12-15", "0-1"], [BA, "Klappmesser-Crunches", "", "", 3, "12-15", "0-1"],
  ] },
  { title: "06.Ganzkörper Pull C", rows: [
    [HA, "Kreuzheben", LH, "", 3, "6-8", "1"], [HA, "Beinbeuger", "Sitzend", MA, 2, "12-15", "0-1"], [R, "Rudern", "eng", MA, 3, "8-10", "1"],
    [R, "High Row", "Breit", MA, 3, "8-10", "1"], [HS, "Facepulls", "Seil", KZ, 2, "12-15", "0-1"], [BI, "Preacher Curls", MA, "", 3, "12-15", "0-1"],
    [BI, "Bizeps Curls Schräg Bank", KH, "", 2, "12-15", "0-1"], [BA, "Beinheben", "", "", 3, "12-15", "0-1"],
  ] },

  /* ---------- Brust Rücken / Schulter Arme ---------- */
  { title: "01.Brust Rücken A", rows: [
    [BR, "Bankdrücken", LH, "", 3, "6-8", "1"], [BR, "Schrägbankdrücken", MA, "", 3, "8-10", "1"], [BR, "Fliegende", KZ, "", 2, "12-15", "0-1"],
    [R, "Vorgebeugtes Rudern", LH, "", 3, "8-10", "1"], [R, "Latzug", "Breit", KT, 2, "8-10", "1"], [R, "Rudern", "Breit", MA, 2, "8-10", "1"],
    [R, "High Row", "eng", MA, 2, "8-10", "1"], [R, "Überzüge", "Seil", KZ, 2, "12-15", "0-1"],
  ] },
  { title: "04.Brust Rücken B", rows: [
    [BR, "Schrägbankdrücken", LH, "", 3, "6-8", "1"], [BR, "Bankdrücken", MA, "", 3, "8-10", "1"], [BR, "Butterfly", MA, "", 2, "12-15", "0-1"],
    [R, "T-Bar Rudern", LH, "eng", 3, "8-10", "1"], [R, "Latzug", "eng", KT, 2, "8-10", "1"], [R, "High Row", "Breit", MA, 2, "8-10", "1"],
    [R, "Rudern", "eng", KT, 2, "8-10", "1"],
  ] },
  { title: "02.Schulter Arme A", rows: [
    [SC, "Schulterdrücken", LH, "", 3, "6-8", "1"], [SC, "Seitheben", MA, "", 3, "12-15", "0-1"], [SC, "Seitheben", "einseitig", KZ, 2, "12-15", "0-1"],
    [TR, "Überkopf Trizepsdrücken", "Seil", KZ, 2, "12-15", "0-1"], [TR, "Trizepsdrücken", "V-Griff", KZ, 2, "12-15", "0-1"],
    [TR, "Trizepsdrücken einseitig", "Seil", KZ, 2, "12-15", "0-1"], [BI, "Hammer Curls", KH, "", 2, "8-10", "0-1"],
    [BI, "Bizeps Curls", "rotieren", KH, 2, "10-12", "0-1"], [BI, "Preacher Curls", MA, "", 2, "12-15", "0-1"],
  ] },
  { title: "05.Schulter Arme B", rows: [
    [SC, "Schulterdrücken", MA, "", 3, "8-10", "1"], [SC, "Seitheben", KH, "", 3, "12-15", "0-1"], [SC, "Frontheben", "Seil", KZ, 2, "12-15", "0-1"],
    [HS, "Facepulls", "Seil", KZ, 3, "12-15", "0-1"], [TR, "Trizepsdrücken", "Seil", KZ, 3, "12-15", "0-1"],
    [TR, "Überkopf Trizepsdrücken", "V-Griff", KZ, 3, "12-15", "0-1"], [TR, "Trizepsdrücken einseitig", "Seil", KZ, 3, "12-15", "0-1"],
    [BI, "Bizeps Curls", "rotieren", KH, 3, "8-10", "0-1"], [BI, "Hammer Curls", "Seil", KZ, 3, "12-15", "0-1"],
    [BI, "Bizeps Curls Schräg Bank", KH, "", 3, "12-15", "0-1"],
  ] },
].map((t) => ({
  ...t,
  rows: t.rows.map(([muskel, uebung, a1, a2, sets, reps, rir]) => ({ muskel, uebung, a1, a2, sets, reps, rir })),
}));

/* Gruppierung nach Plan-Familie (Titel ohne Nummer, Buchstabe und Variante) */
export function templateFamily(title) {
  const base = title.replace(/^\d+\./, "").replace(/\s*\(Variante \d+\)$/, "").replace(/\s+[A-C]$/, "").trim();
  return base === "Leg" || base === "Beine" ? "Beine" : base;
}
export const FAMILY_ORDER = ["Push", "Pull", "Beine", "Oberkörper", "Unterkörper", "Ganzkörper", "Ganzkörper Push", "Ganzkörper Pull", "Brust Rücken", "Schulter Arme"];

/* Zuordnung auf vorhandene Bibliotheks-Übungen (Seed-Namen). Alles andere wird mit deutschem Namen neu angelegt. */
const SEED_MAP = {
  "bankdrücken|langhantel|": "Bench Press (Barbell)",
  "bankdrücken|kurzhantel|": "Bench Press (Dumbbell)",
  "bankdrücken|maschine|": "Chest Press (Machine)",
  "schrägbankdrücken|langhantel|": "Incline Bench Press (Barbell)",
  "schrägbankdrücken|maschine|": "Incline Chest Press (Machine)",
  "butterfly|maschine|": "Pec Deck (Machine)",
  "fliegende|kabelzug|": "Cable Crossover",
  "schulterdrücken|langhantel|": "Overhead Press (Barbell)",
  "schulterdrücken|maschine|": "Shoulder Press (Machine)",
  "schulterdrücken|kurzhantel|": "Overhead Press (Dumbbell)",
  "seitheben|kurzhantel|": "Lateral Raise (Dumbbell)",
  "seitheben|maschine|": "Lateral Raise (Machine)",
  "seitheben|kabelzug|": "Lateral Raise (Cable)",
  "seitheben|kabel|": "Lateral Raise (Cable)",
  "frontheben|seil|kabelzug": "Front Raise (Cable)",
  "überkopf trizepsdrücken|seil|kabelzug": "Triceps Extension (Cable)",
  "hammer curls|kurzhantel|": "Hammer Curl (Dumbbell)",
  "hammer curls|seil|kabelzug": "Hammer Curl (Cable)",
  "preacher curls|maschine|": "Preacher Curl (Machine)",
  "bizeps curls|kurzhantel|": "Bicep Curl (Dumbbell)",
  "bizeps curls|sz-bar|kabelzug": "Bicep Curl (Cable)",
  "bizeps curls schräg bank|kurzhantel|": "Incline Curl (Dumbbell)",
  "facepulls|seil|kabelzug": "Face Pull (Cable)",
  "facepulls|kabelzug|oder band": "Face Pull (Cable)",
  "t-bar rudern|langhantel|eng": "T Bar Row",
  "latzug|breit|kabelturm": "Lat Pulldown - Wide Grip (Cable)",
  "latzug|eng|kabelturm": "Lat Pulldown (Cable)",
  "rudern|eng|kabelturm": "Seated Row (Cable)",
  "rudern|breit|kabelturm": "Seated Wide-Grip Row (Cable)",
  "rudern|eng|maschine": "Seated Row (Machine)",
  "vorgebeugtes rudern|langhantel|": "Bent Over Row (Barbell)",
  "kniebeuge|langhantel|": "Squat (Barbell)",
  "rumänisches kreuzheben|langhantel|": "Romanian Deadlift (Barbell)",
  "kreuzheben|langhantel|": "Deadlift (Barbell)",
  "bulgarian split squats|kurzhantel|": "Bulgarian Split Squat",
  "glut ham raises|maschine|": "Glute Ham Raise",
  "glut ham raises||": "Glute Ham Raise",
  "beinbeuger|liegend|maschine": "Lying Leg Curl (Machine)",
  "beinbeuger|sitzend|maschine": "Seated Leg Curl (Machine)",
  "beinstrecker|maschine|": "Leg Extension (Machine)",
  "beinpresse|maschine|": "Leg Press",
  "hüftheben|langhantel|": "Hip Thrust (Barbell)",
  "wadenheben|sitzend|beinpresse": "Calf Press on Seated Leg Press",
  "wadenheben|sitzend|maschine": "Seated Calf Raise (Machine)",
  "crunches|seil|kabelzug": "Cable Crunch",
  "klappmesser-crunches||": "Jackknife Sit Up",
  "beinheben||": "Flat Leg Raise",
};

const CATEGORY_BY_MUSKEL = { Brust: "Brust", Rücken: "Rücken", Schultern: "Schultern", "Hintere Schulter": "Schultern", Trizeps: "Arme", Bizeps: "Arme", Quadrizeps: "Beine", Hamstrings: "Beine", Glutes: "Beine", Waden: "Beine", Bauch: "Bauch/Rumpf" };
const MUSCLES_BY_MUSKEL = { Brust: ["Brust"], Rücken: ["Oberer Rücken"], Schultern: ["Schultern"], "Hintere Schulter": ["Schultern"], Trizeps: ["Trizeps"], Bizeps: ["Bizeps"], Quadrizeps: ["Quadrizeps"], Hamstrings: ["Hinterer Oberschenkel"], Glutes: ["Gesäßmuskeln"], Waden: ["Waden"], Bauch: ["Bauch"] };

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function templateExerciseSpec(row) {
  const key = [row.uebung, row.a1 || "", row.a2 || ""].join("|").toLowerCase();
  const tokens = [row.a1, row.a2].filter(Boolean).map(cap);
  const name = row.uebung + (tokens.length ? ` (${tokens.join(", ")})` : "");
  const t = tokens.join(" ").toLowerCase();
  let equipment = "Körpergewicht";
  if (/kabel|seil/.test(t)) equipment = "Kabelzug";
  else if (t.includes("langhantel")) equipment = "Langhantel";
  else if (t.includes("kurzhantel")) equipment = "Kurzhantel";
  else if (/maschine|beinpresse/.test(t)) equipment = "Maschine";
  else if (t.includes("band")) equipment = "Widerstandsband";
  return {
    name,
    seedName: SEED_MAP[key] || null,
    category: CATEGORY_BY_MUSKEL[row.muskel] || "Sonstiges",
    muscles: MUSCLES_BY_MUSKEL[row.muskel] || [],
    equipment,
  };
}
