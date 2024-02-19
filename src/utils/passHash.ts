import { createHash } from 'crypto';

export const passHash = (pass: string): string => createHash('sha256').update(pass).digest('hex');

export const comparePassword = (pass: string, hashedPass: string): boolean => passHash(pass) === hashedPass;
