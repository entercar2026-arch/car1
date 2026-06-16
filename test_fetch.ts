import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const envUrl = process.env.VITE_SUPABASE_URL || '';
const envKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!envUrl || !envKey) {
  console.log('No Supabase credentials found in process.env');
  process.exit(1);
}

const supabase = createClient(envUrl, envKey);

async function run() {
  const { data, error } = await supabase.from('cars').select('*');
  if (error) {
    console.error('Error fetching cars:', error);
    process.exit(1);
  }
  
  console.log('Fetched', data.length, 'cars:');
  for (const car of data) {
    console.log(`- ID: ${car.id}, Name: "${car.name}", Category: "${car.category}", Image: "${car.image}"`);
  }
}

run();
