'use strict';

const config = require('./src/server/config');
const express = require('express');
const app = express();

app.use(express.static('src/public/bower_components'));
app.use(express.static('src/public'));
console.log(__dirname);
app.get('/', function (req, res) {
	res.sendFile('src/public/index.html', {root: __dirname});
});
app.listen(config.port_client);
