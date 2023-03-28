var _ = require('underscore');
var express = require('express');
var http = require('http');
var logger = require('winston');
var path = require('path');
var  yargs = require('yargs/yargs')
var { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv)
).options({
	'config': {
	  type: 'string',
	  describe: 'Location of the configuration file',
	  default: './config.json'
	}
}).alias('h', 'help').argv;

logger.cli();
logger.level = 'debug';

var config = loadConfig(argv.config);

function loadConfig(configPath) {
	var config = {
		port: 8080,
		content: 'localhost:9000'
	};

	try {
		logger.info('loading config file from ' + configPath + '..');
		var data = require(configPath);
		_.extend(config, data);
	} catch (e) {
		logger.warn('failed to load config', e);
	}

	return config;
}

(function main() {
	var app = express();

	app.set('views', __dirname);
	app.set('view engine', 'ejs');

	app.use(express.static(path.join(__dirname, '..', 'build')));
	app.use(function (req, res, next) {
		res.locals.content = config.content;
		res.render('index');
	});

	var server = http.createServer(app);
	server.listen(config.port, function () {
		logger.info('web server is now listening on ' +  server.address().address + ":" + server.address().port);
	});

	return server;
})();
