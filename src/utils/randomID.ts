import { randomInt } from 'crypto';
import { MAX_ID } from '../config/config.js';

export const randomID = (): number => randomInt(MAX_ID);
