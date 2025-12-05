# Fehlersuche - Connect Four Debugging

## Debugging-Sitzung vom 2025-12-05

Diese Dokumentation beschreibt die angewendeten Debugging-Techniken und den Weg zur Identifikation und Behebung der Fehler.

---

## Angewendete Debugging-Techniken (nach Kernighan & Pike)

### 1. Stack-Trace analysieren (Gute Anhaltspunkte nutzen)

**Technik**: Stack-Trace lesen und Fehlerursache zurückverfolgen

**Anwendung bei FEHLER 1** (Absturz bei voller Spalte):
```
TypeError: Cannot read properties of undefined (reading '0')
    at Board.getRow (board.ts:95:30)
    at Board.horizontalWinner (board.ts:75:22)
    at Board.winner (board.ts:50:29)
    at main.ts:14:24
```

**Erkenntnisse**:
- Der Fehler tritt in `getRow()` bei Zeile 95 auf
- Aufrufkette: `main.ts` → `winner()` → `horizontalWinner()` → `getRow()`
- `this.fields[r]` ist `undefined`, was bedeutet dass `r` ein ungültiger Index ist
- Hypothese: `r` könnte negativ sein oder außerhalb des Arrays liegen

**Weiterführende Analyse**:
- Rückwärtsverfolgung: Was übergibt `main.ts:14` an `winner()`?
- Code-Inspektion zeigt: `const row = board.makeMove(player, col);` in Zeile 11
- `makeMove()` kann -1 zurückgeben (Zeile 46 in board.ts)
- Diese -1 wird direkt an `winner(player, -1, col)` übergeben

**Ursache gefunden**: Fehlende Fehlerbehandlung für `makeMove()` Rückgabewert.

---

### 2. Code-Inspektion / Lesen statt tippen

**Technik**: Code genau durchlesen und auf Muster achten

**Anwendung bei FEHLER 2** (Diagonale Gewinn-Erkennung):

**Verdächtige Stelle identifiziert**: `getDiagonals()` Methode (board.ts:108-129)

Beim genauen Durchlesen der `getDiagonals()` Methode:

```typescript
// Zeilen 118-127
for (let i = r, j = c; i < this.fields.length && j < this.fields[0].length; i++, j++) {
  falling.push(this.fields[i][j]);  // ✓ Korrekt
}
for (let i = r, j = c; i >= 0 && j >= 0; i--, j--) {
  falling.push(this.fields[i][i]);  // ❌ FEHLER! Sollte [i][j] sein!
}
```

**Erkenntnisse**:
- Zeile 126 verwendet `this.fields[i][i]` statt `this.fields[i][j]`
- **Auf bekannte Muster achten**: Dies ist ein klassischer **Copy-Paste-Fehler**
- Die Zeile darüber verwendet korrekt `[i][j]`, aber beim Kopieren wurde `j` durch `i` ersetzt
- Der Kommentar in Zeile 109 warnt sogar vor Problemen: "Woe to thee, who entered here..."

**Ursache gefunden**: Copy-Paste-Fehler führt zu falscher Array-Indizierung.

---

### 3. Test-Driven Debugging (TDD)

**Technik**: Testfall schreiben, der den Fehler reproduziert ("erfolgreich scheitern")

**Anwendung**:

#### Test für FEHLER 2 (Diagonale):
```typescript
Deno.test("diagonal winner - falling diagonal", () => {
  // Erstelle systematisch eine fallende Diagonale
  // Erwartung: Player X gewinnt
  // Tatsächlich: Player Nobody (Gewinn wird nicht erkannt)
});
```

**Resultat**: Test schlägt fehl wie erwartet
```
AssertionError: Values are not equal
    Actual: _
    Expected: x
```

#### Test für FEHLER 1 (Absturz):
```typescript
Deno.test("no crash when column is full", () => {
  // Fülle Spalte komplett
  // Versuche erneut einzufügen
  // Erwartung: Kein Absturz
  // Tatsächlich: TypeError
});
```

**Resultat**: Test stürzt ab wie erwartet
```
TypeError: Cannot read properties of undefined (reading '0')
```

**Vorteil**: Tests können nach der Korrektur erneut ausgeführt werden um zu verifizieren, dass der Fehler behoben ist.

---

### 4. Manuelles Testen / Explorative Testing

**Technik**: Programm mit verschiedenen Eingaben testen und Verhalten beobachten

