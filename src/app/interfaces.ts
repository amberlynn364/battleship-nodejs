import { type AttackStatus, type Position } from '../game/interfaces.js';
import { type WsContext } from '../servers/interfaces.js';
import { type GameService } from '../services/GameService.js';
import { type ShipData } from '../services/interfaces.js';

export interface AppDeps {
  gameService: GameService;
}

export interface LoginPayLoad {
  name: string;
  password: string;
}

export interface LoginResultPayload {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}

export enum WsCommand {
  Reg = 'reg',
  SinglePlay = 'single_play',
  CreateRoom = 'create_room',
  AddUserToRoom = 'add_user_to_room',
  AddShips = 'add_ships',
  Attack = 'attack',
  RandomAttack = 'randomAttack',
}

export enum Messages {
  Reg = 'reg',
  UpdateWinners = 'update_winners',
  UpdateRoom = 'update_room',
  CreateGame = 'create_game',
  StartGame = 'start_game',
  Turn = 'turn',
  Finish = 'finish',
  Attack = 'attack',
}

export type CommandFunction = (data: unknown, context: WsContext) => void;

export type UpdateRoomPayload = Record<
  number,
  {
    roomId: number;
    roomUsers: Array<{ name: string; index: number }>;
  }
>;

export interface AddUserToRoomPayload {
  indexRoom: number;
}

export interface CreateGamePayload {
  idGame: number;
  idPlayer: number;
}

export interface AddShipsPayload {
  gameId: number;
  ships: ShipData[];
  indexPlayer: number;
}

export interface StartGamePayload {
  ships: ShipData[];
  currentPlayerIndex: number;
}

export interface TurnPayload {
  currentPlayer: number;
}

export interface AttackPayload {
  gameId: number;
  x: Position['x'];
  y: Position['y'];
  indexPlayer: number;
}

export interface AttackResultPayload {
  position: Position;
  currentPlayer: number;
  status: AttackStatus;
}
