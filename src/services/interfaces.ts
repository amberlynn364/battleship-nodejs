import { type DataBase } from '../db/database.js';
import { type Game } from '../game/game.js';
import { type AttackResult, type Position } from '../game/interfaces.js';

export interface Player {
  id: number;
  name: string;
  password: string;
  wins: number;
}

export interface Room {
  id: number;
  playerID: Player['id'];
  playerName: Player['name'];
}

export type LoginData = Pick<Player, 'name' | 'password'>;

export interface Ship {
  position: string;
  direction: boolean;
  length: number;
  type: string;
}

export interface ShipData {
  position: Position;
  direction: boolean;
  length: number;
  type: string;
}

export interface GameServiceDeps {
  playersDB: DataBase<Player>;
  roomsDB: DataBase<Room>;
}

export interface gameServiceAttackPayload {
  game: Game;
  results: AttackResult[];
}
