var express = require('express');


var jobs = require('./jobs')

var app = express();



var bodyParser = require('body-parser')
app.use( bodyParser.json({limit: '50mb'}) );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true,
  limit:'50mb'
}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/work', function(req, res){
  var x = jobs.getWork();
  console.log(x);
  res.send(x);
});

app.post('/jobDone', function(req, res){
  res.send(jobs.jobDone(req.body));
});

app.get('/', function(req, res){
  res.setHeader('Content-Type', 'text/plain');
  res.send(200, 'MapMine API home page.');
});

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Page introuvable !');
});

app.listen(8080);
console.log("Server started. Waiting for connections.")
