'use strict';

const serviceName = 'JH ETF Fund Facts'
const express = require('express');
// It's a middleware logger for request and response object. Do not mix up with the application log
const logger = require('morgan');
//for application level logging
const log4js = require('log4js');
const path = require('path');
const fs = require('fs')
//Start of Log file configurations for Morgan 
const rfs = require('rotating-file-stream');
const bodyParser = require('body-parser');

const etf = require('./etf.js').ETF;
const cfg = require('./config.js');
const API = function () {};
const apiObj = new API();
etf.init(etf);

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

//ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
//create a rotating write stream
const accessLogStream = rfs('access.log', {
	interval: '1d', // rotate daily
	path: logDirectory
});
//End of Log file configurations for Morgan

appLogger.info('index.js Initialized');

const restService = express();

restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.use(bodyParser.json());


restService.post('/api', function(req, res) {
	
    const requestParams = req.body.result && req.body.result.parameters ? req.body.result.parameters : {};
    
    const actionName = req.body.result && req.body.result.action ? req.body.result.action : ''; 
    
    appLogger.info('Request Params ',requestParams);
    appLogger.info('Action name ',actionName);
    
    if(actionName == 'wmr-news'){
    	apiObj.handleWMRResponse(req, res);
    }else if(actionName == 'factsheet'){
    	apiObj.handleFactSheetResponse(req, res);
    }else if(actionName == 'etffund'){
    	apiObj.handleETFFundResponse(req, res);
    }else{
    	apiObj.unknownActionResponse(req, res);
    }
    	
});

API.prototype.handleWMRResponse = function(req, res){
	
	etf.getWMRDataFromURL(function(data){
		let speech,header,weeklynews;
		if(data !== "ERROR"){
			weeklynews = data.text.replace(/<\/?[^>]+(>|$)/g, "");
			speech = "Here is your flash briefing. "+weeklynews.replace(/&nbsp;/gi, "").replace(/\r?\n/g, "");
		    header = "WMR News!";
		}else{
			speech = "Sorry, there was a technical error. Please try after sometime";
			header = "WMR News - Error!";
		}

		appLogger.info('WMR data',data);
		
		return res.json({
	        speech: speech,
	        displayText: speech,
	        source: header
	    });
	});
}


API.prototype.handleFactSheetResponse = function(req, res){
	
	const requestParams = req.body.result && req.body.result.parameters ? req.body.result.parameters : {};
	const fundName = requestParams.fundName ? requestParams.fundName.toLowerCase() : undefined;
	
	appLogger.info("fundName ",fundName)
	
	if(!fundName){
		const speech = "Can you make the request again with a fund name?";
		const header = "Fact Sheet!";
		return res.json({
	        speech: speech,
	        displayText: speech,
	        source: header
	    });		
	}
	
	etf.postFactSheetRequest(function(data){
		appLogger.info('Fact Sheet data',data);
		let speech,header;
		if(!data || data.status == "ERROR"){
			speech = data.statusMsg;
		    header = "Fact Sheet - Error!";
		}else{
			speech = "The document has been emailed to you. Please check your inbox";
			header = "Fact Sheet!";
		}

		return res.json({
	        speech: speech,
	        displayText: speech,
	        source: header
	    });
	},fundName);
}



API.prototype.handleETFFundResponse = function(req, res){
	
	const requestParams = req.body.result && req.body.result.parameters ? req.body.result.parameters : {};
	const fundName = requestParams.fundName ? requestParams.fundName.toLowerCase() : undefined;
	const fundAttribute = requestParams.fundAttribute ? requestParams.fundAttribute.toLowerCase() : undefined;
	
	appLogger.info("fundName ",fundName);
	appLogger.info("fundAttribute ",fundAttribute);
	
	let speech,header;
	
	 if(fundAttribute){
         appLogger.info("Fund Attribute Info ",etffunds[fundName][fundDetailAttr]);
         speech = etf.etffunds[fundName][fundDetailAttr];
         header = "ETF - Fund Attribute";
     }else{
        const fundInfo = etf.etffunds[fundName].fundInfo;
        speech = fundInfo + ". Do you want to hear more details about "+fundName+" fund?"    
        header = "ETF - Fund Info";
     }	
	
	return res.json({
        speech: speech,
        displayText: speech,
        source: header
    });
}


API.prototype.unknownActionResponse = function(req, res){
	
	return res.json({
        speech: speech,
        displayText: speech,
        source: header
    });
}


restService.listen((process.env.PORT || 3000), function() {
    appLogger.info("Server up and listening");
});
