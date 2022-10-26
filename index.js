require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

//connect to db
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, 
    () => console.log('Connected to DB')
  )

//url schema
const shortUrlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

//schema into model
const ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);

app.use(cors());

//body-parser
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

//find one by original url
const findOneByOriginalUrl = (url, done) => {
  ShortUrl.findOne({original_url: url}, (err, doc) =>{
    if(err) return done(err);
    done(null, doc);
  });
}

//find one by short url
const findOneByShortUrl = (shortUrl, done) => {
  ShortUrl.findOne({short_url: shortUrl}, (err, doc) => {
    if(err) return done(err);
    done(null, doc);
  });
}

//create and save url
const createAndSaveUrl = (url, done) => {
  ShortUrl.count((err, docsLength) => {
    if(err) return done(err);
    //first entity
    if(docsLength == 0){
      new ShortUrl({original_url: url, short_url: 0})
      .save((err, doc) => {
        if(err) return done(err);
        done(null, {original_url: doc.original_url, short_url: doc.short_url});
      });
    }
    else {
      new ShortUrl({ original_url: url, short_url: docsLength})
      .save((err, doc)=> {
        if(err) return done(err);
        done(null, {original_url: doc.original_url.at, short_url: doc.short_url});
      });
    }
  });
}

//test valid url
const testValidUrl = (url, done) => {
  if(/^https?:\/\/(w{3}.)?[\w-]+.com(\/\w+)*/.test(url)){
    dns.lookup(url.replace(/^https?:\/\//, ''), (err, address, family) => {
      if(err) return done(err);
      done(null, address);
    });
  }
  else
    done(null, null);
}

//api new short url
app.post('/api/shorturl/new', (req, res) => {
  testValidUrl(req.body.url, (err, address) => {
    if(err) return res.json(err);
    if(address == null)
      return res.json({error: 'invalid URL'});

      findOneByOriginalUrl(req.body.url, (err, data) => {
        if (err) return res.json(err);
        //if url exists already
        if (data){
          res.json({original_url: data.original_url, short_url: data.short_url});
        }
        else {
          createAndSaveUrl(req.body.url, (err, doc) => {
            if(err) return res.json(err);
            res.json(doc);
          });
        }
      })
  });
});

app.get('/api/shorturl/:shortUrl', (req, res) =>{
  findOneByShortUrl(req.params.shortUrl, (err, doc) => {
    if (err) return res.json(err);
    if (doc == null)
      res.json({error: 'invalid short URL'});
    else
      res.redirect(doc.original.url);
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
