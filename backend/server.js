var express = require('express');
var fs = require('fs');

var jobs = require('./jobs')

var app = express();

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/map', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');

    fs.readFile('files/data1.txt', 'utf8', function(err, data) {
        if (err) throw err;
        res.end(data);
    });
});

app.get('/work', function(req, res){
  res.send(jobs.getWork({id:req.params.id}));
});

app.post('/jobDone', function(req, res){
  res.send(jobs.jobDone(req.body));
});

app.get('/', function(req, res){
  res.setHeader('Content-Type', 'text/plain');
  res.send(200, 'MapReduce API home page.');
});

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Page introuvable !');
});

app.listen(8080);

fs.readFile('files/data1.txt', 'utf8', function(err, data) {
  console.log(data);
  if (err) throw err;
  jobs.split(data);
});
