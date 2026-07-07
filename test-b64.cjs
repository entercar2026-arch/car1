const regex = /^data:([A-Za-z-+\/]+);base64,(.+)$/;
const str = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD";
const matches = str.match(regex);
console.log(matches ? matches.length : null);
