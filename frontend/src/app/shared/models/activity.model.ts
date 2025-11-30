export interface Activity {
  id: number | string;
  name: string;
  type: string;
  distanceKm: number;
  popularity: number;
  photo?: string;
  name_en?: string;
  name_de?: string;
  type_en?: string;
  type_de?: string;
}

