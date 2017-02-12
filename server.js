var express = require('express');
var mongo = require('mongodb').MongoClient;

const SITEURL = 'https://arhman-url-shortener.gomix.me/'

var app = express();
var dbUrl = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.DB_PORT+'/'+process.env.DB;

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html', function(err) {
    if (err) throw new Error("Website is down!");
  });
});

app.get('/:link', function(req, res) {
  var link = SITEURL + req.params.link;
  
  if (link != 'favicon.ico') {
    mongo.connect(dbUrl, function(err, db) {
      if (err) throw new Error(err);

      var urls = db.collection('urls');

      urls.findOne({
        "short": link
      }, function(err, result) {
        if (err) throw new Error('Cannot connect');
        db.close();
        if (result) {
          res.redirect(result.url)
        } else {
          res.send("Link not found!");
        }
      });
    });
  }
});

app.get('/new/:url*', function(req, res) {
  var url = req.url.slice(5);
  var sUrl = SITEURL + genLink();
  var json = {}
  
  if (!validURL(url)) {
    res.send("Invalid url. Make sure you provide a valid url with correct protocol");
  } else {
      mongo.connect(dbUrl, function(err, db) {
        if (err) throw new Error("Cannot connect")
        var collection = db.collection('urls');
        collection.insert(
          {"short": sUrl, "url": url},
        function(err, results) {
          db.close();
      });
    });
  
    json = {
      "url": url,
      "short": sUrl
    };
  }
  
  res.json(json);
});

app.listen(3000);

function genLink() {
  return Math.floor((Math.random()*9000)+1000);
}


function validURL(url) {
   // Regex from https://gist.github.com/dperini/729294
    var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    return regex.test(url);
  }
