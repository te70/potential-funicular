// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// timestamp API
app.get('/api/timestamp/:dateString?', (req,res) => {
  const dateString = req.params.dateString;
  let date;
  // if the date string is empty, it should be quivalent to the new Date() to return the current time in unix format and UTC format
  // i.e the service uses the current timestamp
  if (!dateString) {
    date = new Date();
  } else {
    // if datestring is not empty
    // if datestring is an integer, convert datestring to an integer
    if(!isNaN(dateString)) {
      date = new Date(parseInt(dateString));
    } else {
      date = new Date(dateString);
    }
  }
  // if the date string is invalid the api returns an error JSON
  // {"error": "Invalid Date"}
  if (date.toString() === 'Invalid Date') {
    res.json({ error: date.toString() });
  } else {
    // if the date string is valid the api returns a JSON in this format: {"unix": <date.getTime()>, "utc" : <date.toUTCString()>}
    res.json({ unix: date.getTime(), utc: date.toUTCString() });
  }
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
