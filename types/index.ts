// /types/restaurant.ts
export type MealType = 'ランチ' | 'ディナー' | '両方' | ''

export interface Restaurant {
  id: string
  created_at: string
  visited_at: string | null
  name: string
  station: string | null
  genre: string | null
  meal_type: MealType | null
  budget: string | null
  rating_a: number | null
  rating_b: number | null
  rating_c: number | null
  rating_d: number | null
  url: string | null
  note: string | null
  image_url: string | null
}

export type RestaurantInsert = Omit<Restaurant, 'id' | 'created_at'>
export type RestaurantUpdate = Partial<RestaurantInsert>

export interface FilterState {
  search: string
  genre: string
  meal_type: string
  sort: 'date_desc' | 'date_asc' | 'rating_desc' | 'name'
}