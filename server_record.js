'use strict';

const config = require('./src/server/config');

const fs = require('fs');
const net = require('net');

net.createServer(function (socket) {
	var kalacsVideo = fs.createWriteStream('records/kalacs.h264');
	// socket.on('data', function (chunk) {
	// 	skalacsVideo += chunk;
	socket.pipe(kalacsVideo);
	// });
	socket.on('close', function () {
		console.log('thatsallfolks');
	});
	console.log('dat net');
}).listen(config.port_record);
