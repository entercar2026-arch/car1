export async function blurLicensePlate(base64Image: string): Promise<string> {
  try {
    let finalBase64 = base64Image;
    const isUrl = base64Image.startsWith("http://") || base64Image.startsWith("https://") || base64Image.startsWith("/") || base64Image.startsWith("blob:");
    
    if (isUrl) {
      let url = base64Image;
      if (url.startsWith("/")) {
        url = window.location.origin + url;
      }
      
      // Attempt to fetch the image in the browser to bypass backend CORS/fetching blocks
      try {
        finalBase64 = await new Promise((resolve, reject) => {
          const img = new Image();
          if (!url.startsWith("blob:")) {
             img.crossOrigin = "anonymous";
          }
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL("image/jpeg", 0.9));
            } else {
              reject(new Error("No canvas context"));
            }
          };
          img.onerror = () => reject(new Error("Image load error"));
          img.src = url;
        });
      } catch (e) {
        console.warn("Failed to convert image to base64 in browser, falling back to sending URL", e);
      }
    }

    const body: any = {};
    if (finalBase64.startsWith("data:image/")) {
      body.imageBase64 = finalBase64;
    } else {
      let url = finalBase64;
      if (url.startsWith("/")) {
        url = window.location.origin + url;
      }
      body.imageUrl = url;
    }

    let bbox: number[] = [];
    let returnedBase64 = base64Image;

    try {
      const res = await fetch("/api/blur-license-plate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.warn("Failed to detect plate on backend:", await res.text());
      } else {
        const data = await res.json();
        if (data.bbox) bbox = data.bbox;
        // Do not use data.base64Image, rely on local finalBase64 to avoid truncation
      }
    } catch (apiErr) {
      console.warn("Backend request failed:", apiErr);
    }

    let finalBbox = bbox;
    let isFallback = false;
    if (!bbox || bbox.length !== 4 || bbox.every((val: number) => val === 0)) {
      console.warn("Detection returned empty bounding box or failed, falling back to generic bottom-center blur");
      // Approximate position of a license plate on a car photo (bottom center)
      // Tightened and centered to avoid covering other parts: ymin: 74%, xmin: 44%, ymax: 80%, xmax: 56%
      finalBbox = [740, 440, 800, 560];
      isFallback = true;
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(base64Image);

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Calculate coordinates
          let ymin = (finalBbox[0] / 1000) * img.height;
          let xmin = (finalBbox[1] / 1000) * img.width;
          let ymax = (finalBbox[2] / 1000) * img.height;
          let xmax = (finalBbox[3] / 1000) * img.width;
          
          // Ensure ymin < ymax and xmin < xmax just in case the AI swapped them
          if (ymin > ymax) { let temp = ymin; ymin = ymax; ymax = temp; }
          if (xmin > xmax) { let temp = xmin; xmin = xmax; xmax = temp; }
          
          let width = xmax - xmin;
          let height = ymax - ymin;
          
          if (width <= 0 || height <= 0) {
            // Invalid bounding box, fallback to tight bottom center
            ymin = 0.74 * img.height;
            xmin = 0.44 * img.width;
            ymax = 0.80 * img.height;
            xmax = 0.56 * img.width;
            width = xmax - xmin;
            height = ymax - ymin;
            isFallback = true;
          }
          
          // Expand the bounding box by a tiny 2% if detected, or 0% if using the generic fallback
          const expandX = isFallback ? 0 : width * 0.02;
          const expandY = isFallback ? 0 : height * 0.02;
          
          xmin = Math.round(Math.max(0, xmin - expandX));
          ymin = Math.round(Math.max(0, ymin - expandY));
          xmax = Math.round(Math.min(img.width, xmax + expandX));
          ymax = Math.round(Math.min(img.height, ymax + expandY));
          
          width = Math.round(xmax - xmin);
          height = Math.round(ymax - ymin);

          if (width <= 0 || height <= 0) return resolve(base64Image);

          // Create a temporary canvas for the downscaled/upscaled blur effect
          // Scale down to a tiny resolution to blend the details and destroy readable text
          const blurCanvas = document.createElement("canvas");
          const tempWidth = 16;
          const tempHeight = 8;
          blurCanvas.width = tempWidth;
          blurCanvas.height = tempHeight;
          const blurCtx = blurCanvas.getContext("2d");
          if (!blurCtx) return resolve(base64Image);

          // Draw cropped region shrunk down
          blurCtx.drawImage(
            img,
            xmin, ymin, width, height,
            0, 0, tempWidth, tempHeight
          );

          // Draw a very subtle dark overlay on the shrunk image to ensure obscurity
          blurCtx.fillStyle = "rgba(0, 0, 0, 0.15)";
          blurCtx.fillRect(0, 0, tempWidth, tempHeight);

          // Draw it back stretched to original size (which blurs it beautifully and works cross-browser)
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(
            blurCanvas,
            0, 0, tempWidth, tempHeight,
            xmin, ymin, width, height
          );

          resolve(canvas.toDataURL("image/jpeg", 0.7));
        } catch (e) {
          console.warn("Failed to blur plate locally due to CORS taint, image will remain unblurred", e);
          resolve(base64Image);
        }
      };
      img.onerror = () => resolve(base64Image);
      // Important: Add crossOrigin so if we are loading a URL to blur, we don't taint the canvas
      if (!finalBase64.startsWith("blob:") && !finalBase64.startsWith("data:")) {
         img.crossOrigin = "anonymous";
      }
      img.src = finalBase64;
    });
  } catch (error) {
    console.warn("Error in blurLicensePlate:", error);
    return base64Image;
  }
}
