'use strict';

var express = require('express');
var app = express();

/* Starting the Express.js server instance */
app.use(express.static('./dist'));
app.listen(5000, function () {
  console.log('Stock Market Prod Server is now listening on port 5000!');
});