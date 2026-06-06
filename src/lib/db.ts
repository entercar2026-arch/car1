import { supabase } from './supabase';
import { Car, Booking, Review } from '../types';

// Utility to convert DB snake_case to JS camelCase
const dbToCar = (dbCar: any): Car => ({
  id: dbCar.id,
  name: dbCar.name,
  category: dbCar.category,
  price: Number(dbCar.price),
  image: dbCar.image,
  transmission: dbCar.transmission,
  seats: dbCar.seats,
  fuelType: dbCar.fuel_type,
  description: dbCar.description,
  yearModel: dbCar.year_model,
});

const carToDb = (car: Omit<Car, 'id'>) => ({
  name: car.name,
  category: car.category,
  price: car.price,
  image: car.image,
  transmission: car.transmission,
  seats: car.seats,
  fuel_type: car.fuelType,
  description: car.description,
  year_model: car.yearModel,
});

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
      if (car.description !== undefined) payload.description = car.description;
      if (car.yearModel) payload.year_model = car.yearModel;

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
