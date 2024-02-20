import { type WsContext } from '../servers/interfaces.js';
import { type GameService } from '../services/GameService.js';

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
  UpdateWinners = 'update_winners',
  UpdateRoom = 'update_room',
}

export type UpdateRoomPayload = Record<
  number,
  {
    roomID: number;
    roomUsers: Array<{ name: string; index: number }>;
  }
>;

export type CommandFunction = (data: unknown, context: WsContext) => void;
