import { type RawData } from 'ws';
import { type WsMessage } from '../servers/interfaces.js';

export const stringifyMessage = ({ type, data }: WsMessage): string => {
  return JSON.stringify({ type, data: JSON.stringify(data), id: 0 });
};

export const parseMessage = (rawMessage: RawData): WsMessage => {
  const { type, data: rawData } = JSON.parse(String(rawMessage));
  const data: string | undefined = rawData ? JSON.parse(rawData as string) : undefined;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return { type, data } as WsMessage;
};
