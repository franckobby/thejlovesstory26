export interface Table {
  id: number;
  label: string;
  category: string | null;
  guests: string[];
}

export interface SeatingData {
  tables: Table[];
}

export interface EventDetails {
  bride: string;
  groom: string;
  coupleNames: string;
  monogram: string;
  hashtag: string;
  date: string; // ISO
  timeDisplay: string;
  ceremonyVenue: string;
  ceremonyAddress: string;
  receptionVenue: string;
  receptionAddress: string;
  receptionTime: string;
  city: string;
  dressCode: string;
  welcome: string;
  thankYou: string;
}

export interface ProgramGroup {
  /** Optional heading for the group, e.g. "Officiants". */
  label?: string;
  /** Lines under the group, e.g. names / roles. */
  items: string[];
}

export interface ProgramItem {
  time: string;
  title: string;
  description?: string;
  /** Optional grouped sub-lists (participants, roles, etc.). */
  groups?: ProgramGroup[];
}

export interface ProgramData {
  ceremony: ProgramItem[];
  reception: ProgramItem[];
}

export interface AppData {
  tables: Table[];
  event: EventDetails;
  program: ProgramData;
}

/** A single guest match returned to the guest-facing seat finder. */
export interface SeatMatch {
  name: string;
  score: number;
  tableId: number;
  tableLabel: string;
  category: string | null;
  tablemates: string[];
}
