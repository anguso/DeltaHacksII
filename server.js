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
  if (req.query.family_name) {
    resource += '&family_name=' + req.query.family_name;
  }

  if (req.query.given_name) {
    resource += '&given_name=' + req.query.given_name;
  }

  request(resource, function (error, response, body) {
    if (error) res.status(500).send('Something went wrong!');
    body = JSON.parse(body);
    res.render('index', { members: body.objects });
  });
});

app.post('/', function (req, res) {

  if (req.body.given_name || req.body.family_name) {
    res.redirect('/?given_name=' + (req.body.given_name || '') + '&family_name=' + (req.body.family_name || ''));
    return;
  }

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

function renderProfileStats (error, response, body) {

}

app.get('/politicians/:id', function (req, res) {
  request('http://api.openparliament.ca/politicians/' + req.params.id, function (error, response, body) {
    if (error) res.status(500).send('Something went wrong');
    var member = JSON.parse(body);

    request('http://api.openparliament.ca' + member.related.ballots_url, function (error, response, body) {
      if (error) res.status(500).send('Something went wrong');
      body = JSON.parse(body);
      member.votes = body.objects;

      member.yea = 0;
      member.nay = 0;
      member.votes.forEach(function (vote) {
        if (vote.ballot === "Yes") {
          member.yea++;
        }
      });
      member.nay = member.votes.length - member.yea;
      member.positivity = Math.round((member.yea/member.votes.length)*100);
      // calculate yes vs no score
      request('http://api.openparliament.ca' + member.related.ballots_url + '&dissent=True', function (error, response, body) {
        if (error) res.status(500).send('Something went wrong');
        body = JSON.parse(body);

        member.dissentYes = 0;
        member.dissentNo = 0;

        body.objects.forEach(function (vote) {
          if (vote.ballot === "Yes") {
            member.dissentYes++;
          } else if (vote.ballot === "No") {
            member.dissentNo++;
          }
        });

        res.render('politicians', member);
      });
    });
  });
});

app.get('/about', function (req, res) {
  res.render('about')
})

// catch all non-registered routes as 404s
app.get('*', function (req, res) {
  res.status(404).send('404 Not Found lol.');
});

app.listen(port, function () {
  console.log('Listening on port 3000...');
})
