import { Board, Player } from "./board.ts";

const board = new Board();
let player = Player.PlayerX;

board.output();

while (true) {
  const input = prompt(`Player ${player}:`) || "";
  const col = Number.parseInt(input);

  // Input-Validierung
  if (Number.isNaN(col) || col < 0 || col > 6) {
    console.log("Invalid input! Please enter a number between 0 and 6.");
    continue;
  }

  const row = board.makeMove(player, col);

  // Prüfen ob der Zug erfolgreich war
  if (row === -1) {
    console.log("Column is full! Please choose another column.");
    continue;
  }

  board.output();
  console.log();
  const winner = board.winner(player, row, col);
  if (winner != Player.Nobody) {
    console.log(`Player ${player}: A winner is you!`);
    break;
  }
  player = player == Player.PlayerX ? Player.PlayerO : Player.PlayerX;
}
