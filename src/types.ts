export interface Medication {
  id: string;
  name: string;
  dose: string;
  form: string;
  times: string[]; // HH:mm format
  notes?: string;
  purpose?: string;
  days?: number[]; // 0-6 (Sun-Sat)
}

export interface TakenRecord {
  medicationId: string;
  time: string;
  date: string; // YYYY-MM-DD
}
