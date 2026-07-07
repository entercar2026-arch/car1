import { db } from './src/lib/db';
async function run() {
    const cars = await db.cars.getAll();
    if(cars) {
        for(const c of cars) {
            console.log(c.name, c.image?.substring(0, 50));
        }
    }
}
run();
