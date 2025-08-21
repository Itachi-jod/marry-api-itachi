// index.js
import { createCanvas, loadImage } from "@napi-rs/canvas";
import axios from "axios";

export default async function handler(req, res) {
  const { avatar1, avatar2 } = req.query;

  if (!avatar1 || !avatar2) {
    return res.status(400).json({ error: "Missing avatar URLs. Use ?avatar1=URL&avatar2=URL" });
  }

  try {
    // Load background template
    const template = await loadImage("https://i.ibb.co/5TwSHpP/Guardian-Place-full-1484178.jpg");

    // Load avatars from URLs
    const [av1Resp, av2Resp] = await Promise.all([
      axios.get(avatar1, { responseType: "arraybuffer" }),
      axios.get(avatar2, { responseType: "arraybuffer" }),
    ]);

    const avone = await loadImage(Buffer.from(av1Resp.data));
    const avtwo = await loadImage(Buffer.from(av2Resp.data));

    // Create canvas same size as template resized in Jimp
    const canvas = createCanvas(600, 338);
    const ctx = canvas.getContext("2d");

    // Draw the template
    ctx.drawImage(template, 0, 0, 600, 338);

    // Helper to draw circular avatars
    const drawCircleImage = (img, x, y, size) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();
    };

    // Align avatars according to your original Jimp code
    drawCircleImage(avone, 262, 0, 75); // first avatar
    drawCircleImage(avtwo, 350, 69, 80); // second avatar

    // Send final image as PNG
    res.setHeader("Content-Type", "image/png");
    const buffer = await canvas.encode("png");
    return res.send(buffer);

  } catch (err) {
    console.error("Canvas error:", err);
    return res.status(500).json({ error: "Error generating image" });
  }
      }
