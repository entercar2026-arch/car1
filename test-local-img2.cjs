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
  const text = await res.text();
  console.log("Body starts with:", text.substring(0, 100));
}
run();
