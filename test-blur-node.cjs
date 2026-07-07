// test script to verify server returns correct things
const fs = require('fs');
async function run() {
  const base64 = fs.readFileSync('car2.jpg').toString('base64');
  const res = await fetch("http://localhost:3000/api/blur-license-plate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64: "data:image/jpeg;base64," + base64
    })
  });
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Bbox:", data.bbox);
}
run();
