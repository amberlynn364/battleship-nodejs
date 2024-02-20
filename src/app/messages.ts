import { type UpdateRoomPayload, WsCommand, type LoginResultPayload } from './interfaces.js';
import { type WsMessage } from '../servers/interfaces.js';
import { type Room, type Player } from '../services/interfaces.js';

const createMessage = <T>(type: WsCommand, data: T): WsMessage<T> => ({ type, data, id: 0 });

export const regMessage = (player: Partial<Player> | null, errorMessage?: string): WsMessage =>
  createMessage<LoginResultPayload>(WsCommand.Reg, {
    index: player?.id ?? -1,
    name: player?.name ?? '',
    error: Boolean(errorMessage),
    errorText: errorMessage ?? '',
  });

export const updateWinnersMessage = (players: Player[]): WsMessage =>
  createMessage(
    WsCommand.UpdateWinners,
    players.map(({ name, wins }) => ({ name, wins }))
  );

export const updateRoomMessage = (rooms: Room[]): WsMessage =>
  createMessage<UpdateRoomPayload>(
    WsCommand.UpdateRoom,
    rooms.map(({ id, playerID, playerName }) => ({
      roomID: id,
      roomUsers: [{ index: playerID, name: playerName }],
    }))
  );
