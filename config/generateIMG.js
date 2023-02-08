const cloudinary = require("cloudinary").v2;
const canvas = require("canvas");

const generateIMG = async res => {
  // cloudinary.config({
  //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  //   api_key: process.env.CLOUDINARY_API_KEY,
  //   api_secret: process.env.CLOUDINARY_API_SECRET
  // });

  // const cvs = canvas.createCanvas(200, 200);
  // const ctx = cvs.getContext("2d");

  // ctx.fillStyle = "#FFF";
  // ctx.fillRect(0, 0, 200, 200);
  // ctx.fillStyle = "#000";

  // for (let i = 0; i < 6; i++) {
  //   const x = 50 + i * 30;
  //   const y = 50;
  //   ctx.beginPath();
  //   ctx.arc(x, y, 15, 0, Math.PI * 2);
  //   ctx.fill();
  // }

  // const buffer = cvs.toBuffer();
};

module.exports = generateIMG;
