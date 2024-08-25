const express = require('express');
const multer = require('multer');
const nsfwjs = require('nsfwjs');
const path = require('path');
const fs = require('fs');
const { Canvas, Image } = require('canvas');

const app = express();
const upload = multer({ dest: 'uploads/' });

let model;
(async () => {
  model = await nsfwjs.load();
})();

app.post('/check-image', upload.single('profilePicture'), async (req, res) => {
  if (!model) {
    return res.status(500).send('Modal couldnt install.');
  }

  const filePath = req.file.path;
  const img = new Image();
  img.src = fs.readFileSync(filePath);

  const canvas = new Canvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const predictions = await model.classify(canvas);

  const isSafe = predictions.every(prediction => 
    (prediction.className === 'Neutral' || prediction.className === 'Drawing') || prediction.probability < 0.8
  );

  fs.unlinkSync(filePath); // Delete temporary file

  if (!isSafe) {
    return res.status(400).send('NSFW detected.');
  }

  res.send('Dosya güvenli.');
});

app.listen(3000, () => {
  console.log('Node.js server working on port 3000.');
});
