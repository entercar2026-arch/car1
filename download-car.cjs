const fs = require('fs');
async function run() {
  const res = await fetch("https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800");
  const buffer = await res.arrayBuffer();
  fs.writeFileSync('car2.jpg', Buffer.from(buffer));
  console.log("Downloaded!");
}
run();
