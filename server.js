var express = require('express');
var bodyParser = require('body-parser');
var handlebars = require('express-handlebars');

var app = express();

app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use('/bower', express.static('bower_components'));
app.use('/public/assets', express.static('assets'));

app.get('/', function (req, res) {
  res.render('index', { hello: 'hello world!'});
});

app.get('/politicians/:id', function (req, res) {
  res.status(200);
});

app.listen(3000, function () {
  console.log('Listening on port 3000...');
})
