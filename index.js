require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns');
const validURL = require('valid-url');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

//connect to db
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, 
    () => console.log('Connected to DB')
  )

//url schema
const urlSchema = new mongoose.Schema({
  originalURL: String,
  shortURL: String, 
});

//schema into model
const URL = mongoose.model('URL', urlSchema);

app.use(cors());

//body-parser
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Response for POST Request
app.post('/api/shorturl', async (req, res)=> {
  const { url } = req.body;
  const shortURL = shortID.generate();
  console.log(validURL.isUri(url));
  if(validURL.isWebUri(url) === undefined) {
    res.json({
      error: 'invalid url',
    });
  } else {
    try {
      let findOne = await URL.findOne({
        originalURL: url,
      });
      if (findOne) {
        res.json({
          original_url: findOne.originalURL,
          short_url: findOne.shortURL,
        });
      } else {
        findOne = new URL({
          originalURL: url,
          shortURL,
        });
        await findOne.save();
        res.json({
          original_url: findOne.originalURL,
          short_url: findOne.shortURL,
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json('Server error ...');
    }
  }
});

// Redirect shortened URL to Original URL
app.get('/api/shorturl/:shortURL?', async (req, res) => {
  try {
    const urlParams= await URL.findOne({
      shortURL: req.params.shortURL,
    });
    if (urlParams) {
      return res.redirect(urlParams.originalURL);
    }
    return res.status(404).json('No URL found');
  } catch (err){
    console.log(err);
    res.status(500).json('Server error ..');
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
