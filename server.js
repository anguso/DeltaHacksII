var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var handlebars = require('express-handlebars');

var app = express();
var port = process.env.PORT || 3000;

app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/bower', express.static('bower_components'));
app.use('/public/assets', express.static('assets'));

function errorLog (e) {
  console.log('ERROR: ' + e.message);
}

app.get('/', function (req, res) {
  var resource = 'http://api.openparliament.ca/politicians/?limit=10';
  if (req.query.family_name && req.query.given_name) {
    resource += '&family_name=' + req.query.family_name + '&given_name=' + req.query.given_name;
  }

  request(resource, function (error, response, body) {
    if (error) res.status(500).send('Something went wrong!');
    body = JSON.parse(body);
    res.render('index', { members: body.objects });
  });
});

app.post('/', function (req, res) {
  request('http://represent.opennorth.ca/postcodes/' + req.body.postal_code, function (error, response, body) {
    if (error) res.status(500).send('Something went wrong!');
    body = JSON.parse(body);
    var representative;

    body.representatives_centroid.forEach(function (rep) {
      if (rep.elected_office === 'MP') {
        representative = rep;
        return;
      }
    });

    res.redirect('/?given_name=' + representative.first_name + '&family_name=' + representative.last_name);
  });
});

app.get('/politicians/:id', function (req, res) {
  console.log(req.params.id);
  res.status(200).send('OK');
});

// catch all non-registered routes as 404s
app.get('*', function (req, res) {
  res.status(404).send('404 Not Found lol.');
});

app.listen(port, function () {
  console.log('Listening on port 3000...');
})
