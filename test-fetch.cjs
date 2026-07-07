async function test() {
  const imageUrl = "https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?q=80&w=2070&auto=format&fit=crop";
  const imageRes = await fetch(imageUrl);
  console.log("Status:", imageRes.status);
  console.log("Content-Type:", imageRes.headers.get("content-type"));
  const buffer = await imageRes.arrayBuffer();
  console.log("Size:", buffer.byteLength);
}
test().catch(console.error);
