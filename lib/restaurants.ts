import { createClient } from '@/lib/supabase/client'
import type { RestaurantInsert, RestaurantUpdate } from '@/types'

export async function getRestaurants() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('visited_at', { ascending: false, nullsFirst: false })
    if (error) throw error
  return data
}

export async function getRestaurant(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createRestaurant(restaurant: RestaurantInsert) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('restaurants')
    .insert(restaurant)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRestaurant(id: string, restaurant: RestaurantUpdate) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('restaurants')
    .update(restaurant)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRestaurant(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', id)
    .select('id')
  if (error) throw error
  // RLS で拒否された場合はエラーにならず 0 件になるため、ここで検知する
  if (!data.length) throw new Error('削除できませんでした')
}

export async function uploadImage(file: File): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('restaurant-images')
    .upload(fileName, file, { upsert: false })

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('restaurant-images')
    .getPublicUrl(fileName)

  return data.publicUrl
}

export async function deleteImage(imageUrl: string) {
  const supabase = createClient()
  const fileName = imageUrl.split('/').pop()
  if (!fileName) return
  await supabase.storage.from('restaurant-images').remove([fileName])
}