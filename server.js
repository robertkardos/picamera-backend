'use strict';

const cors = require('cors');
const debug = require('debug')('recording');
const express = require('express');
const fs = require('fs');
const moment = require('moment');
const net = require('net');
const schedule = require('node-schedule');
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

app.get('/video', function (req, res) {
	var file = path.resolve(__dirname, 'records/kalacs.mp4');
	console.log(req.headers.range);
	req.headers.range = '0-36000';
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

		console.log(`start: ${start}`);
		console.log(`end: ${end}`);
		var stream = fs.createReadStream(file, { start: start, end: end });
		stream.pipe(res);
	});
});

app.listen(config.port_client);

net.createServer(function (socket) {
	let yearMonthFolder;
	let startTime;
	let writeVideo;

	// run this every midnight
	schedule.scheduleJob('0 0 * * *', createNewVideoFile);

	function closeFile () {
		writeVideo.end();
		const endTime = moment().format('DD_HH:mm:ss');
		fs.rename(`records/${yearMonthFolder}/${startTime}.h264`, `records/${yearMonthFolder}/${startTime}_-_${endTime}.h264`);
		debug('video file closed');
	}

	function createNewVideoFile () {
		if (writeVideo) {
			closeFile();
		}

		yearMonthFolder = moment().format('YYYY-MM');
		if (!fs.existsSync(`records/${yearMonthFolder}`)) {
			fs.mkdirSync(`records/${yearMonthFolder}`);
		}
		if (!fs.existsSync('records')) {
			fs.mkdirSync('records');
		}
		startTime = moment().format('DD_HH:mm:ss');
		writeVideo = fs.createWriteStream(`records/${yearMonthFolder}/${startTime}.h264`);
		debug('video file created');
	}

	createNewVideoFile();

	socket.on('data', function (chunk) {
		writeVideo.write(chunk);
	});
	socket.on('close', function () {
		closeFile();
		debug('camera disconnected');
	});
	debug('camera connected...');
}).listen(config.port_record);
