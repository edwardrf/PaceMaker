var http = require('http');
var URL = require('url');
var queue = [];
var timerHandle = null;
var endCallback = null;

exports.add = function(ms, url){
	var job = {time: ms, url: url};
	// console.log("added job", job);
	queue.push(job);
	checkTimerTask();
	endCallback = null;
};

exports.clear = function(){
	clearTimeout(timerHandle);
	timerHandle = null;
	queue.length = 0; // Clear the queue
};

exports.setEndCallback = function(callback){
	endCallback = callback;
};

function checkTimerTask(){
	// console.log("time handle is ", timerHandle);
	if(timerHandle === null){
		timerHandle = setTimeout(doJob, 0);
	}
}

function doJob(){
	console.log("queue length", queue.length);
	if(queue.length > 0){
		var job = queue.shift();
		var url = URL.parse(job.url);
		//console.log("doing job", url);
		http.get(url, function(res){
			// console.log('respnose is', res);
		}).on('error', function(e) {
			// console.log("Got error: " + e);
		});

		http.get(url, function(res){
			// console.log('respnose is', res);
		}).on('error', function(e) {
			// console.log("Got error: " + e);
		});

		console.log("setting job at ", job.time);
		timerHandle = setTimeout(doJob, job.time);
	}else {
		timerHandle = null;
		if(endCallback){
			endCallback();
		}
	}
}