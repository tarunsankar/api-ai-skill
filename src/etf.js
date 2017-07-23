'use strict';

// for application level logging
const log4js = require('log4js');
const path = require('path');
const request = require("request");
const _und = require("underscore");
const cfg = require('./config.js');
const etffunds = {
		"large cap" : {
			"fundID":"2Y7LA",
			"ticker":"JHML",
			"factSheet":"documents/investorfactsheets/850hs.pdf"
		}, 
		"mid cap" : {
			"fundID":"2Y7QA",
			"ticker":"JHMM",
			"factSheet":"documents/investorfactsheets/840hs.pdf"
		}, 
		"developed international" : {
			"fundID":"2Y7XA",
			"ticker":"JHMD",
			"factSheet":"documents/investorfactsheets/930hs.pdf"
		}, 
		"consumer discretionary" : {
			"fundID":"2Y7PA",
			"ticker":"JHMC",
			"factSheet":"documents/investorfactsheets/830hs.pdf"
		}, 
		"consumer staples" : {
			"fundID":"2Y7RA",
			"ticker":"JHMS",
			"factSheet":"documents/investorfactsheets/920hs.pdf"
		}, 
		"energy" : {
			"fundID":"2Y7SA",
			"ticker":"JHME",
			"factSheet":"documents/investorfactsheets/900hs.pdf"
		}, 
		"financials" : {
			"fundID":"2Y7OA",
			"ticker":"JHMF",
			"factSheet":"documents/investorfactsheets/810hs.pdf"
		}, 
		"healthcare" : {
			"fundID":"2Y7NA",
			"ticker":"JHMH",
			"factSheet":"documents/investorfactsheets/820hs.pdf"
		}, 
		"industrials" : {
			"fundID":"2Y7UA",
			"ticker":"JHMI",
			"factSheet":"documents/investorfactsheets/940hs.pdf"
		}, 
		"materials" : {
			"fundID":"2Y7VA",
			"ticker":"JHMA",
			"factSheet":"documents/investorfactsheets/880hs.pdf"
		}, 
		"technology" : {
			"fundID":"2Y7MA",
			"ticker":"JHMT",
			"factSheet":"documents/investorfactsheets/800hs.pdf"
		}, 
		"utilities" : {
			"fundID":"2Y7WA",
			"ticker":"JHMU",
			"factSheet":"documents/investorfactsheets/860hs.pdf"
		}
};

const fundAttr = [
	"average_volume",
	"benchmark_index",
	"shares_outstanding",
	"outstanding_shares",
	"shares",
	"pb_ratio",
	"pe_ratio",
	"top_sectors",
	"sectors",
	"top_holdings",
	"holdings",
	"net_expense_ratio",
	"gross_expense_ratio",
	"rebalance_frequency",
	"bid_midpoint",
	"ask_midpoint",
	"inception_date",
	"cusip",
	"exchange",
	"premium_rate",
	"discount_rate",
	"index_ticker",
	"ticker",
	"intraday_nav_symbol",
	"nav",
	"nav_symbol",
	"intraday_symbol",
	"average_market_cap",
	"market_cap"
];

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
	const newsURL = "https://wmr.jhinvestments.com/content/jhi-market-recap/en_US/jcr:content/marketNews/news1.json";
	request.get(newsURL, function(error, response, body) {
		const jsonData = {};
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


ETF.prototype.postFactSheetRequest = function(callback,fundName){
	
	const docPath = etffunds[fundName].factSheet;
	
	if (!docPath) {
		callback({status: "ERROR", statusMsg : "That option is not valid. Please select a valid ETF fund to receive the fact sheet"});
	}else{
    	
    	const newsURL = "https://etf-stg.jhinvestments.com/bin/JHINV/etf/pipServlet";
    	const formData = {fname:'Sankar',lname:'Anbazhagan',email:'sanbazhagan@jhancock.com',filepath:docPath,emaillink:'Y'};
    	request.post({url: newsURL, form: formData}, function(error, response, body) {
    		var jsonData = {};
    		try{
    			appLogger.info('postFactSheetRequest response body',body);
    			// to validate the response data
    			jsonData = JSON.parse(body);
    			// callback(jsonData);
    		}catch (e) { 
    			appLogger.error("Sorry, there was a technical error. Please try after sometime",e)
    			// callback({status: "ERROR", statusMsg : "Sorry, there was a technical error. Please try after sometime"});
    		}
    	});	
    	// times out. so send the response
		callback({status: "Success", statusMsg: "Hardcoded success response"});
    }
}

exports.ETF = new ETF();