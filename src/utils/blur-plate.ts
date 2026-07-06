export async function blurLicensePlate(base64Image: string): Promise<string> {
  try {
    let base64ToSend = base64Image;
    if (base64Image.startsWith("http://") || base64Image.startsWith("https://") || base64Image.startsWith("/")) {
       try {
         const fetchRes = await fetch(base64Image);
         const blob = await fetchRes.blob();
         base64ToSend = await new Promise((resolve, reject) => {
           const reader = new FileReader();
           reader.onloadend = () => resolve(reader.result as string);
           reader.onerror = reject;
           reader.readAsDataURL(blob);
         });
       } catch (e) {
         console.warn("Could not fetch image on client, sending URL to server", e);
       }
    }

    const body: any = {};
    if (base64ToSend.startsWith("data:")) {
      body.imageBase64 = base64ToSend;
    } else {
      let url = base64ToSend;
      if (url.startsWith("/")) {
        url = window.location.origin + url;
      }
      body.imageUrl = url;
    }

    const res = await fetch("/api/blur-license-plate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error("Failed to detect plate:", await res.text());
      return base64Image;
    }

    const data = await res.json();
    const bbox = data.bbox; // [ymin, xmin, ymax, xmax] (0 to 1000)
    const returnedBase64 = data.base64Image || base64Image;

    if (!bbox || bbox.length !== 4 || bbox.every((val: number) => val === 0)) {
      return returnedBase64;
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(returnedBase64);

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Calculate coordinates
        const ymin = (bbox[0] / 1000) * img.height;
        const xmin = (bbox[1] / 1000) * img.width;
        const ymax = (bbox[2] / 1000) * img.height;
        const xmax = (bbox[3] / 1000) * img.width;

        const width = xmax - xmin;
        const height = ymax - ymin;

        if (width <= 0 || height <= 0) {
          return resolve(returnedBase64);
        }

        // --- ROBUST SCALE-DOWN & SCALE-UP PIXELATION / BLURRING ---
        // 1. Create a tiny temp canvas to scale down the license plate region.
        // This mathematically destroys the text and details so it's impossible to recover.
        const tempCanvas = document.createElement("canvas");
        // We scale it down to about 12% of its size (minimum 4x4 pixels)
        tempCanvas.width = Math.max(4, Math.round(width * 0.12));
        tempCanvas.height = Math.max(4, Math.round(height * 0.12));
        const tempCtx = tempCanvas.getContext("2d");
        
        if (tempCtx) {
          // Draw the crisp region onto the tiny canvas
          tempCtx.drawImage(
            img,
            xmin, ymin, width, height,
            0, 0, tempCanvas.width, tempCanvas.height
          );

          // Get the average color of the plate from the tiny canvas to use as a solid fill.
          // This ensures that the original high-frequency crisp text is completely obliterated first.
          const pixelData = tempCtx.getImageData(
            Math.floor(tempCanvas.width / 2),
            Math.floor(tempCanvas.height / 2),
            1, 1
          ).data;
          const avgColor = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;

          // Fill the region with the solid average color first
          ctx.fillStyle = avgColor;
          ctx.fillRect(xmin - 2, ymin - 2, width + 4, height + 4);

          // Now draw the tiny pixelated image back, stretched to original size.
          // imageSmoothingEnabled = true will create a very smooth, clean blur effect!
          ctx.imageSmoothingEnabled = true;
          
          // Apply an optional canvas blur filter if the browser supports it, as an extra layer
          try {
            ctx.filter = `blur(${Math.max(width, height) * 0.15}px)`;
          } catch (e) {}

          // Draw it stretched back
          ctx.drawImage(
            tempCanvas,
            0, 0, tempCanvas.width, tempCanvas.height,
            xmin - 2, ymin - 2, width + 4, height + 4
          );

          // Turn off filter
          try {
            ctx.filter = "none";
          } catch (e) {}

          // Add a elegant glassmorphism frosted glass overlay to make it look beautifully integrated
          ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
          ctx.fillRect(xmin - 1, ymin - 1, width + 2, height + 2);
        } else {
          // Fallback if tempCtx couldn't be created: draw a semi-transparent block
          ctx.fillStyle = "rgba(180, 180, 180, 0.95)";
          ctx.fillRect(xmin, ymin, width, height);
        }

        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.onerror = () => resolve(returnedBase64);
      img.src = returnedBase64;
    });
  } catch (error) {
    console.error("Error in blurLicensePlate:", error);
    return base64Image;
  }
}
