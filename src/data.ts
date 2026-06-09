import { Car } from './types';

export const INITIAL_CARS: Car[] = [
  {
    id: 'car-1',
    name: 'Porsche 911 Carrera S',
    category: 'Sedan',
    price: 2705,
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600',
    transmission: 'Automatic',
    seats: 4,
    fuelType: 'Gasoline',
    description: 'The ultimate sports driving experience. Timeless style meets peerless precision and pure mechanical thrill.',
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    id: 'car-2',
    name: 'Tesla Model S Plaid',
    category: 'Sedan',
    price: 1950,
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=600',
    transmission: 'Automatic',
    seats: 5,
    fuelType: 'Electric',
    description: 'Unmatched electric range meets hypercar-level acceleration. Step into the cockpit of the future.'
  },
  {
    id: 'car-3',
    name: 'Range Rover Sport',
    category: 'SUV',
    price: 2100,
    image: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=600',
    transmission: 'Automatic',
    seats: 7,
    fuelType: 'Hybrid',
    description: 'Supreme comfort, robust off-road capability, and a command driving position that turns heads on every avenue.'
  },
  {
    id: 'car-4',
    name: 'Ford F-150 Raptor',
    category: 'Pickup',
    price: 2300,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600',
    transmission: 'Automatic',
    seats: 5,
    fuelType: 'Gasoline',
    description: 'Rugged desert runner engineered for extreme off-road terrains and heavy payload capacity.'
  },
  {
    id: 'car-5',
    name: 'Toyota Alphard Executive Lounge',
    category: 'MPV',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=600',
    transmission: 'Automatic',
    seats: 7,
    fuelType: 'Hybrid',
    description: 'Ultimate first-class travel on land. Features plush reclining captains chairs, dual sunroofs, and private workspace cabin.'
  },
  {
    id: 'car-6',
    name: 'Volvo FH16 heavy Truck',
    category: 'Truck',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600',
    transmission: 'Automatic',
    seats: 2,
    fuelType: 'Diesel',
    description: 'Uncompromising transport power designed for massive freight logistics with exceptional fuel efficiency and driver comfort.'
  }
];

export const INITIAL_REVIEWS: Array<{ id: string; carId: string; customerName: string; rating: number; comment: string; createdAt: string; isApproved: boolean }> = [
  {
    id: 'rev-1',
    carId: 'car-1',
    customerName: 'Marcus Vance',
    rating: 5,
    comment: 'The Porsche 911 Carrera S was absolutely pristine. Driving it around the coastal highway was an unforgettable experience. Zero complaints!',
    createdAt: '2026-05-12',
    isApproved: true
  },
  {
    id: 'rev-2',
    carId: 'car-2',
    customerName: 'Elena Rostova',
    rating: 5,
    comment: 'Exceptional speed and seamless technology. The autopilot features and state-of-the-art console made navigating the city a breeze. Highly recommended.',
    createdAt: '2026-05-20',
    isApproved: true
  },
  {
    id: 'rev-3',
    carId: 'car-3',
    customerName: 'David K.',
    rating: 4,
    comment: 'Perfect utility for our family trip. This Range Rover Sport is extremely spacious and holds luggage securely. The ride comfort is unmatched.',
    createdAt: '2026-05-28',
    isApproved: true
  },
  {
    id: 'rev-4',
    carId: 'car-1',
    customerName: 'Jessica Thorne',
    rating: 5,
    comment: 'Unbelievably good customer service at the Terminal Airport Hub! The Carrera S was delivered right on time, detailed to absolute perfection.',
    createdAt: '2026-06-01',
    isApproved: true
  },
  {
    id: 'rev-5',
    carId: 'car-4',
    customerName: 'Bryan Chen',
    rating: 5,
    comment: 'The M4 Competition handles like a absolute beast on the track and street. Extremely aggressive acceleration and perfect manual transmission simulation.',
    createdAt: '2026-06-03',
    isApproved: true
  }
];

