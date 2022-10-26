var express = require('express');
var cors = require('cors');
require('dotenv').config()

//require and use "multer"
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/fileanlyse', upload.single('upfile'), (req, res) => {
  try {
    res.json({
      "name": req.file.originalname,
      "type": req.file.mimetype,
      "size": req.file.size
    });
  } catch (err){
    res.send(400);
  }
})


const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
