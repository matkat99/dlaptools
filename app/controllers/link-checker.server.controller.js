'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	_ = require('lodash'),
 http = require('q-io/http');

var validated = {};
	

var checkUrl = function (row, callback) {
	
		http.request(row).then(function(res){
			console.log('Got response: ' + res.status);
			
			if(res.status === 200 || res.status === 302) {

	  				validated.valid.push({url : row, status: res.status});
	  		}
	  		else 
	  				validated.invalid.push({url : row, status: res.status});
	  		callback(null, res.status);
		});
		
};

/**
 * Check a list of urls
 */
exports.check = function(req, res) {
	var list = req.body;
	validated.valid = [];
	validated.invalid = [];
	
	_.forEach(list, function(row){

		checkUrl(row, function(error, result) {
			if(validated.valid.length + validated.invalid.length < list.length)
					console.log(validated.valid.length + validated.invalid.length);
				else res.json(validated);
			
		});
	});
	
	
};

exports.getResults = function(req,res) {
	res.json(validated);
};




