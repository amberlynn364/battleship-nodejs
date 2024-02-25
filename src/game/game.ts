import { BOARD_SIZE } from '../config/config.js';
import { randomID } from '../utils/randomID.js';
import { Board } from './board.js';
import { type AttackResult, GameStatus, type Position, AttackStatus } from './interfaces.js';
import { type Ship } from './ship.js';

export class Game {
  private readonly id: number;

  private readonly boards: [Board<boolean>, Board<boolean>];

  private readonly ships: [Ship[], Ship[]] = [[], []];

  private winner?: number;

  private currentIndex = 0;

  constructor(
    private readonly players: [number, number] = [0, 1],
    boardSize = BOARD_SIZE
  ) {
    this.id = randomID();
    this.boards = [new Board(boardSize), new Board(boardSize)];
  }

  public get gameID(): number {
    return this.id;
  }

  public get gamePlayers(): [number, number] {
    return [...this.players];
  }

  public get currentPlayer(): number {
    return this.players[this.currentIndex];
  }

  public get enemyPlayer(): number {
    return this.players[this.enemyIndex];
  }

  public get currentShip(): Ship[] {
    return this.privateCurrentShips;
  }

  public get enemyShip(): Ship[] {
    return this.privateEnemyShips;
  }

  public get gameWinner(): number | undefined {
    return this.winner;
  }

  public get gameStatus(): GameStatus {
    if (this.winner) return GameStatus.Finished;
    if (this.privateCurrentShips.length && this.privateEnemyShips.length) return GameStatus.Started;
    return GameStatus.Created;
  }

  public setShips(player: number, ships: Ship[]): void {
    if (this.gameStatus === GameStatus.Finished) throw new Error('Game already finished');

    const playerIndex = this.getPlayerIndex(player);
    if (playerIndex === -1) throw new Error('Player not found');
    if (this.ships[playerIndex].length) throw new Error('Ship already placed');
    this.ships[playerIndex] = ships;
    this.currentIndex = Math.round(Math.random());
  }

  public attack(player: number, pos?: Position): AttackResult[] {
    if (player !== this.currentPlayer) return [];
    const position = pos ?? this.enemyBoard.getRandomEmptyPosition();
    if (!position) throw new Error('Random attack failed');
    if (!this.enemyBoard.isEmptyPosition(position)) return [];
    let damagedShip: Ship | null = null;
    for (let i = 0; i < this.privateEnemyShips.length; i += 1) {
      const ship = this.privateEnemyShips[i];
      if (ship.getShot(position)) {
        damagedShip = ship;
        break;
      }
    }
    if (!damagedShip) {
      this.enemyBoard.setValue(position, false);
      this.switchPlayer();
      return [{ currentPlayer: player, status: AttackStatus.Miss, position }];
    }

    if (!damagedShip.isShipDestroyed()) {
      this.enemyBoard.setValue(position, true);
      return [{ currentPlayer: player, status: AttackStatus.Shot, position }];
    }

    const damagedShipDeckPosition = damagedShip.shipPositions.filter((item) =>
      this.enemyBoard.isFieldInsideBoard(item)
    );

    const damagedShipAroundPosition = damagedShip.shipAroundPositions.filter((item) =>
      this.enemyBoard.isFieldInsideBoard(item)
    );

    damagedShipDeckPosition.forEach((item) => {
      this.enemyBoard.setValue(item, true);
    });

    damagedShipAroundPosition.forEach((item) => {
      this.enemyBoard.setValue(item, false);
    });

    this.getAWinner();

    return [
      ...damagedShipDeckPosition.map((item) => ({
        currentPlayer: player,
        status: AttackStatus.Killed,
        position: item,
      })),
      ...damagedShipAroundPosition.map((item) => ({
        currentPlayer: player,
        status: AttackStatus.Miss,
        position: item,
      })),
    ];
  }

  private get enemyIndex(): number {
    return (this.currentIndex + 1) % 2;
  }

  private get privateCurrentShips(): Ship[] {
    return this.ships[this.currentIndex];
  }

  private get privateEnemyShips(): Ship[] {
    return this.ships[this.enemyIndex];
  }

  private get currentBoard(): Board<boolean> {
    return this.boards[this.currentIndex];
  }

  private get enemyBoard(): Board<boolean> {
    return this.boards[this.enemyIndex];
  }

  private switchPlayer(): void {
    this.currentIndex = this.enemyIndex;
  }

  private getAWinner(): void {
    if (this.privateEnemyShips.every((ship) => ship.isShipDestroyed())) this.winner = this.currentPlayer;
    if (this.privateCurrentShips.every((ship) => ship.isShipDestroyed())) this.winner = this.enemyPlayer;
  }

  private getPlayerIndex(player: number): number {
    return this.players.findIndex((item) => item === player);
  }
}
