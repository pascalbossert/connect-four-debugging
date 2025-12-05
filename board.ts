const ROWS: number = 6;
const COLS: number = 7;
const CONNECT_N: number = 4;

export enum Player {
  Nobody = "_",
  PlayerX = "x",
  PlayerO = "o",
}

export class Board {
  private fields: Array<Array<Player>>;

  public constructor() {
    this.fields = Array(ROWS);
    for (let r = 0; r < this.fields.length; r++) {
      this.fields[r] = Array(COLS);
      for (let c = 0; c < this.fields[r].length; c++) {
        this.fields[r][c] = Player.Nobody;
      }
    }
  }

  public output() {
    let cols = "";
    for (let c = 0; c < this.fields[0].length; c++) {
      cols += `${c} `;
    }
    console.log(cols.trimEnd());
    for (let r = 0; r < this.fields.length; r++) {
      let row = "";
      for (let c = 0; c < this.fields[r].length; c++) {
        row += `${this.fields[r][c]} `;
      }
      console.log(row.trimEnd());
    }
  }

  public makeMove(player: Player, col: number): number {
    for (let r = this.fields.length - 1; r >= 0; r--) {
      if (this.fields[r][col] == Player.Nobody) {
        this.fields[r][col] = player;
        return r;
      }
    }
    return -1;
  }

  public winner(player: Player, row: number, col: number): Player {
    // Defensive: Validiere Eingabeparameter
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
      return Player.Nobody;
    }

    const horizontal = this.horizontalWinner(player, row);
    if (horizontal != Player.Nobody) {
      return horizontal;
    }
    const vertical = this.verticalWinner(player, col);
    if (vertical != Player.Nobody) {
      return vertical;
    }
    const diagonal = this.diagonalWinner(player, row, col);
    if (diagonal != Player.Nobody) {
      return diagonal;
    }
    return Player.Nobody;
  }

  private verticalWinner(player: Player, r: number): Player {
    const col = this.getCol(r);
    const win = player.repeat(CONNECT_N);
    if (col.join("").includes(win)) {
      return player;
    }
    return Player.Nobody;
  }

  private horizontalWinner(player: Player, r: number): Player {
    const row = this.getRow(r);
    const win = player.repeat(CONNECT_N);
    if (row.join("").includes(win)) {
      return player;
    }
    return Player.Nobody;
  }

  private diagonalWinner(player: Player, r: number, c: number): Player {
    const [diagUp, diagDown] = this.getDiagonals(r, c);
    const win = player.repeat(CONNECT_N);
    if (diagUp.includes(win) || diagDown.includes(win)) {
      return player;
    }
    return Player.Nobody;
  }

  private getRow(r: number): Array<string> {
    const row: Array<string> = new Array(COLS);
    for (let i = 0; i < row.length; i++) {
      row[i] = this.fields[r][i];
    }
    return row;
  }

  private getCol(c: number): Array<string> {
    const col: Array<string> = new Array(ROWS);
    for (let i = 0; i < col.length; i++) {
      col[i] = this.fields[i][c];
    }
    return col;
  }

  private getDiagonals(r: number, c: number): [string, string] {
    // Woe to thee, who entered here, for you dug too deep and unearthed daemons of the otherworld!
    const rising: Array<string> = [];
    const falling: Array<string> = [];

    // Rising diagonal: / (von unten-links nach oben-rechts)
    // Zuerst nach oben-rechts von (r,c)
    for (let i = r, j = c; i >= 0 && j < this.fields[0].length; i--, j++) {
      rising.push(this.fields[i][j]);
    }
    // Dann nach unten-links ab (r+1, c-1) - NICHT (r,c) um Duplikate zu vermeiden!
    for (let i = r + 1, j = c - 1; i < this.fields.length && j >= 0; i++, j--) {
      rising.push(this.fields[i][j]);
    }

    // Falling diagonal: \ (von oben-links nach unten-rechts)
    // Zuerst nach unten-rechts von (r,c)
    for (
      let i = r, j = c;
      i < this.fields.length && j < this.fields[0].length;
      i++, j++
    ) {
      falling.push(this.fields[i][j]);
    }
    // Dann nach oben-links ab (r-1, c-1) - NICHT (r,c) um Duplikate zu vermeiden!
    for (let i = r - 1, j = c - 1; i >= 0 && j >= 0; i--, j--) {
      falling.push(this.fields[i][j]);
    }

    const risingStr = rising.join("");
    const fallingStr = falling.join("");
    console.log(`DEBUG getDiagonals(${r}, ${c}):`);
    console.log(`  rising:  "${risingStr}" (length: ${rising.length})`);
    console.log(`  falling: "${fallingStr}" (length: ${falling.length})`);
    return [risingStr, fallingStr];
  }
}
