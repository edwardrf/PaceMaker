/*
 * GET home page.
 */

var animations = require('../animations');
var q = require('../queue');

var locking = null;

setInterval(function(){
	if(locking != null){
		var now = new Date();
		if(now.getTime - locking.time.getTime() > 30000){
			locking = null;
		}
	}
}, 5000);

exports.index = function(req, res){

	if(locking != null && req.ip != locking.ip){
		res.send("locked");
		return;
	}

	var cmd = req.query.cmd;
	if(cmd){
		if(locking == null){
			locking = {ip: req.ip};
		}
		locking.time = new Date();
		q.clear();
		q.add(0, cmd);
		res.send("ok");
	}else {
		var animation = req.query.animation;
		var queue = req.query.queue;
		var length = req.query.length;
		var invert = req.query.inverted; // Change invert command to inverted
		var loop = req.query.loop;

		animations.get(animation, function(ans){
			console.log(ans);
			var cmd = '';
			if(ans){ // If the animation exists
				addAnimation(ans, queue, length, invert, loop);
				// Render result
				res.render('index', {
					title: 'Command Accepted',
					animation: ans,
					cmd: cmd
				});
			}else {
				res.render('editor.html');
			}
		});
	}
};


function addAnimation(ans, queue, length, invert, loop){
	if(queue == 'false' || queue == '0') q.clear(); // if not queueing the animation, clear the current one
	loop = parseInt(loop, 10); // In case it is a string

	// Calculate the total time, so we can scale it when length is required
	var totalTime = 0;
	for(var f = 0; f < ans.frames.length; f++){
		totalTime += ans.frames[f][8];
	}
	if(length && !isNaN(length)){
		length = parseInt(length, 10);
		if(length === 0) length = totalTime;
	}else {
		length = totalTime;
	}

	// add loop times of the animation in to the queue, except for 0, add once too.
	var l = loop;
	do{
		// Play every frame of the animation
		for(f = 0; f < ans.frames.length; f++){
			cmd = '';
			for(var i = 0; i < 8; i++){
				for(var j = 0; j < 8; j++){
					var val = parseInt(ans.frames[f][i].charAt(j), 16);
					if(invert == 'false' || invert == '0') val = 15 - val; // Invert the colour if asked
					if(val >= 15) val = 14;
					cmd += val.toString(16);
				}
			}
			q.add(ans.frames[f][8] / totalTime * length, cmd);
		}
	}while(--l > 0);

	if(loop == 0){
		q.setEndCallback(function(){
			addAnimation(ans, queue, length, invert, 0);
		});
	}
}