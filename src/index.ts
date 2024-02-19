import { HTTP_PORT } from './config/config.js';
import { httpServer } from './servers/httpServer.js';
import { WsServer } from './servers/wsServer.js';

new WsServer({ server: httpServer });

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
