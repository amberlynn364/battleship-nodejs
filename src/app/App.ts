import { type WsContext, type WsMessage, type WsController } from '../servers/interfaces.js';
import { type GameService } from '../services/GameService.js';
import { type LoginPayLoad, type AppDeps, WsCommand, type CommandFunction } from './interfaces.js';
import { regMessage, updateRoomMessage, updateWinnersMessage } from './messages.js';

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

  public handleMessage({ type, data }: WsMessage, context: WsContext): void {
    const isValidCommand = (this.wsCommands as string[]).includes(type);
    if (!isValidCommand) throw new Error(`Invalid message type: ${type}`);
    const command = this[type as keyof this] as CommandFunction;
    command.call(this, data, context);
  }

  public handleClose(context: WsContext): void {}

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

  public single_play() {}

  public create_room() {}

  public add_user_to_room() {}

  public add_ships() {}

  public attack() {}

  public randomAttack() {}
}
