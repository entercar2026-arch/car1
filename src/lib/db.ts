import { supabase } from './supabase';
import { Car, Booking, Review } from '../types';

// Utility to convert DB snake_case to JS camelCase
const dbToCar = (dbCar: any): Car => {
  let description = dbCar.description || "";
  let photos: string[] | undefined = undefined;
  let videoUrl = dbCar.video_url || dbCar.videoUrl || "";
  let thumbnail = dbCar.thumbnail || "";
  let isShortTermAvailable = false;
  let shortTermPriceList = "";

  // Parse metadata from description if present
  if (description.includes("|||META:")) {
    const parts = description.split("|||META:");
    description = parts[0].trim();
    try {
      const meta = JSON.parse(parts[1]);
      if (meta.photos) photos = meta.photos;
      if (meta.videoUrl) videoUrl = meta.videoUrl;
      if (meta.thumbnail) thumbnail = meta.thumbnail;
      if (meta.isShortTermAvailable !== undefined) isShortTermAvailable = meta.isShortTermAvailable;
      if (meta.shortTermPriceList !== undefined) shortTermPriceList = meta.shortTermPriceList;
    } catch (e) {
      console.error("Failed to parse car metadata", e);
    }
  }

  return {
    id: dbCar.id,
    name: dbCar.name,
    category: dbCar.category,
    price: Number(dbCar.price),
    image: dbCar.image,
    transmission: dbCar.transmission,
    seats: dbCar.seats,
    fuelType: dbCar.fuel_type,
    description: description,
    videoUrl: videoUrl,
    thumbnail: thumbnail || undefined,
    photos: photos,
    isShortTermAvailable,
    shortTermPriceList,
  };
};

const carToDb = (car: Omit<Car, 'id'>) => {
  const meta: any = {};
  if (car.photos) meta.photos = car.photos;
  if (car.videoUrl) meta.videoUrl = car.videoUrl;
  if (car.thumbnail) meta.thumbnail = car.thumbnail; if (car.isShortTermAvailable !== undefined) meta.isShortTermAvailable = car.isShortTermAvailable; if (car.shortTermPriceList !== undefined) meta.shortTermPriceList = car.shortTermPriceList;
  if (car.isShortTermAvailable !== undefined) meta.isShortTermAvailable = car.isShortTermAvailable;
  if (car.shortTermPriceList !== undefined) meta.shortTermPriceList = car.shortTermPriceList;

  const descSuffix = ` |||META:${JSON.stringify(meta)}`;
  const fullDescription = (car.description || "") + descSuffix;

  const payload: any = {
    name: car.name,
    category: car.category,
    price: car.price,
    image: car.image,
    transmission: car.transmission,
    seats: car.seats,
    fuel_type: car.fuelType,
    description: fullDescription,
    year_model: 2024,
  };
  return payload;
};

export const db = {
  cars: {
    async getAll(): Promise<Car[] | null> {
      if (!supabase) return null;
      const { data, error } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(dbToCar);
    },
    async create(car: Omit<Car, 'id'>): Promise<Car | null> {
      if (!supabase) return null;
      const { data, error } = await supabase.from('cars').insert(carToDb(car)).select().single();
      if (error) throw error;
      return dbToCar(data);
    },
    async update(id: string, car: Partial<Car>): Promise<Car | null> {
      if (!supabase) return null;
      
      const payload: any = {};
      if (car.name) payload.name = car.name;
      if (car.category) payload.category = car.category;
      if (car.price) payload.price = car.price;
      if (car.image) payload.image = car.image;
      if (car.transmission) payload.transmission = car.transmission;
      if (car.seats) payload.seats = car.seats;
      if (car.fuelType) payload.fuel_type = car.fuelType;

      if (car.description !== undefined || car.photos !== undefined || car.videoUrl !== undefined || car.thumbnail !== undefined || car.isShortTermAvailable !== undefined || car.shortTermPriceList !== undefined) {
        const meta: any = {};
        if (car.photos) meta.photos = car.photos;
        if (car.videoUrl) meta.videoUrl = car.videoUrl;
        if (car.thumbnail) meta.thumbnail = car.thumbnail; if (car.isShortTermAvailable !== undefined) meta.isShortTermAvailable = car.isShortTermAvailable; if (car.shortTermPriceList !== undefined) meta.shortTermPriceList = car.shortTermPriceList;

        const descSuffix = ` |||META:${JSON.stringify(meta)}`;
        payload.description = (car.description !== undefined ? car.description : "") + descSuffix;
      }

      const { data, error } = await supabase.from('cars').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return dbToCar(data);
    },
    async delete(id: string): Promise<boolean> {
      if (!supabase) return false;
      const { error } = await supabase.from('cars').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  }
};
