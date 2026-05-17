import { generateRoomCode } from './slug';
import { supabase, isSupabaseConfigured } from './supabase';
import { Room } from './types';

const ROOM_PREFIX = 'lovebug_room_';

function getLocalRooms(): Record<string, Room> {
  try {
    const data = localStorage.getItem(ROOM_PREFIX + 'index');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveLocalRoom(code: string, room: Room): void {
  const rooms = getLocalRooms();
  rooms[code] = room;
  localStorage.setItem(ROOM_PREFIX + 'index', JSON.stringify(rooms));
}

export async function createRoom(p1Name: string): Promise<Room> {
  const code = generateRoomCode();
  const now = Date.now();

  const room: Room = {
    code,
    mode: 'cross-device',
    p1: { name: p1Name, score: 0, joinedAt: now },
    p2: null,
    screen: 'lobby',
    currentGame: null,
    currentDeck: null,
    gameState: null,
    createdAt: now,
    expiresAt: now + 24 * 60 * 60 * 1000,
  };

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('rooms').insert(room);
    if (error) throw new Error('Failed to create room: ' + error.message);
  }

  saveLocalRoom(code, room);
  return room;
}

export async function getRoom(code: string): Promise<Room | null> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error) return null;
    return data as Room;
  }

  const rooms = getLocalRooms();
  return rooms[code.toUpperCase()] || null;
}

export async function joinRoom(code: string, p2Name: string): Promise<Room | null> {
  const room = await getRoom(code);
  if (!room) return null;
  if (room.p2) return null;

  room.p2 = { name: p2Name, score: 0, joinedAt: Date.now() };
  room.screen = 'arcade';

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('rooms')
      .update(room)
      .eq('code', room.code);
    if (error) throw new Error('Failed to join room: ' + error.message);
  }

  saveLocalRoom(room.code, room);
  return room;
}

export async function updateRoom(room: Room): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('rooms')
      .update(room)
      .eq('code', room.code);
    if (error) throw new Error('Failed to update room: ' + error.message);
  }

  saveLocalRoom(room.code, room);
}

export function storePlayerRole(code: string, role: 'p1' | 'p2', name: string): void {
  localStorage.setItem(ROOM_PREFIX + 'player', JSON.stringify({ code, role, name }));
}

export function getStoredPlayerRole(): { code: string; role: 'p1' | 'p2'; name: string } | null {
  try {
    const data = localStorage.getItem(ROOM_PREFIX + 'player');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearStoredPlayerRole(): void {
  localStorage.removeItem(ROOM_PREFIX + 'player');
}

export async function pollRoom(
  code: string,
  onUpdate: (room: Room) => void,
  intervalMs: number = 2000
): Promise<() => void> {
  let cancelled = false;

  const poll = async () => {
    while (!cancelled) {
      const room = await getRoom(code);
      if (room) onUpdate(room);
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  };

  poll();

  return () => {
    cancelled = true;
  };
}
