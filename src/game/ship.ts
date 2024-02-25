import { type Position } from './interfaces.js';

export class Ship {
  private readonly positions: Position[];

  private readonly aroundPositions: Position[];

  private readonly health: boolean[];

  constructor(
    private readonly position: Position,
    private readonly length: number,
    private readonly isVertical: boolean
  ) {
    this.positions = this.getPositions();
    this.aroundPositions = this.getAroundPositions();
    this.health = Array(length).fill(true);
  }

  public get shipPosition(): Position {
    return this.position;
  }

  public get shipPositions(): Position[] {
    return this.positions;
  }

  public get shipAroundPositions(): Position[] {
    return this.aroundPositions;
  }

  public get shipLength(): number {
    return this.length;
  }

  public get shipIsVertical(): boolean {
    return this.isVertical;
  }

  public getShot(position: Position): boolean {
    if (!this.isShip(position)) return false;
    const pos = this.isVertical ? position.y - this.position.y : position.x - this.position.x;
    this.health[pos] = false;
    return true;
  }

  public isShip({ x, y }: Position): boolean {
    const posX = x - this.position.x;
    const posY = y - this.position.y;
    return this.isVertical
      ? posX === 0 && posY >= 0 && posY < this.length
      : posY === 0 && posX >= 0 && posX < this.length;
  }

  public isShipDestroyed(): boolean {
    return this.health.every((item) => !item);
  }

  private getPositions(): Position[] {
    const { x, y } = this.position;
    const positions: Position[] = [];
    for (let i = 0; i < this.length; i += 1) {
      positions.push(this.isVertical ? { x, y: y + i } : { x: x + i, y });
    }
    return positions;
  }

  private getAroundPositions(): Position[] {
    const { x, y } = this.position;
    const topLeft = { x: x - 1, y: y - 1 };
    const bottomRight = this.isVertical ? { x: x + 1, y: y + this.length } : { x: x + this.length, y: y + 1 };

    const positions: Position[] = [];
    for (let posY = topLeft.y; posY <= bottomRight.y; posY += 1) {
      for (let posX = topLeft.x; posX <= bottomRight.x; posX += 1) {
        if (!this.isShip({ x: posX, y: posY })) {
          positions.push({ x: posX, y: posY });
        }
      }
    }
    return positions;
  }
}
