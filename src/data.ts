import { Car } from './types';

export const INITIAL_CARS: Car[] = [
  {
    id: 'car-1',
    name: 'Porsche 911 Carrera S',
    category: 'Sedan',
    price: 2705,
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600',
    altImage: 'https://images.unsplash.com/photo-1503376712344-6a0c2394fdce?auto=format&fit=crop&q=80&w=600',
    customColors: {
      '#ef4444': 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600',
      '#000000': 'https://images.unsplash.com/photo-1503376712344-6a0c2394fdce?auto=format&fit=crop&q=80&w=600'
    },
    photos: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1503376712344-6a0c2394fdce?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1582236802525-4554b2dcd8be?auto=format&fit=crop&q=80&w=800'
    ],
    transmission: 'Automatic',
    seats: 4,
    fuelType: 'Gasoline',
    description: 'The ultimate sports driving experience. Timeless style meets peerless precision and pure mechanical thrill.',
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    extendedSpecs: {
      engine: '3.0L Twin-Turbo Flat-6',
      horsepower: '450 HP @ 6,500 RPM',
      topSpeed: '308 km/h',
      acceleration: '3.2s',
      driveType: 'Rear-Wheel Drive (RWD)',
      fuelEfficiency: '9.6 L / 100km',
      co2Emissions: '220 g/km',
      ownerNotes: 'Immaculately detailed weekly. Garage-parked with premium climate control. Features sport exhaust system for optional throatier resonance. Perfect for driving enthusiasts seeking crisp precision on scenic routes.'
    }
  },
  {
    id: 'car-2',
    name: 'Tesla Model S Plaid',
    category: 'Sedan',
    price: 1950,
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=600',
    altImage: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=600',
    customColors: {
      '#ffffff': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=600',
      '#000000': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=600',
      '#dc2626': 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&q=80&w=600'
    },
    photos: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&q=80&w=800'
    ],
    transmission: 'Automatic',
    seats: 5,
    fuelType: 'Electric',
    description: 'Unmatched electric range meets hypercar-level acceleration. Step into the cockpit of the future.',
    extendedSpecs: {
      engine: 'Tri-Motor All-Electric Powertrain',
      horsepower: '1,020 HP',
      topSpeed: '322 km/h',
      acceleration: '2.1s',
      driveType: 'Dual-Motor All-Wheel Drive (AWD)',
      fuelEfficiency: '18.7 kWh / 100km',
      co2Emissions: '0 g/km (Zero Local Emissions)',
      ownerNotes: 'Kept in absolute top-tier condition with routine battery optimization cycles. Full Self-Driving hardware ready. Features the revolutionary aerodynamic steering yoke and carbon fiber trim detailing.'
    }
  },
  {
    id: 'car-3',
    name: 'Range Rover Sport',
    category: 'SUV',
    price: 2100,
    image: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=600',
    altImage: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600',
    photos: [
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800'
    ],
    transmission: 'Automatic',
    seats: 7,
    fuelType: 'Hybrid',
    description: 'Supreme comfort, robust off-road capability, and a command driving position that turns heads on every avenue.',
    extendedSpecs: {
      engine: '3.0L Turbocharged Inline-6 Plug-in Hybrid',
      horsepower: '395 HP @ 5,500 RPM',
      topSpeed: '225 km/h',
      acceleration: '5.7s',
      driveType: 'Intelligent All-Wheel Drive (AWD)',
      fuelEfficiency: '3.8 L / 100km',
      co2Emissions: '85 g/km',
      ownerNotes: 'Equipped with electronic air suspension and active ride dampers for top-tier cushion. Cabin includes refrigerated center console for cold drinks and Meridian Surround Sound audio. Ideal for long-distance family travel.'
    }
  },
  {
    id: 'car-4',
    name: 'Ford F-150 Raptor',
    category: 'Pickup',
    price: 2300,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600',
    altImage: 'https://images.unsplash.com/photo-1621993202323-f438eec934ff?auto=format&fit=crop&q=80&w=600',
    photos: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1621993202323-f438eec934ff?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1582490795493-27c1cb383af5?auto=format&fit=crop&q=80&w=800'
    ],
    transmission: 'Automatic',
    seats: 5,
    fuelType: 'Gasoline',
    description: 'Rugged desert runner engineered for extreme off-road terrains and heavy payload capacity.',
    extendedSpecs: {
      engine: '3.5L Twin-Turbo EcoBoost V6',
      horsepower: '450 HP',
      topSpeed: '193 km/h',
      acceleration: '5.3s',
      driveType: 'Electronic Shift-on-the-Fly 4WD',
      fuelEfficiency: '14.1 L / 100km',
      co2Emissions: '330 g/km',
      ownerNotes: 'Comes with FOX Racing Live Valve internal bypass shocks for extreme terrain dampening. Rigged with off-road floodlights and high-clearance running boards. Heavy duty winches are available upon custom advance request.'
    }
  },
  {
    id: 'car-5',
    name: 'Toyota Alphard Executive Lounge',
    category: 'MPV',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=600',
    altImage: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=600',
    photos: [
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1555529811-3096b7dc97fa?auto=format&fit=crop&q=80&w=800'
    ],
    transmission: 'Automatic',
    seats: 7,
    fuelType: 'Hybrid',
    description: 'Ultimate first-class travel on land. Features plush reclining captains chairs, dual sunroofs, and private workspace cabin.',
    extendedSpecs: {
      engine: '2.5L clean hybrid 4-cylinder',
      horsepower: '246 HP',
      topSpeed: '200 km/h',
      acceleration: '8.2s',
      driveType: 'Electric AWD System (E-Four)',
      fuelEfficiency: '6.1 L / 100km',
      co2Emissions: '139 g/km',
      ownerNotes: 'The pinnacle of VIP travel. Includes 2nd-row heated and ventilated VIP Ottoman captain chairs with power extenders and relaxing massage function. Fully sanitized, private partition window, and absolute cabin silence.'
    }
  },
  {
    id: 'car-6',
    name: 'Volvo FH16 heavy Truck',
    category: 'Truck',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600',
    altImage: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=600',
    photos: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1562624475-96105db6da40?auto=format&fit=crop&q=80&w=800'
    ],
    transmission: 'Automatic',
    seats: 2,
    fuelType: 'Diesel',
    description: 'Uncompromising transport power designed for massive freight logistics with exceptional fuel efficiency and driver comfort.',
    extendedSpecs: {
      engine: '16.1L Volvo D16 Diesel Turbocharged I6',
      horsepower: '750 HP',
      topSpeed: '130 km/h',
      acceleration: '14.5s',
      driveType: '6x4 Heavy Payload Axle Traction',
      fuelEfficiency: '32.0 L / 100km',
      co2Emissions: '790 g/km',
      ownerNotes: 'Designed for cross-country logistical endurance or luxury heavy transport. Features a double-bunk climate-controlled sleeper cabin, high-capacity mini-fridge, reading lounges, and modern Volvo collision avoidance safety radar.'
    }
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

