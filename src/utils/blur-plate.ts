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

    const res = await fetch("/api/blur-license-plate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.warn("Failed to detect plate:", await res.text());
      return base64Image;
    }

    const data = await res.json();
    const bbox = data.bbox; // [ymin, xmin, ymax, xmax] (0 to 1000)
    const returnedBase64 = data.base64Image || base64Image;

    if (!bbox || bbox.length !== 4 || bbox.every((val: number) => val === 0)) {
      return base64Image;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(base64Image);

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Calculate coordinates
        let ymin = (bbox[0] / 1000) * img.height;
        let xmin = (bbox[1] / 1000) * img.width;
        let ymax = (bbox[2] / 1000) * img.height;
        let xmax = (bbox[3] / 1000) * img.width;

        let width = xmax - xmin;
        let height = ymax - ymin;
        
        // Expand the bounding box by 15% on each side to ensure it covers the whole plate
        const expandX = width * 0.15;
        const expandY = height * 0.15;
        
        xmin = Math.max(0, xmin - expandX);
        ymin = Math.max(0, ymin - expandY);
        xmax = Math.min(img.width, xmax + expandX);
        ymax = Math.min(img.height, ymax + expandY);
        
        width = xmax - xmin;
        height = ymax - ymin;

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
      };
      img.onerror = () => resolve(base64Image);
      img.src = returnedBase64;
    });
  } catch (error) {
    console.warn("Error in blurLicensePlate:", error);
    return base64Image;
  }
}
