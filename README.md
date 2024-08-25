# nsfw-checker
Nudity, nsfw checker on Node.js with PHP connection

# What does it?
This repository guides people who working in php and want to check clients images without other API's. NSFW checking request sending from PHP and process happening in node.js. When process is done php recieves a response about picture.

# Installation

Fistly prepare your directory which node.js wil work in:
```
mkdir nsfw-checker
cd nsfw-checker
```
then create a node.js project:
```
npm init -y
```
You can download libraries right now:
```
npm install nsfwjs express body-parser multer canvas
```
After than create index.js[^1] file in project directory adn edit file with code below:
```
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
```
After node.js code add your php code to code below:
```
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:3000/check-image');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, [
  'profilePicture' => new CURLFile($uploadPath)
]);
curl_setopt($ch, CURLOPT_HEADER, 0);

$output = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 400) {
  // //File contains nsfw
} elseif ($httpCode == 200) {
  //File does not contains nsfw
} else {
  //Unknown response
}
```
> [!IMPORTANT]
> You need to upload the file temporarly and provide the ```$uploadPath``` variable before the above code

[^1]: The project main file. Default: index.js

