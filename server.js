'use strict';

const cors = require('cors');
const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const net = require('net');
const path = require('path');

const config = require('./server/config');

const app = express();

app.use(cors());
app.use(express.static('public/bower_components'));
app.use(express.static('public'));
console.log(__dirname);
app.get('/', function (req, res) {
	res.sendFile('public/index.html', {root: __dirname});
});

// new ffmpeg({source: 'records/kalacs.h264'})
// 	.output('records/kalacs.webm')
// 	.run();

app.get('/video', function (req, res) {
	var file = path.resolve(__dirname, 'records/kalacs.mp4');

	req.headers.range = '0-';
	var range = req.headers.range;
	console.log(req.headers);
	var positions = range.replace(/bytes=/, '').split('-');
	var start = parseInt(positions[0], 10);

	fs.stat(file, function (err, stats) {
		console.log(stats);
		var total = stats.size;
		var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
		var chunksize = (end - start) + 1;

		res.writeHead(206, {
			'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
			'Accept-Ranges': 'bytes',
			'Content-Length': chunksize,
			'Content-Type': 'video/mp4'
		});

		var stream = fs.createReadStream(file, { start: start, end: end });
			stream.pipe(res);
	});




	// var outstream = fs.createReadStream(file);
	// res.pipe(outstream);
	// outstream.on('data', chunk => {
	// 	console.log('CHUNK');
	// });
	// outstream.on('end', () => {
	// 	console.log('END');
	// });
	// fs.readFile('records/kalacs.h264', (error, data) => {
	// 	if (error) {
	// 		throw error;
	// 	}
	// 	console.log(data);
	// 	res.pipe(data);
	// });
});

app.listen(config.port_client);

net.createServer(function (socket) {
	var writeVideo = fs.createWriteStream('records/kalacs.h264');

	socket.on('data', function (chunk) {
		writeVideo.write(chunk);
	});
	socket.on('close', function () {
		console.log('thatsallfolks');
		// writeVideo.end();
	});
	console.log('dat net');
}).listen(config.port_record);
