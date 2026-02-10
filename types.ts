
export interface Fridge {
  id: string;
  name: string;
}

export interface TemperatureReading {
  fridgeId: string;
  fridgeName: string;
  value: number;
}

export interface DailyLog {
  id: string;
  date: string;
  readings: TemperatureReading[];
  signature: string; // Base64 image
  timestamp: number;
}

export interface LabelData {
  ingredient: string;
  prepDate: string;
  expiryDate: string;
}

export interface Settings {
  googleSheetsUrl: string;
  fridges: Fridge[];
}
