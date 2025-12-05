# Testprotokoll - Connect Four Debugging

## Debugging-Sitzung vom 2025-12-05

### Durchgeführte manuelle Tests:

#### **Valide Eingaben:**
- Spalten 0-6: Steine werden korrekt platziert
- Abwechselnde Spieler: x und o wechseln sich ab
- Mehrere Züge in dieselbe Spalte: Steine stapeln sich korrekt nach oben

#### **Invalide Eingaben:**
- Negative Zahlen (-1, -5): Programm stürzt ab ⚠️
- Zahlen außerhalb des gültigen Bereichs (7, 33, 100): Array-Fehler
- Buchstaben ("A", "abc"): `NaN` führt zu unerwartetem Verhalten
- Leere Eingabe (Enter): Wird als leerer String behandelt
- Kommazahlen (3.5, 2.7): Werden automatisch abgerundet (funktioniert)

#### **Randfälle:**
- Volle Spalte: Weiterer Einsatz in volle Spalte führt zum Absturz ⚠️
- Erstes Spielfeld: Sofortiger Start funktioniert
- Vollständig gefülltes Brett: Nicht getestet (Spiel endet vorher bei Gewinn)

#### **Gewinnbedingungen:**
- **Horizontal**: 4 in einer Reihe wird erkannt ✓
- **Vertikal**: 4 in einer Spalte wird erkannt ✓
- **Diagonal aufsteigend**: Nicht ausführlich getestet
- **Diagonal fallend**: Möglicher Fehler vermutet 🔍

#### **Spiellogik:**
- Spieler blockieren gegnerische 4er-Reihe: Funktioniert ✓
- Gewinnmeldung: "A winner is you!" wird angezeigt ✓
- Spiel endet nach Gewinn: Funktioniert ✓

**Automatisierte Tests**: `deno test` = ✓ 1 passed | 0 failed (8ms)

---

## Gefundene Fehler

### FEHLER 1: Programmabsturz bei voller Spalte oder negativer Eingabe ⚠️

**Kategorie**: Programmabsturz (Kritisch)

**Beschreibung**:
Das Programm stürzt ab, wenn eine Spalte bereits voll ist oder eine negative Zahl eingegeben wird.

**Reproduktion**:
1. Fülle eine Spalte komplett (z.B. Spalte 3: sechsmal "3" eingeben)
2. Versuche erneut in diese Spalte zu setzen
3. Programm stürzt ab

Oder:
1. Gib "-1" als Spaltennummer ein
2. Programm stürzt ab

**Spielbrett-Zustand (Beispiel volle Spalte 3)**:
```
0 1 2 3 4 5 6
_ _ _ x _ _ _
_ _ _ o _ _ _
_ _ _ x _ _ _
_ _ _ o _ _ _
_ _ _ x _ _ _
_ _ _ o _ _ _
```
Eingabe: `3` (Spalte ist voll)

**Fehlerausgabe**:
```
TypeError: Cannot read properties of undefined (reading '0')
    at Board.getRow (board.ts:95:30)
    at Board.horizontalWinner (board.ts:75:22)
    at Board.winner (board.ts:50:29)
    at main.ts:14:24
```

**Ursache**:
- `makeMove()` gibt -1 zurück wenn Spalte voll ist
- Diese -1 wird direkt an `winner(player, -1, col)` übergeben
- `getRow(-1)` versucht auf `this.fields[-1]` zuzugreifen → `undefined`

---

### FEHLER 2: Fehlerhafte diagonale Gewinn-Erkennung 🎯

**Kategorie**: Spiellogik-Fehler (Kritisch)

**Beschreibung**:
Die Erkennung von diagonalen Gewinnreihen funktioniert nicht korrekt. In bestimmten Fällen werden diagonale Vier-in-einer-Reihe nicht erkannt oder fälschlicherweise erkannt.

**Reproduktion**:
Erstelle eine diagonale Vier-in-einer-Reihe (fallende Diagonale von oben-rechts nach unten-links) und beobachte, ob der Gewinn korrekt erkannt wird.

**Beispiel-Spielbrett**:
```
0 1 2 3 4 5 6
_ _ _ x _ _ _
_ _ x o _ _ _
_ x o x _ _ _
x o x o _ _ _
o x o x _ _ _
x o x o _ _ _
```

**Ursache**:
In `board.ts:126` steht `this.fields[i][i]` statt `this.fields[i][j]`
- Copy-Paste-Fehler: falsche Variable verwendet
- Die Zeile sammelt die falschen Felder für die fallende Diagonale

---

### FEHLER 3: Keine Validierung von Benutzereingaben ⚠️

**Kategorie**: Input-Validierung fehlt

**Beschreibung**:
Das Programm validiert Benutzereingaben nicht. Ungültige Eingaben führen zu unerwartetem Verhalten oder Abstürzen.

**Getestete invalide Eingaben**:
- **Buchstaben** ("A"): `parseInt()` gibt `NaN` zurück → Array-Zugriff mit `NaN`
- **Zu große Zahlen** (33): Zugriff außerhalb des Arrays → `undefined`
- **Negative Zahlen** (-1): Siehe Fehler 1
- **Kommazahlen** (3.5): Werden automatisch abgerundet (funktioniert zufällig)

**Erwartetes Verhalten**:
Fehlermeldung und erneute Eingabeaufforderung bei ungültigen Werten.

**Tatsächliches Verhalten**:
Absturz oder unerwartetes Verhalten.

---

## Zusammenfassung

**Gefundene Fehler**: 3
- **Kritisch**: 2 (Absturz, Spiellogik)
- **Wichtig**: 1 (Input-Validierung)

**Nächste Schritte**:
Test-Driven Debugging für Fehler 1 und 2 durchführen.
