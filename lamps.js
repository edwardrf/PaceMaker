var async = require('async');
var util  = require('util');
var exec  = require('child_process').exec;

var device = "/dev/ttyUSB0";

exports.reset = function(cb){
	async.series([
		function(callback){
			var cmd = "stty -F " + device + " cs8 57600 ignbrk -brkint -icrnl -imaxbel -opost -onlcr -isig -icanon -iexten -echo -echoe -echok -echoctl -echoke noflsh -ixon -crtscts";
			exec(cmd, callback);
		},
		function(callback){
			exec("stty -F " + device + " hupcl", callback); // Bring up DTR to reset
		},
		function(callback){
			setTimeout(function(){
				exec("stty -F " + device + " -hupcl", callback); // Bring back DTR in 100 ms to complete the reset
			}, 100);
		}
	], function(err, results){
		cb(err);
	});
};

exports.sendCmd = function(cmd, callback){
	var cmds = cmd.match(/.{1,8}/g);
	console.log("Displaying\n" + cmds.join("\n"));
	exec("echo -ne 'f" + cmd + "' > " + device, function(){
		exec("echo -ne 'f" + cmd + "' > " + device, callback);
	});
}