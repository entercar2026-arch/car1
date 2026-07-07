const fs = require('fs');
fetch('http://localhost:3000/api/blur-license-plate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?q=80&w=2070&auto=format&fit=crop'
  })
}).then(res => res.json()).then(data => console.log("Response:", data)).catch(err => console.error(err));
