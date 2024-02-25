import { HTTP_PORT } from './config/config.js';
import { DataBase } from './db/database.js';
import { GameService } from './services/GameService.js';
import { App } from './app/App.js';
import { WsServer } from './servers/wsServer.js';
import { httpServer } from './servers/httpServer.js';
import { type Room, type Player } from './services/interfaces.js';

const playersDB = new DataBase<Player>();
const roomsDB = new DataBase<Room>();
const gameService = new GameService({ playersDB, roomsDB });
const app = new App({ gameService });

new WsServer({ server: httpServer, controller: app });

httpServer.listen(HTTP_PORT, () => {
  console.log('Http server is running on', `http://localhost:${HTTP_PORT}`);
  console.log('Websocket server is running on', `ws://localhost:${HTTP_PORT}`);
});
