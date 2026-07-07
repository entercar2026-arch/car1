async function run() {
  const imageRes = await fetch("https://tngnryqckzifwhtszrqv.supabase.co/storage/v1/object/public/vehicles/car-1783425996234.jpg");
  const arrayBuffer = await imageRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Data = buffer.toString("base64");
  
  const res = await fetch("http://localhost:3000/api/blur-license-plate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64: "data:image/jpeg;base64," + base64Data
    })
  });
  
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text.substring(0, 100));
}
run();
