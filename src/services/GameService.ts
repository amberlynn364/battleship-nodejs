import { type DataBase } from '../db/database.js';
import { comparePassword, passHash } from '../utils/passHash.js';
import { type Room, type Player, type GameServiceDeps, type LoginData } from './interfaces.js';

export class GameService {
  private readonly playersDB: DataBase<Player>;

  private readonly roomsDB: DataBase<Room>;

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

  public getWinners(): Player[] {
    return Array.from(this.playersDB.findAllData())
      .filter((player) => player.wins)
      .sort((a, b) => b.wins - a.wins);
  }

  public getRooms(): Room[] {
    return Array.from(this.roomsDB.findAllData());
  }
}
