import { api } from './api';

// ─── Types ─────────────────────────────────────────────────────
export type RoomType = 'MEETING_ROOM' | 'BOARDROOM' | 'CONFERENCE_HALL' | 'TRAINING_ROOM' | 'HOT_DESK';

export interface Room {
  id:          string;
  name:        string;
  type:        RoomType;
  capacity:    number;
  floor?:      string;
  amenities?:  string[];
  isActive:    boolean;
  location:    { id: string; name: string; type: string };
  createdAt:   string;
}

export interface RoomAvailability {
  roomId:    string;
  date:      string;
  slots:     Array<{ start: string; end: string; available: boolean }>;
}

export interface RoomListParams {
  locationId?: string;
  type?:       RoomType;
  capacity?:   number;
  available?:  boolean;
  date?:       string;
}

// ─── Room service ──────────────────────────────────────────────
export const roomService = {
  async list(params?: RoomListParams): Promise<Room[]> {
    const { data } = await api.get<Room[]>('/rooms', { params });
    return data;
  },

  async getById(id: string): Promise<Room> {
    const { data } = await api.get<Room>(`/rooms/${id}`);
    return data;
  },

  async checkAvailability(roomId: string, date: string): Promise<RoomAvailability> {
    const { data } = await api.get<RoomAvailability>(`/rooms/${roomId}/availability`, {
      params: { date },
    });
    return data;
  },
};

export default roomService;
