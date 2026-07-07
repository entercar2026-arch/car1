async function run() {
  const res = await fetch("http://localhost:3000/api/blur-license-plate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1b/1993_Ford_Mustang_LX_5.0_convertible_rear.jpg"
    })
  });
  console.log(res.status);
  console.log(await res.text());
}
run();
