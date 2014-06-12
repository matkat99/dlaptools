'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	_ = require('lodash'),
 http = require('q-io/http');

var validated = {};
	

var checkUrl = function (row, callback) {
	
		http.request(row.url).then(function(res){
			console.log('Got response: ' + res.status);
			
			if(res.status === 200 || res.status === 302 || res.status === 401) {

	  				validated.valid.push({entityid: row.entityid, itemid : row.itemid, title: row.title, url : row.url, status: res.status});
	  		}
	  		else 
	  				validated.invalid.push({entityid: row.entityid, itemid : row.itemid, title: row.title, url : row.url, status: res.status});
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
	validated.internal = [];
	
	_.forEach(list, function(row){
		checkUrl(row, function(error, result) {
				if(validated.valid.length + validated.invalid.length  < list.length)
						console.log(validated.valid.length + validated.invalid.length);
					else res.json(validated);
				
			});
		
	});
	
	
};

exports.getResults = function(req,res) {
	res.json(validated);
};




