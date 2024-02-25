import { type RawData, type WebSocket, WebSocketServer } from 'ws';
import { type WsContext, type WsMessage, type WsController, type WsServerDeps } from './interfaces.js';
import { randomID } from '../utils/randomID.js';
import { parseMessage, stringifyMessage } from '../utils/messageUtils.js';

export class WsServer extends WebSocketServer {
  private readonly controller: WsController;

  private readonly clientsMap = new Map<number, WebSocket>();

  constructor({ server, controller }: WsServerDeps) {
    super({ server });
    this.controller = controller;
    this.on('connection', this.onConnection);
    this.on('close', this.onClose);
  }

  public broadcast = (message: WsMessage | WsMessage[], contextID?: WsContext['id'] | Array<WsContext['id']>): void => {
    try {
      const messages = Array.isArray(message) ? message : [message];
      messages.forEach((msg) => {
        const rawMessage = stringifyMessage(msg);
        console.log('-->', rawMessage);

        let clients;
        if (contextID === undefined) {
          clients = this.clientsMap;
        } else if (Array.isArray(contextID)) {
          clients = this.getConnectionsByID(contextID);
        } else {
          clients = this.getConnectionsByID([contextID]);
        }

        clients.forEach((client) => {
          client.send(rawMessage);
        });
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(errorMessage);
    }
  };

  private readonly onConnection = (ws: WebSocket): void => {
    const context = this.createWebSocketContext(ws);
    console.log(`client connected ${context.id}`);
    ws.on('message', this.onConnectionMessage(context));
    ws.on('close', () => {
      this.onConnectionClose(context);
    });
  };

  private readonly onClose = (): void => {
    console.log('Server closed');
    this.clientsMap.forEach((ws) => {
      ws.close();
    });
  };

  private readonly onConnectionMessage = (context: WsContext) => (rawMessage: RawData) => {
    try {
      console.log('<--', String(rawMessage));
      const message = parseMessage(rawMessage);
      this.controller.handleMessage(message, context);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(message);
    }
  };

  private readonly onConnectionClose = (context: WsContext): void => {
    const { id } = context;
    this.controller.handleClose(context);
    this.clientsMap.delete(id);
    console.log(`Client disconnected ${id}`);
  };

  private createWebSocketContext(ws: WebSocket): WsContext {
    const id = randomID();
    this.clientsMap.set(id, ws);
    return {
      id,
      send: (message) => {
        this.broadcast(message, id);
      },
      broadcast: this.broadcast,
    };
  }

  private getConnectionsByID(ids: number[] = []): WebSocket[] {
    return ids.reduce<WebSocket[]>((acc, id) => {
      const client = this.clientsMap.get(id);
      if (client) acc.push(client);
      return acc;
    }, []);
  }
}
