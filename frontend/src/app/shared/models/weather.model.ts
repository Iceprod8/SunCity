export interface Weather {
  id: number;
  date: string;
  condition: string;
  min: number;
  max: number;
  condition_en?: string;
  condition_de?: string;
  displayCondition?: string;
  baseCondition?: string;
}

