import { type Server } from 'http';

export interface WsMessage<T = unknown> {
  type: string;
  data: T;
  id: 0;
}

export interface WsContext {
  id: number;
  send: (message: WsMessage | WsMessage[]) => void;
  broadcast: (message: WsMessage | WsMessage[], conn?: number | number[]) => void;
}

export interface WsController {
  handleMessage: (message: WsMessage, context: WsContext) => void;
  handleClose: (context: WsContext) => void;
}

export interface WsServerDeps {
  server: Server;
  controller: WsController;
}
