const { spawn } = require('child_process');
const server = spawn('node', ['dist/server.cjs'], { env: { ...process.env, PORT: 3001 } });
server.stdout.on('data', d => console.log('server:', d.toString()));
server.stderr.on('data', d => console.error('server error:', d.toString()));
setTimeout(async () => {
  try {
    const fetch = require('node-fetch');
    const res = await fetch("http://localhost:3000/api/blur-license-plate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1b/1993_Ford_Mustang_LX_5.0_convertible_rear.jpg"
      })
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch (e) { console.error("fetch err:", e); }
  server.kill();
}, 2000);
