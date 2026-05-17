const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateRoomCode(length: number = 4): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export function isValidRoomCode(code: string): boolean {
  return /^[ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/.test(code.toUpperCase());
}
