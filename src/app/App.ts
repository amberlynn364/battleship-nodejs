import { randomInt } from 'crypto';
import { type GameService } from '../services/GameService.js';
import { type WsContext, type WsMessage, type WsController } from '../servers/interfaces.js';
import {
  type LoginPayLoad,
  type AppDeps,
  WsCommand,
  type AddUserToRoomPayload,
  type CommandFunction,
  type AddShipsPayload,
  type AttackPayload,
} from './interfaces.js';
import {
  regMessage,
  updateRoomMessage,
  updateWinnersMessage,
  createGameMessage,
  startGameMessage,
  turnMessage,
  attackResultMessage,
  finishMessage,
} from './messages.js';
import { type Ship } from '../game/ship.js';
import { type ShipData } from '../services/interfaces.js';
import { type Game } from '../game/game.js';
import { BOT_ID, BOT_MAX_TIMEOUT, BOT_MIN_TIMEOUT } from '../config/config.js';
import { GameStatus } from '../game/interfaces.js';

export class App implements WsController {
  private readonly gameService: GameService;

  private readonly wsCommands: Array<keyof this> = [
    WsCommand.Reg,
    WsCommand.SinglePlay,
    WsCommand.CreateRoom,
    WsCommand.AddUserToRoom,
    WsCommand.AddShips,
    WsCommand.Attack,
    WsCommand.RandomAttack,
  ];

  constructor({ gameService }: AppDeps) {
    this.gameService = gameService;
  }

  public handleMessage = ({ type, data }: WsMessage, context: WsContext): void => {
    const isValidCommand = (this.wsCommands as string[]).includes(type);
    if (!isValidCommand) throw new Error(`Invalid message type: ${type}`);
    const command = this[type as keyof this] as CommandFunction;
    command.call(this, data, context);
  };

  public handleClose(context: WsContext): void {
    const { closeRooms, closedGames } = this.gameService.logout(context.id);
    if (closeRooms.length) {
      const rooms = this.gameService.getRooms();
      context.broadcast(updateRoomMessage(rooms));
    }
    closedGames.forEach((game) => {
      const { gameWinner, gamePlayers } = game;
      if (gameWinner) {
        context.broadcast(finishMessage(gameWinner), gamePlayers);
      }
    });
    if (closedGames.length) {
      const winners = this.gameService.getWinners();
      context.broadcast(updateWinnersMessage(winners));
    }
  }

  public reg(data: unknown, context: WsContext): void {
    const loginPayLoad = data as LoginPayLoad;

    try {
      const player = this.gameService.login(context.id, loginPayLoad);
      context.send(regMessage(player));

      const winners = this.gameService.getWinners();
      context.send(updateWinnersMessage(winners));

      const rooms = this.gameService.getRooms();
      context.send(updateRoomMessage(rooms));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      context.send(regMessage({ id: context.id, name: loginPayLoad.name }, message));
    }
  }

  public single_play(_: unknown, context: WsContext): void {
    console.log(1);
    const game = this.gameService.startSinglePlayer(context.id);
    context.send(createGameMessage(game.gameID, context.id));

    const rooms = this.gameService.getRooms();
    context.broadcast(updateRoomMessage(rooms));
  }

  public create_room(_: unknown, context: WsContext): void {
    this.gameService.createRoom(context.id);

    const rooms = this.gameService.getRooms();
    context.broadcast(updateRoomMessage(rooms));
  }

  public add_user_to_room(data: unknown, context: WsContext): void {
    const { indexRoom } = data as AddUserToRoomPayload;

    const game = this.gameService.joinToRoom(indexRoom, context.id);
    if (!game) return;

    game.gamePlayers.forEach((playerID) => {
      context.broadcast(createGameMessage(game.gameID, playerID), playerID);
    });

    const rooms = this.gameService.getRooms();
    context.broadcast(updateRoomMessage(rooms));
  }

  public add_ships(data: unknown, context: WsContext): void {
    const { gameId, ships, indexPlayer } = data as AddShipsPayload;

    const game = this.gameService.addShips(gameId, indexPlayer, ships);
    if (!game) throw new Error('Game not found');
    const { currentPlayer, currentShip, enemyPlayer, enemyShip } = game;
    const startGameMessageArr = [
      { player: currentPlayer, ship: currentShip },
      { player: enemyPlayer, ship: enemyShip },
    ];
    startGameMessageArr.map(({ player, ship }) => {
      context.broadcast(
        startGameMessage(
          player,
          ship.map((item) => this.getShipData(item))
        ),
        player
      );
      return undefined;
    });

    context.broadcast(turnMessage(currentPlayer), [currentPlayer, enemyPlayer]);
    if (currentPlayer === BOT_ID) this.botAttack(gameId, context);
  }

  public attack(data: unknown, context: WsContext): void {
    const { gameId, x, y, indexPlayer } = data as AttackPayload;

    const position = x === undefined || y === undefined ? undefined : { x, y };
    const { game, results } = this.gameService.attack(gameId, indexPlayer, position);
    context.broadcast(attackResultMessage(results), game.gamePlayers);
    context.broadcast(turnMessage(game.currentPlayer), game.gamePlayers);

    if (game.gameStatus === GameStatus.Started && game.currentPlayer === BOT_ID) this.botAttack(gameId, context);

    if (!game.gameWinner) return undefined;
    context.broadcast(finishMessage(game.gameWinner), game.gamePlayers);

    return undefined;
  }

  public randomAttack(data: unknown, context: WsContext): void {
    this.attack(data, context);
  }

  private getShipData({ shipPosition, shipLength, shipIsVertical }: Ship): ShipData {
    const shipType = ['small', 'medium', 'large', 'huge'][shipLength - 1] ?? 'unknown';
    return {
      position: shipPosition,
      length: shipLength,
      direction: shipIsVertical,
      type: shipType,
    };
  }

  private botAttack(gameID: Game['id'], context: WsContext): void {
    const timeout = randomInt(BOT_MIN_TIMEOUT, BOT_MAX_TIMEOUT);
    setTimeout(() => {
      this.randomAttack({ gameId: gameID, indexPlayer: BOT_ID }, context);
    }, timeout);
  }
}
