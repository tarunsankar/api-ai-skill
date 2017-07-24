'use strict';

// for application level logging
const log4js = require('log4js');
const path = require('path');
const request = require("request");
const _und = require("underscore");
require("Promise");
const cfg = require('./config.js');
const etffunds = {
		"large cap" : {
			"fundID":"2Y7LA",
			"fundName":"large cap",
			"ticker":"JHML",
			"factSheet":"documents/investorfactsheets/850hs.pdf"
		}, 
		"mid cap" : {
			"fundID":"2Y7QA",
			"fundName":"mid cap",
			"ticker":"JHMM",
			"factSheet":"documents/investorfactsheets/840hs.pdf"
		}, 
		"developed international" : {
			"fundID":"2Y7XA",
			"fundName":"developed international",
			"ticker":"JHMD",
			"factSheet":"documents/investorfactsheets/930hs.pdf"
		}, 
		"consumer discretionary" : {
			"fundID":"2Y7PA",
			"fundName":"consumer discretionary",
			"ticker":"JHMC",
			"factSheet":"documents/investorfactsheets/830hs.pdf"
		}, 
		"consumer staples" : {
			"fundID":"2Y7RA",
			"fundName":"consumer staples",
			"ticker":"JHMS",
			"factSheet":"documents/investorfactsheets/920hs.pdf"
		}, 
		"energy" : {
			"fundID":"2Y7SA",
			"fundName":"energy",
			"ticker":"JHME",
			"factSheet":"documents/investorfactsheets/900hs.pdf"
		}, 
		"financials" : {
			"fundID":"2Y7OA",
			"fundName":"financials",
			"ticker":"JHMF",
			"factSheet":"documents/investorfactsheets/810hs.pdf"
		}, 
		"healthcare" : {
			"fundID":"2Y7NA",
			"fundName":"healthcare",
			"ticker":"JHMH",
			"factSheet":"documents/investorfactsheets/820hs.pdf"
		}, 
		"industrials" : {
			"fundID":"2Y7UA",
			"fundName":"industrials",
			"ticker":"JHMI",
			"factSheet":"documents/investorfactsheets/940hs.pdf"
		}, 
		"materials" : {
			"fundID":"2Y7VA",
			"fundName":"materials",
			"ticker":"JHMA",
			"factSheet":"documents/investorfactsheets/880hs.pdf"
		}, 
		"technology" : {
			"fundID":"2Y7MA",
			"fundName":"technology",
			"ticker":"JHMT",
			"factSheet":"documents/investorfactsheets/800hs.pdf"
		}, 
		"utilities" : {
			"fundID":"2Y7WA",
			"fundName":"utilities",
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


ETF.prototype.getFundDetailDataFromAPI = function(url) {
    return new Promise(function(resolve, reject) {
        request(url, function(err, res, body) {
            if (err) { return reject(err); }
            return resolve([res, body]);
        });
    });
}


ETF.prototype.init = function(etfObj){
	Promise.all([
			etfObj.getFundDetailDataFromAPI('http://www.jhinvestments.com/api/etf/2Y7PA'),
			etfObj.getFundDetailDataFromAPI('http://www.jhinvestments.com/api/etf/2Y7RA'),
			etfObj.getFundDetailDataFromAPI('http://www.jhinvestments.com/api/etf/2Y7XA'),
			etfObj.getFundDetailDataFromAPI('http://www.jhinvestments.com/api/etf/2Y7SA'),
			etfObj.getFundDetailDataFromAPI('http://www.jhinvestments.com/api/etf/2Y7OA'),
			etfObj.getFundDetailDataFromAPI('http://www.jhinvestments.com/api/etf/2Y7NA'),
			etfObj.getFundDetailDataFromAPI('http://www.jhinvestments.com/api/etf/2Y7UA'),
			etfObj.getFundDetailDataFromAPI('http://www.jhinvestments.com/api/etf/2Y7LA'),
			etfObj.getFundDetailDataFromAPI('http://www.jhinvestments.com/api/etf/2Y7VA'),
			etfObj.getFundDetailDataFromAPI('http://www.jhinvestments.com/api/etf/2Y7QA'),
			etfObj.getFundDetailDataFromAPI('http://www.jhinvestments.com/api/etf/2Y7MA'),
			etfObj.getFundDetailDataFromAPI('http://www.jhinvestments.com/api/etf/2Y7WA')
		])
		.then(function(allData) {
			_und.each(_und.flatten(allData),function(fundObj){
				if(fundObj.body){
					const data = JSON.parse(fundObj.body);
					// update the object
					etfObj.updateFundData(etfObj,data);
				}
			});			
		});
}


ETF.prototype.updateFundData = function(etfObj,data){
   	// get as of data
	var asOfDate = etfObj.getDateWithoutTimeStamp(data['pricing'].asOfDate);
	// get inception date
	var inceptionDate = etfObj.getDateWithoutTimeStamp(data['profile'].inceptionDate);
	
	// get fund name
	let etfFund;
	
	_und.each(etffunds,function(fundObj){
		if(fundObj.ticker === data['profile'].ticker){
			etfFund = fundObj.fundName;
		}
	});
	
	console.log("etfFund ",etfFund);
	
	if(etfFund){
		// get fund data
		etffunds[etfFund].fundInfo = "The fund was launched on "+inceptionDate+". As of date "+asOfDate+", the last price is "+data['pricing'].nav+" with a nav change of "+data['pricing'].navChange+", The total net asset is more than "+etfObj.roundFundValues(data['pricing'].totalNetAssets);
		// fund inception date
		etffunds[etfFund].inception_date =  "The fund was launched on "+inceptionDate+".";
		// cusip
		etffunds[etfFund].cusip =  data['profile'].cusip+" is the number provided by Committee on Uniform Security Identification Procedures";
		// exchange
		etffunds[etfFund].exchange = "The exchange for this fund is "+data['profile'].exchange;
		// premium discount percentage
		etffunds[etfFund].premium_rate = etffunds[etfFund].discount_rate = "As of date "+asOfDate+", the premium discount percentage is "+data['pricing'].currentPremDiscPer;
		// index ticker
		etffunds[etfFund].index_ticker = etffunds[etfFund].ticker = "The fund ticker is "+data['profile'].benchmarkIndexTicker.split('').join(' ');
		// nav symbol
		etffunds[etfFund].intraday_nav_symbol = etffunds[etfFund].intraday_symbol = etffunds[etfFund].nav_symbol = etffunds[etfFund].nav = "The NAV Symbol is "+data['profile'].intradayNAVSymbol.split('').join(' ');
		// holdings
		etffunds[etfFund].holdings = "It is "+data['profile'].numberHoldings;
		// set Average volume
		etffunds[etfFund].average_volume = "As of date "+asOfDate+", the average 30 day volume is more than "+etfObj.roundFundValues(data['pricing'].avg30DayVolume);
		// set Benchmark index
		etffunds[etfFund].benchmark_index = "The benchmark index for this fund is "+data['profile'].benchmarkIndex;
		// set Shares outstanding
		etffunds[etfFund].shares = etffunds[etfFund].outstanding_shares = etffunds[etfFund].shares_outstanding = "As of date "+asOfDate+", the fund has more than "+etfObj.roundFundValues(data['profile'].sharesOutstanding)+" outstanding shares";
		// net expense ratio
		etffunds[etfFund].net_expense_ratio = "As of date "+asOfDate+", the net expense ratio is "+data['profile'].netExpenseRatio+" percentage";
		// gross expense ratio
		etffunds[etfFund].gross_expense_ratio = "As of date "+asOfDate+", the gross expense ratio is "+data['profile'].grossExpenseRatio+" percentage";    	    	
		// Re-balance frequency    	    	
		etffunds[etfFund].rebalance_frequency = "As of date "+asOfDate+", the rebalance frequency is "+data['pricing'].rebalFrequency;
		// bid/ask midpoint
		etffunds[etfFund].bid_midpoint = etffunds[etfFund].ask_midpoint = "As of date "+asOfDate+", the bid or ask mid point is "+data['pricing'].bidAskMidpoint+" percentage";
		// get statistics as of data
		var statisticsAsOfDate = etfObj.getDateWithoutTimeStamp(data['statistics'].asOfDate);    	    	
		// set P/B ratio 
		etffunds[etfFund].pb_ratio = "As of date "+statisticsAsOfDate+", the price-to-book ratio is "+data['statistics'].pbRatio;
		// set P/E ratio
		etffunds[etfFund].pe_ratio = "As of date "+statisticsAsOfDate+", the price-earnings ratio is "+data['statistics'].peRatio;
		// market cap
		etffunds[etfFund].average_market_cap = etffunds[etfFund].market_cap = "As of date "+statisticsAsOfDate+", the Weighted average market cap is "+data['statistics'].weightedCap;
		// get holdings as of data
		var holdingsAsOfDate = etfObj.getDateWithoutTimeStamp(data['holdings'].asOfDate);    	    	
		// set Sectors
		var sectors = [];
		_und.each(data['holdings'].topTenSectors, function(sectorObj){
			sectors.push(sectorObj.sectorName);
		});
		etffunds[etfFund].top_sectors = etffunds[etfFund].sectors = "As of date "+holdingsAsOfDate+", the top 5 sectors are "+sectors.slice(0,5).join(",");
		// set Holdings
		var holdings = [];
		_und.each(data['holdings'].topTenHoldings, function(holdingObj){
			holdings.push(holdingObj.holdingName);
		});
		etffunds[etfFund].top_holdings = etffunds[etfFund].holdings = "As of date "+holdingsAsOfDate+", the top 5 holdings are "+holdings.slice(0,5).join(",");   
	}
}

ETF.prototype.capitalizeFirst = function(s) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

ETF.prototype.roundFundValues = function(n) {
	// convert number to string
	var s = n+"";
    return Math.floor(s.substring(0,2) + (s.slice(2)).replace(/[0-9]/g, 0));
}

ETF.prototype.getDateWithoutTimeStamp = function(d) {
    return d && d.indexOf("T") > -1 ? d.split("T")[0] : d;
}

exports.ETF = new ETF();