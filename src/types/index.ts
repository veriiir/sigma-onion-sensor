export type SystemType = 'portable' | 'panel';
export type LandId = 'default' | 'lahan1' | 'lahan2' | 'lahan3';

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
  land_id?: LandId;
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
  land_id?: LandId;
  image_url: string;
  label: string;
  confidence: number;
  bbox_x: number;
  bbox_y: number;
  bbox_width: number;
  bbox_height: number;
  created_at?: string;
}

export interface AIAnalysisRecord {
  id?: string;
  user_id?: string;
  system_type: SystemType;
  land_id: LandId;
  disease_name: string;
  confidence: number;
  recommendation: string;
  image_url: string;
  bbox_x: number;
  bbox_y: number;
  bbox_width: number;
  bbox_height: number;
  created_at?: string;
}

export interface SensorConfig {
  key: keyof Omit<SensorReading, 'id' | 'user_id' | 'system_type' | 'land_id' | 'created_at'>;
  label: string;
  unit: string;
  min: number;
  max: number;
  goodMin: number;
  goodMax: number;
  color: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export type ActivePage = 'dashboard' | 'ai-analysis' | 'history' | 'settings';

export interface UserPreferences {
  user_id: string;
  active_mode: SystemType;
  selected_land: LandId;
  notif_enabled: boolean;
  auto_sync: boolean;
  updated_at?: string;
}
