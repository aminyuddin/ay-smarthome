export interface Room {
  id: string;
  name: string;
  icon?: string;
}

export const ROOM_IDS = [
  "living_room",
  "bedroom",
  "kitchen",
  "bathroom",
  "study_room",
  "garage",
  "outdoor",
] as const;

export type RoomId = (typeof ROOM_IDS)[number];
