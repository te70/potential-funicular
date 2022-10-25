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
app.get("/api/:date?", (req,res) => {
  const givenDate = req.params.date;
  let date;
  
  //check if no date provided
  if (!givenDate) {
    date = new Date();
  } else {
   //check if unix time
   //number string mulitplied by 1 gives this number, date string gives Nan
   checkUnix = givenDate * 1;
    date = isNaN(checkUnix) ? new Date(givenDate) : new Date(checkUnix);
  }

 //check if valid format
  if (date == "Invalid Date") {
    res.json({ error: "Invalid Date" });
  } else {
    const unix = date.getTime();
    const utc = date.toUTCString();
    res.json({ unix, utc});
  }
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
