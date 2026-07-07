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
    if (!bbox || bbox.length !== 4 || bbox.every((val: number) => val === 0)) {
      console.warn("Detection returned empty bounding box or failed, falling back to generic bottom-center blur");
      // Approximate position of a license plate on a car photo (bottom center)
      // ymin: 65%, xmin: 30%, ymax: 85%, xmax: 70%
      finalBbox = [650, 300, 850, 700];
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
            // Invalid bounding box, fallback to bottom center
            ymin = 0.65 * img.height;
            xmin = 0.30 * img.width;
            ymax = 0.85 * img.height;
            xmax = 0.70 * img.width;
            width = xmax - xmin;
            height = ymax - ymin;
          }
          
          // Expand the bounding box by 20% on each side to ensure it covers the whole plate
          const expandX = width * 0.20;
          const expandY = height * 0.20;
          
          xmin = Math.round(Math.max(0, xmin - expandX));
          ymin = Math.round(Math.max(0, ymin - expandY));
          xmax = Math.round(Math.min(img.width, xmax + expandX));
          ymax = Math.round(Math.min(img.height, ymax + expandY));
          
          width = Math.round(xmax - xmin);
          height = Math.round(ymax - ymin);

          if (width <= 0 || height <= 0) return resolve(base64Image);

          // Create a temporary canvas for the blur effect
          const blurCanvas = document.createElement("canvas");
          blurCanvas.width = width;
          blurCanvas.height = height;
          const blurCtx = blurCanvas.getContext("2d");
          if (!blurCtx) return resolve(base64Image);

          // Draw the region to blur onto the temp canvas
          blurCtx.drawImage(
            img,
            xmin, ymin, width, height,
            0, 0, width, height
          );

          // Apply blur
          ctx.filter = `blur(${Math.max(width, height) * 0.3}px)`;
          ctx.drawImage(blurCanvas, xmin, ymin);
          
          // Also draw a semi-transparent overlay to further obscure it
          ctx.filter = 'none';
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
          ctx.fillRect(xmin, ymin, width, height);

          resolve(canvas.toDataURL("image/jpeg", 0.6));
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
