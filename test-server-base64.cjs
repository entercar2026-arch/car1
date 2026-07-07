const fs = require('fs');
async function run() {
  const base64 = fs.readFileSync('plate.jpg').toString('base64');
  const res = await fetch("http://localhost:3000/api/blur-license-plate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64: "data:image/jpeg;base64," + base64
    })
  });
  console.log(res.status);
  const data = await res.json();
  console.log("Bbox:", data.bbox);
  console.log("Returned Base64 starts with:", data.base64Image.substring(0, 30));
}
run();
