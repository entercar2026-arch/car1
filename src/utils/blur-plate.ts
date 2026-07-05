export async function blurLicensePlate(base64Image: string): Promise<string> {
  try {
    const res = await fetch("/api/blur-license-plate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageBase64: base64Image }),
    });

    if (!res.ok) {
      console.error("Failed to detect plate:", await res.text());
      return base64Image;
    }

    const data = await res.json();
    const bbox = data.bbox; // [ymin, xmin, ymax, xmax] (0 to 1000)

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
        const ymin = (bbox[0] / 1000) * img.height;
        const xmin = (bbox[1] / 1000) * img.width;
        const ymax = (bbox[2] / 1000) * img.height;
        const xmax = (bbox[3] / 1000) * img.width;

        const width = xmax - xmin;
        const height = ymax - ymin;

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
        ctx.filter = `blur(${Math.max(width, height) * 0.15}px)`;
        ctx.drawImage(blurCanvas, xmin, ymin);
        
        // Reset filter
        ctx.filter = 'none';

        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.onerror = () => resolve(base64Image);
      img.src = base64Image;
    });
  } catch (error) {
    console.error("Error in blurLicensePlate:", error);
    return base64Image;
  }
}
