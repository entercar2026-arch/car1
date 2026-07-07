const fs = require('fs');
const { Canvas, Image } = require('canvas');

const img = new Image();
img.src = fs.readFileSync('car2.jpg');

const canvas = new Canvas(img.width, img.height);
const ctx = canvas.getContext('2d');
ctx.drawImage(img, 0, 0);

const bbox = [ 294, 224, 326, 446 ];
let ymin = (bbox[0] / 1000) * img.height;
let xmin = (bbox[1] / 1000) * img.width;
let ymax = (bbox[2] / 1000) * img.height;
let xmax = (bbox[3] / 1000) * img.width;

let width = xmax - xmin;
let height = ymax - ymin;

ctx.strokeStyle = 'red';
ctx.lineWidth = 5;
ctx.strokeRect(xmin, ymin, width, height);

fs.writeFileSync('car2_bbox2.jpg', canvas.toBuffer('image/jpeg'));
console.log("Saved car2_bbox2.jpg");
