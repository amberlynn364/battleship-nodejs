import { WebSocket, WebSocketServer } from 'ws';
import { type WsServerDeps } from './interfaces.js';

export class WsServer extends WebSocketServer {
  constructor({ server }: WsServerDeps) {
    super({ server });

    this.setupWebSocket();
  }

  private setupWebSocket(): void {
    this.on('connection', (socket: WebSocket) => {
      console.log('Client connected to WebSocket');

      socket.on('message', (message: string) => {
        console.log(`Received message: ${message}`);
        this.broadcastMessage(message, socket);
      });

      socket.on('close', (message: string) => {
        console.log('Client disconnected from WebSocket');
      });
    });
  }

  private broadcastMessage(message: string, sender: WebSocket): void {
    this.clients.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}
