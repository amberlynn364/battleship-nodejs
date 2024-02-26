import { BOT_ID } from '../config/config.js';
import { type DataBase } from '../db/database.js';
import { Game } from '../game/game.js';
import { GameStatus, type Position } from '../game/interfaces.js';
import { Ship } from '../game/ship.js';
import { comparePassword, passHash } from '../utils/passHash.js';
import { randomID } from '../utils/randomID.js';
import {
  type Room,
  type Player,
  type GameServiceDeps,
  type LoginData,
  type ShipData,
  type gameServiceAttackPayload,
  type LogoutPayload,
} from './interfaces.js';

export class GameService {
  private readonly playersDB: DataBase<Player>;

  private readonly roomsDB: DataBase<Room>;

  private readonly games = new Map<Game['id'], Game>();

  constructor({ playersDB, roomsDB }: GameServiceDeps) {
    this.playersDB = playersDB;
    this.roomsDB = roomsDB;
  }

  public login(id: Player['id'], loginData: LoginData): Player {
    const { name, password } = loginData;
    const player = this.playersDB.findItemInDataByField('name', name);

    if (!player) {
      return this.playersDB.createData({
        id,
        name,
        password: passHash(password),
        wins: 0,
      });
    }

    if (!comparePassword(password, player.password)) {
      throw new Error('Invalid password');
    }
    this.playersDB.updateData(player.id, { id });
    return player;
  }

  public logout(playerID: Player['id']): LogoutPayload {
    const rooms = this.roomsDB.findItemsInDataByField('playerID', playerID);
    const closeRooms = rooms.map((room) => this.roomsDB.deleteData(room.id));

    const closedGames: Game[] = [];
    this.games.forEach((game) => {
      if (game.gamePlayers.includes(playerID)) {
        game.giveUp(playerID);
        this.closeFinishedGame(game);
        closedGames.push(game);
      }
    });

    return { closedGames, closeRooms };
  }

  public getWinners(): Player[] {
    return Array.from(this.playersDB.findAllData())
      .filter((player) => player.wins)
      .sort((a, b) => b.wins - a.wins);
  }

  public getRooms(): Room[] {
    return Array.from(this.roomsDB.findAllData());
  }

  public startSinglePlayer(playerID: Player['id']): Game {
    const player = this.playersDB.findDataByID(playerID);
    if (!player) throw new Error('Player not found!');
    const roomsToDelete = this.roomsDB.findItemsInDataByField('playerID', playerID);
    roomsToDelete.forEach(({ id }) => this.roomsDB.deleteData(id));

    const game = new Game([BOT_ID, playerID]);
    this.games.set(game.gameID, game);
    game.setBotShips(BOT_ID);
    return game;
  }

  public createRoom(playerID: Player['id']): Room {
    const player = this.playersDB.findDataByID(playerID);
    if (!player) throw new Error('Player not found');

    if (this.roomsDB.findItemInDataByField('playerID', playerID)) {
      throw new Error('Room already exist');
    }

    return this.roomsDB.createData({
      id: randomID(),
      playerID: player.id,
      playerName: player.name,
    });
  }

  public joinToRoom(roomID: Room['id'], playerID: Player['id']): Game | null {
    const room = this.roomsDB.findDataByID(roomID);
    if (!room) throw new Error('Room not found');
    if (room.playerID === playerID) return null;

    const player = this.playersDB.findDataByID(playerID);
    if (!player) throw new Error('Player not found');

    this.roomsDB.deleteData(roomID);
    const roomsToDelete = this.roomsDB.findItemsInDataByField('playerID', playerID);
    roomsToDelete.forEach(({ id }) => this.roomsDB.deleteData(id));

    const game = new Game([room.playerID, playerID]);
    this.games.set(game.gameID, game);
    return game;
  }

  public addShips(gameID: Game['id'], playerID: Player['id'], shipsData: ShipData[]): Game | null {
    const game = this.games.get(gameID);
    if (!game) return null;

    game.setShips(
      playerID,
      shipsData.map(({ position, length, direction }) => new Ship(position, length, direction))
    );

    return game.gameStatus === GameStatus.Started ? game : null;
  }

  public attack(gameID: Game['id'], playerID: Player['id'], position?: Position): gameServiceAttackPayload {
    const game = this.games.get(gameID);
    if (!game) throw new Error('Game not found');

    const results = game.attack(playerID, position);
    if (game.gameStatus === GameStatus.Finished) this.closeFinishedGame(game);

    return { game, results };
  }

  private closeFinishedGame(game: Game): boolean {
    if (!game.gameWinner) return false;
    this.games.delete(game.gameID);
    if (game.gameWinner === BOT_ID) return true;
    const winner = this.playersDB.findDataByID(game.gameWinner);
    this.playersDB.updateData(game.gameWinner, winner ? { wins: winner.wins + 1 } : {});
    return true;
  }
}
