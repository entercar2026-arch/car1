with open('src/components/CarCard.tsx', 'r') as f:
    text = f.read()

old_block = """  const telegramShareLink = useMemo(() => {
    const shareUrl = window.location.href;
    const cleanDescription = (car.description || "A great car for you.").trim();
    const formattedDesc = cleanDescription.endsWith(".") ? cleanDescription : `${cleanDescription}.`;

    const cleanText = `Check out this ${car.name}!
Price: $${car.price.toLocaleString()} / month
Description: ${formattedDesc}
${car.image ? `\\nPhoto: ${car.image}` : ""}${effectiveVideoUrl ? `\\nVideo: ${effectiveVideoUrl}` : ""}`;

    return `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(cleanText)}`;
  }, [car.name, car.price, car.description, car.image, effectiveVideoUrl]);

  const whatsAppShareLink = useMemo(() => {
    const shareUrl = window.location.href;
    const cleanDescription = (car.description || "A great car for you.").trim();
    const formattedDesc = cleanDescription.endsWith(".") ? cleanDescription : `${cleanDescription}.`;

    const cleanText = `Check out this ${car.name}!
Price: $${car.price.toLocaleString()} / month
Description: ${formattedDesc}
${car.image ? `\\nPhoto: ${car.image}` : ""}${effectiveVideoUrl ? `\\nVideo: ${effectiveVideoUrl}` : ""}`;

    return `https://wa.me/?text=${encodeURIComponent(`${shareUrl}\\n\\n${cleanText}`)}`;
  }, [car.name, car.price, car.description, car.image, effectiveVideoUrl]);"""

new_block = """  const telegramShareLink = useMemo(() => {
    const shareUrl = window.location.href;
    const cleanDescription = (car.description || "A great car for you.").trim();
    const formattedDesc = cleanDescription.endsWith(".") ? cleanDescription : `${cleanDescription}.`;

    let mediaLinks = "";
    if (car.image) {
      mediaLinks += `\\nPhoto 1: ${car.image}`;
    }
    if (car.photos && Array.isArray(car.photos) && car.photos.length > 0) {
      car.photos.forEach((photo, index) => {
        mediaLinks += `\\nPhoto ${index + 2}: ${photo}`;
      });
    }
    if (effectiveVideoUrl) {
      mediaLinks += `\\nVideo: ${effectiveVideoUrl}`;
    }

    const cleanText = `Check out this ${car.name}!\\nPrice: $${car.price.toLocaleString()} / month\\nDescription: ${formattedDesc}\\n${mediaLinks}`;

    return `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(cleanText)}`;
  }, [car, effectiveVideoUrl]);

  const whatsAppShareLink = useMemo(() => {
    const shareUrl = window.location.href;
    const cleanDescription = (car.description || "A great car for you.").trim();
    const formattedDesc = cleanDescription.endsWith(".") ? cleanDescription : `${cleanDescription}.`;

    let mediaLinks = "";
    if (car.image) {
      mediaLinks += `\\nPhoto 1: ${car.image}`;
    }
    if (car.photos && Array.isArray(car.photos) && car.photos.length > 0) {
      car.photos.forEach((photo, index) => {
        mediaLinks += `\\nPhoto ${index + 2}: ${photo}`;
      });
    }
    if (effectiveVideoUrl) {
      mediaLinks += `\\nVideo: ${effectiveVideoUrl}`;
    }

    const cleanText = `Check out this ${car.name}!\\nPrice: $${car.price.toLocaleString()} / month\\nDescription: ${formattedDesc}\\n${mediaLinks}`;

    return `https://wa.me/?text=${encodeURIComponent(`${shareUrl}\\n\\n${cleanText}`)}`;
  }, [car, effectiveVideoUrl]);"""

text = text.replace(old_block, new_block)

with open('src/components/CarCard.tsx', 'w') as f:
    f.write(text)
