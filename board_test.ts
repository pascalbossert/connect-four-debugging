import { assertEquals } from "@std/assert";
import { Board, Player } from "./board.ts";

Deno.test("dummy", () => {
  const board = new Board();
  const winner = board.winner(Player.PlayerX, 1, 1);
  assertEquals(winner, Player.Nobody);
});

// Test für FEHLER 2: Fehlerhafte diagonale Gewinn-Erkennung
Deno.test("diagonal winner - falling diagonal (top-left to bottom-right)", () => {
  const board = new Board();

  // Erstelle eine fallende Diagonale für Player X
  // Ziel-Spielbrett:
  //   0 1 2 3 4 5 6
  //   _ _ _ _ _ _ _
  //   _ _ _ _ _ _ _
  //   _ _ _ x _ _ _   <- x auf (2,3)
  //   _ _ x o _ _ _   <- x auf (3,2)
  //   _ x o o _ _ _   <- x auf (4,1)
  //   x o o o _ _ _   <- x auf (5,0) - 4 in einer Reihe diagonal!

  // Spalte 0: x (unten)
  board.makeMove(Player.PlayerX, 0); // Zeile 5, Spalte 0

  // Spalte 1: o (unten), x darüber
  board.makeMove(Player.PlayerO, 1); // Zeile 5, Spalte 1
  board.makeMove(Player.PlayerX, 1); // Zeile 4, Spalte 1

  // Spalte 2: o, o, x darüber
  board.makeMove(Player.PlayerO, 2); // Zeile 5, Spalte 2
  board.makeMove(Player.PlayerO, 2); // Zeile 4, Spalte 2
  board.makeMove(Player.PlayerX, 2); // Zeile 3, Spalte 2

  // Spalte 3: o, o, o, x darüber
  board.makeMove(Player.PlayerO, 3); // Zeile 5, Spalte 3
  board.makeMove(Player.PlayerO, 3); // Zeile 4, Spalte 3
  board.makeMove(Player.PlayerO, 3); // Zeile 3, Spalte 3
  board.makeMove(Player.PlayerX, 3); // Zeile 2, Spalte 3

  const row = 2;
  const col = 3;
  const winner = board.winner(Player.PlayerX, row, col);

  assertEquals(winner, Player.PlayerX, "Player X sollte als Gewinner erkannt werden (fallende Diagonale)");
});

// Test für FEHLER 1: Absturz bei voller Spalte
Deno.test("no crash when column is full", () => {
  const board = new Board();

  // Fülle Spalte 0 komplett (6 Steine)
  for (let i = 0; i < 6; i++) {
    const player = i % 2 === 0 ? Player.PlayerX : Player.PlayerO;
    board.makeMove(player, 0);
  }

  // Versuche noch einen Stein in die volle Spalte zu setzen
  const row = board.makeMove(Player.PlayerX, 0); // Sollte -1 zurückgeben
  assertEquals(row, -1, "makeMove sollte -1 zurückgeben bei voller Spalte");

  // Der folgende Aufruf sollte NICHT abstürzen
  const winner = board.winner(Player.PlayerX, row, 0);

  // Sollte keinen Gewinner geben
  assertEquals(winner, Player.Nobody, "Es sollte keinen Gewinner geben");
});

// Test für VERSTECKTER FEHLER: Doppelte Zählung der Startposition in Diagonalen
Deno.test("no false winner with checkerboard pattern", () => {
  const board = new Board();

  // Erstelle Schachbrettmuster:
  // x _ _ _ _ _ _
  // o x o x o x o
  // x o x o x o x

  // Untere Zeile
  board.makeMove(Player.PlayerX, 0);
  board.makeMove(Player.PlayerO, 1);
  board.makeMove(Player.PlayerX, 2);
  board.makeMove(Player.PlayerO, 3);
  board.makeMove(Player.PlayerX, 4);
  board.makeMove(Player.PlayerO, 5);
  board.makeMove(Player.PlayerX, 6);

  // Mittlere Zeile
  board.makeMove(Player.PlayerO, 0);
  board.makeMove(Player.PlayerX, 1);
  board.makeMove(Player.PlayerO, 2);
  board.makeMove(Player.PlayerX, 3);
  board.makeMove(Player.PlayerO, 4);
  board.makeMove(Player.PlayerX, 5);
  board.makeMove(Player.PlayerO, 6);

  // Dritte Zeile: nur x auf Spalte 0
  const row = board.makeMove(Player.PlayerX, 0);

  // Dieser Zug sollte NICHT als Gewinn erkannt werden
  const winner = board.winner(Player.PlayerX, row, 0);

  assertEquals(winner, Player.Nobody, "Player X sollte NICHT als Gewinner erkannt werden (keine echte 4er-Reihe)");
});
