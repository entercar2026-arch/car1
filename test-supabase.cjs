require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('cars').select('id, name, category, price, fuel_type');
  if (error) {
    console.error("Error fetching cars:", error);
    return;
  }
  console.log("Total cars in Supabase:", data.length);
  const categories = {};
  data.forEach(car => {
    categories[car.category] = (categories[car.category] || 0) + 1;
    console.log(`- ${car.name} (${car.category}) - Price: ${car.price} - Fuel: ${car.fuel_type}`);
  });
  console.log("Categories:", categories);
}
check().catch(console.error);
