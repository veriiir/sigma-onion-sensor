export type SystemType = 'portable' | 'panel';

export interface Profile {
  id: string;
  full_name: string;
  system_type: SystemType;
  created_at: string;
  updated_at: string;
}

export interface SensorReading {
  id?: string;
  user_id?: string;
  system_type: SystemType;
  moisture: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  ph: number;
  conductivity: number;
  created_at?: string;
}

export interface AIDetection {
  id?: string;
  user_id?: string;
  system_type: SystemType;
  image_url: string;
  label: string;
  confidence: number;
  bbox_x: number;
  bbox_y: number;
  bbox_width: number;
  bbox_height: number;
  created_at?: string;
}

export interface SensorConfig {
  key: keyof Omit<SensorReading, 'id' | 'user_id' | 'system_type' | 'created_at'>;
  label: string;
  unit: string;
  min: number;
  max: number;
  goodMin: number;
  goodMax: number;
  color: string;
}

export type ActivePage = 'dashboard' | 'ai-analysis' | 'history' | 'settings';
