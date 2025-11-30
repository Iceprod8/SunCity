export interface Weather {
  id: number;
  date: string;
  condition: string;
  baseCondition?: string;
  displayCondition?: string;
  min: number;
  max: number;
  wind: number;
  daily_tip: string;
  periods: WeatherPeriod[];
}

export interface WeatherPeriod {
  key: string;
  label: string;
  temp: number;
  condition: string;
  wind: number;
}

