import dotenv from 'dotenv';

dotenv.config();

export const HTTP_PORT = process.env.HTTP_PORT ? Number(process.env.HTTP_PORT) : 3000;
export const MAX_ID = 2 ** 48 - 1;
export const BOARD_SIZE = 10;
export const SHIPS_SET = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
