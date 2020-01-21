var express = require('express');
var debug = require('debug')('{{name}}:router');
var router = express.Router();


debug.enabled = true;

/* GET home page. */

router.all('/', (req, res, next) => {
  debug("Request from %s for page %s", req.ip.substring(7, req.ip.length), req.url);
  next();
})

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
