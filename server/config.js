'use strict';

const config = {
	env         : process.env.NODE_ENV,
	port_record : process.env.PORT_RECORD || 6000,
	port_client : process.env.PORT_CLIENT || 3000
};

module.exports = config;
