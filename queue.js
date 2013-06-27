var http 		= require('http');
var URL 		= require('url');
var lamps 		= require('./lamps');
var queue 		= [];
var timerHandle = null;
var endCallback = null;
var exec 		= require('child_process').exec;
var ready 		= true;

lamps.reset(function(err){
	if(!err){
		ready = true;
	}else {
		console.log("FATAL : Failed to reset lamps controller.");
		// throw err;
	}
});

exports.add = function(ms, cmd){
	var job = {time: ms, cmd: cmd};
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
	var job = queue.shift();
	if(job){
		if(ready){
			ready = false; // Only allow one command at a time.
			lamps.sendCmd(job.cmd, function(){ready = true;});
		}else {
			console.log("Job ignored as the interface is not ready.", job);
		}
		console.log("setting job at ", job.time);
		timerHandle = setTimeout(doJob, job.time);
	}else {
		timerHandle = null;
		if(endCallback){
			endCallback();
		}
	}
}