**Durchgeführte Tests**:
- ✓ Valide Spielzüge (0-6)
- ✓ Buchstaben-Eingabe ("A") → `NaN` → Absturz
- ✓ Zu große Zahlen (33) → Array out of bounds
- ✓ Negative Zahlen (-1) → Absturz
- ✓ Kommazahlen (3.5) → Automatisch abgerundet (funktioniert zufällig)
- ✓ Volle Spalte → Absturz
- ✓ Gewinnbedingungen: horizontal ✓, vertikal ✓, diagonal ?

**Erkenntnisse**:
- Eingabe-Validierung fehlt komplett
- Fehlerbehandlung für Randfälle fehlt

---

### 5. Teile und Herrsche (Divide and Conquer)

**Technik**: Problem auf kleinste mögliche Eingabe reduzieren

**Anwendung bei FEHLER 2**:

Ursprünglich komplexes Spielszenario → Reduziert auf:
- Minimale Diagonale: Genau 4 Steine in einer Reihe
- Keine ablenkenden anderen Steine
- Test isoliert nur die diagonale Gewinn-Erkennung

Dies ermöglichte fokussierte Analyse der `getDiagonals()` Methode.

---

### 6. Durchspielen im Kopf / auf Papier

**Technik**: Code gedanklich oder auf Papier Schritt für Schritt durchgehen

**Anwendung bei FEHLER 2** (getDiagonals Analyse):

Gedankliches Durchspielen der Schleife in Zeile 125-127:
```
Gegeben: r=2, c=3 (Position auf dem Brett)

Iteration 1: i=2, j=3 → this.fields[2][2] ← FALSCH! Sollte [2][3] sein
Iteration 2: i=1, j=2 → this.fields[1][1] ← FALSCH! Sollte [1][2] sein
Iteration 3: i=0, j=1 → this.fields[0][0] ← FALSCH! Sollte [0][1] sein
```

**Erkenntnis**: Der Code sammelt die Diagonale von (0,0) → (1,1) → (2,2) anstatt (0,1) → (1,2) → (2,3).
Dies erklärt, warum die Gewinn-Erkennung fehlschlägt!

---

### 7. Auf unwahrscheinliche Werte achten

**Technik**: Ungewöhnliche Werte als Hinweis nutzen

**Anwendung bei FEHLER 1**:

Der Wert `-1` als Rückgabewert von `makeMove()` ist ein "Sentinel Value" (Sonderwert).
- Normalerweise gibt `makeMove()` eine Zeilennummer zurück (0-5)
- -1 signalisiert "Fehler: Spalte voll"
- Dieser Sonderwert wird nicht behandelt und führt zu ungültigem Array-Zugriff

**Lesson learned**: Sentinel Values müssen immer validiert werden vor Weitergabe!

---

### 8. Den gleichen Fehler nicht zweimal machen

**Technik**: Ähnliche Codestellen auf den gleichen Fehler prüfen

**Anwendung nach FEHLER 2**:

Nach dem Fund des Fehlers `this.fields[i][i]` in Zeile 126:
→ Überprüfung aller anderen Schleifen in `getDiagonals()`
→ Zeilen 112-117, 118-123: Verwenden korrekt `[i][j]`
→ Nur Zeile 126 betroffen

**Auch geprüft**: Ähnliche Array-Zugriffe in `getRow()` und `getCol()`
→ Diese sind korrekt implementiert

---

## Zusammenfassung der Fehlerursachen

### FEHLER 1: Absturz bei voller Spalte
- **Hauptursache**: Fehlende Validierung des Rückgabewerts von `makeMove()`
- **Sekundärursache**: `winner()` erwartet valide Zeilen-/Spaltennummern, erhält aber -1
- **Fehlende Defensive Programming**: Keine Überprüfung von Eingabeparametern

### FEHLER 2: Fehlerhafte Diagonale
- **Ursache**: Copy-Paste-Fehler in Zeile 126
- **Konkret**: `this.fields[i][i]` statt `this.fields[i][j]`
- **Folge**: Falsche Felder werden für die Gewinn-Überprüfung gesammelt

### FEHLER 3: Fehlende Input-Validierung
- **Ursache**: Keine Überprüfung der Benutzereingabe in `main.ts`
- **Folgen**: `NaN`, negative Zahlen, Out-of-bounds Zugriffe

---

## Nächster Schritt: Fehlerkorrektur

Die Fehlerursachen sind nun klar identifiziert. Im nächsten Schritt werden die Fehler korrigiert und die Tests erneut ausgeführt um zu verifizieren, dass die Korrekturen erfolgreich waren.
