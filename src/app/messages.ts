import {
  type UpdateRoomPayload,
  type LoginResultPayload,
  type CreateGamePayload,
  Messages,
  type StartGamePayload,
  type TurnPayload,
  type AttackResultPayload,
} from './interfaces.js';
import { type WsMessage } from '../servers/interfaces.js';
import { type Room, type Player, type ShipData } from '../services/interfaces.js';
import { type Game } from '../game/game.js';

const createMessage = <T>(type: Messages, data: T): WsMessage<T> => ({ type, data, id: 0 });

export const regMessage = (player: Partial<Player> | null, errorMessage?: string): WsMessage =>
  createMessage<LoginResultPayload>(Messages.Reg, {
    index: player?.id ?? -1,
    name: player?.name ?? '',
    error: Boolean(errorMessage),
    errorText: errorMessage ?? '',
  });

export const updateWinnersMessage = (players: Player[]): WsMessage =>
  createMessage(
    Messages.UpdateWinners,
    players.map(({ name, wins }) => ({ name, wins }))
  );

export const updateRoomMessage = (rooms: Room[]): WsMessage =>
  createMessage<UpdateRoomPayload>(
    Messages.UpdateRoom,
    rooms.map(({ id, playerID, playerName }) => ({
      roomId: id,
      roomUsers: [{ index: playerID, name: playerName }],
    }))
  );

export const createGameMessage = (gameID: Game['id'], playerID: Player['id']): WsMessage =>
  createMessage<CreateGamePayload>(Messages.CreateGame, { idGame: gameID, idPlayer: playerID });

export const startGameMessage = (currentPlayerIndex: Player['id'], ships: ShipData[]): WsMessage =>
  createMessage<StartGamePayload>(Messages.StartGame, {
    ships,
    currentPlayerIndex,
  });

export const turnMessage = (currentPlayer: Player['id']): WsMessage =>
  createMessage<TurnPayload>(Messages.Turn, { currentPlayer });

export const attackResultMessage = (results: AttackResultPayload[]): WsMessage[] =>
  results.map((result) => createMessage<AttackResultPayload>(Messages.Attack, result));

export const finishMessage = (winner: Player['id']): WsMessage => createMessage(Messages.Finish, { winPlayer: winner });
