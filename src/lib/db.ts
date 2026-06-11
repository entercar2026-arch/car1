import { supabase } from './supabase';
import { Car, Booking, Review } from '../types';

// Utility to convert DB snake_case to JS camelCase
const dbToCar = (dbCar: any): Car => {
  const imageVal = dbCar.image || "";
  const parts = imageVal.split('|');
  const image = parts[0];
  const videoUrl = parts.length > 1 ? parts[1] : (dbCar.video_url || dbCar.videoUrl || "");

  return {
    id: dbCar.id,
    name: dbCar.name,
    category: dbCar.category,
    price: Number(dbCar.price),
    image: image,
    transmission: dbCar.transmission,
    seats: dbCar.seats,
    fuelType: dbCar.fuel_type,
    description: dbCar.description,
    videoUrl: videoUrl,
  };
};

const carToDb = (car: Omit<Car, 'id'>) => {
  const imagePayload = (car.videoUrl && car.videoUrl.trim() !== '') ? `${car.image}|${car.videoUrl}` : car.image;
  
  const payload: any = {
    name: car.name,
    category: car.category,
    price: car.price,
    image: imagePayload,
    transmission: car.transmission,
    seats: car.seats,
    fuel_type: car.fuelType,
    description: car.description,
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
      
      // We need to fetch existing to safely combine image|videoUrl if only one is updated
      const { data: existing } = await supabase.from('cars').select('image').eq('id', id).single();
      const existingImageVal = existing?.image || "";
      const parts = existingImageVal.split('|');
      const currentImage = parts[0];
      const currentVideo = parts.length > 1 ? parts[1] : "";

      const newImage = car.image !== undefined ? car.image : currentImage;
      const newVideo = car.videoUrl !== undefined ? car.videoUrl : currentVideo;

      if (car.image !== undefined || car.videoUrl !== undefined) {
        payload.image = (newVideo && newVideo.trim() !== '') ? `${newImage}|${newVideo}` : newImage;
      }

      if (car.name) payload.name = car.name;
      if (car.category) payload.category = car.category;
      if (car.price) payload.price = car.price;
      if (car.transmission) payload.transmission = car.transmission;
      if (car.seats) payload.seats = car.seats;
      if (car.fuelType) payload.fuel_type = car.fuelType;
      if (car.description !== undefined) payload.description = car.description;

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
