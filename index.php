$uploadPath = ""; //Provide the file's temporary path

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
