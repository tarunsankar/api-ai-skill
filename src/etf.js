'use strict';

// for application level logging
const log4js = require('log4js');
const path = require('path');
const request = require("request");

const cfg = require('./config.js');

//Application level logging.
const logDirectory = path.join(__dirname, 'log');
//Application level logging.
log4js.configure({
	appenders: {
		out:{ type: 'console' },
		app:{ type: 'file', filename: logDirectory+'/'+cfg.log4jFile }
	},
	categories: {
		default: { appenders: [ 'out', 'app' ], level: cfg.log4jLevel }
	}
});

const appLogger = log4js.getLogger();

appLogger.info('ETF.js Initialized');

const ETF = function () {};

ETF.prototype.getWMRDataFromURL = function(callback){
	var newsURL = "https://wmr.jhinvestments.com/content/jhi-market-recap/en_US/jcr:content/marketNews/news1.json";
	request.get(newsURL, function(error, response, body) {
		var jsonData = {};
		try{
			appLogger.info('getWMRDataFromURL response body',body);
			// to validate the response data
			jsonData = JSON.parse(body);
			callback(jsonData);
		}catch (e) { 
			appLogger.error("Error while getting WMR data",e)
			callback("ERROR");
		}
	});	
};

exports.ETF = new ETF();