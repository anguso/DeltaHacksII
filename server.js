var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var handlebars = require('express-handlebars');

var app = express();
var port = process.env.PORT || 3000;

app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use('/bower', express.static('bower_components'));
app.use('/public/assets', express.static('assets'));

function errorLog (e) {
  console.log('ERROR: ' + e.message);
}

app.get('/', function (req, res) {
  request('http://api.openparliament.ca/politicians/?limit=10', function (error, response, body) {
    if (error) res.status(500).send('Something went wrong!');
    body = JSON.parse(body);
    res.render('index', { members: body.objects });
  });
});

app.get('/politicians/:id', function (req, res) {
  request('http://api.openparliament.ca/politicians/' + req.params.id, function (error, response, body) {
   if (error) res.status(500).send('Something went wrong');
   body = JSON.parse(body);
   res.render('politicians', body);
  });
});

// catch all non-registered routes as 404s
app.get('*', function (req, res) {
  res.status(404).send('404 Not Found lol.');
});

app.listen(port, function () {
  console.log('Listening on port 3000...');
})
