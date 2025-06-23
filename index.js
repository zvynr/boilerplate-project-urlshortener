require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
let bodyParser = require('body-parser');
const { log } = require('console');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const myMap = new Map();
let id = 1;
app.post('/api/shorturl', function (req, res) {
  let url = req.body.url;

let hostname;
try {
  const parsedUrl = new URL(url);

  // Hanya izinkan http atau https
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return res.json({ error: 'invalid url' });
  }

  hostname = parsedUrl.hostname;
} catch (e) {
  return res.json({ error: 'invalid url' });
}

// Validasi DNS
dns.lookup(hostname, (err) => {
  if (err) {
    return res.json({ error: 'invalid url' });
  }

  // Cek apakah URL sudah ada
  for (const [key, value] of myMap.entries()) {
    if (value === url) {
      return res.json({ original_url: value, short_url: key });
    }
  }

  // Tambah jika belum ada
  myMap.set(id, url);
  return res.json({ original_url: url, short_url: id++ });
});

});
app.get("/api/shorturl/:key?", (req, res) => {
  let key = parseInt(req.params.key);
  console.log(key);
  console.log(myMap.get(key));
  console.log(myMap.get(key-1));
  if (myMap.has(key)) {
    return res.redirect(myMap.get(key));
  } else {
    return res.json({ error: 'Invalid url' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
