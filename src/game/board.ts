import { randomInt } from 'crypto';
import { BOARD_SIZE } from '../config/config.js';
import { type Position } from './interfaces.js';

export class Board<T> {
  private readonly values: Array<Array<T | null>>;

  constructor(private readonly boardSize = BOARD_SIZE) {
    this.values = this.createValues(null);
  }

  get size(): number {
    return this.boardSize;
  }

  public getValue(position: Position): T | null | undefined {
    const { x, y } = position;
    if (this.isFieldOutsideBoard(position)) return undefined;
    return this.values[y][x];
  }

  public setValue(position: Position, value: T | null): void {
    const { x, y } = position;
    if (this.isFieldOutsideBoard(position)) return undefined;
    this.values[y][x] = value;
    return undefined;
  }

  public isFieldInsideBoard({ x, y }: Position): boolean {
    return x >= 0 && x < this.boardSize && y >= 0 && y < this.boardSize;
  }

  public isFieldOutsideBoard(position: Position): boolean {
    return !this.isFieldInsideBoard(position);
  }

  public isEmptyPosition(position: Position): boolean {
    return this.getValue(position) === null;
  }

  public getEmptyPositions(): Position[] {
    const positions: Position[] = [];
    for (let i = 0; i < this.boardSize; i += 1) {
      for (let j = 0; j < this.boardSize; j += 1) {
        if (this.values[i][j] === null) positions.push({ x: j, y: i });
      }
    }
    return positions;
  }

  public getRandomEmptyPosition(): Position | null {
    const positions = this.getEmptyPositions();
    if (!positions.length) return null;
    const randomIndex = randomInt(positions.length);
    return positions[randomIndex];
  }

  private createValues(value: T | null): Array<Array<T | null>> {
    return Array(this.boardSize)
      .fill(null)
      .map(() => Array(this.boardSize).fill(value));
  }
}
