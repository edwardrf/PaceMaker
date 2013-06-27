/*
 * GET home page.
 */

var animations = require('../animations');
var q = require('../queue');

animations.load();

exports.index = function(req, res){
	var animation = req.query.animation;
	var queue = req.query.queue;
	var length = req.query.length;
	var invert = req.query.invert;
	var loop = req.query.loop;

	animations.get(function(ans){
		console.log(ans[animation]);
		var cmd = '';
		if(animation in ans){ // If the animation exists
			addAnimation(ans, animation, queue, length, invert, loop);
			// Render result
			res.render('index', {
				title: 'Command Accepted',
				animation: ans[animation],
				cmd: cmd
			});
		}else {
			res.render('editor.html');
		}
	});
};


function addAnimation(ans, animation, queue, length, invert, loop){
	if(queue == 'false' || queue == '0') q.clear(); // if not queueing the animation, clear the current one
	loop = parseInt(loop, 10); // In case it is a string

	// Calculate the total time, so we can scale it when length is required
	var totalTime = 0;
	for(var f = 0; f < ans[animation].frames.length; f++){
		totalTime += ans[animation].frames[f][8];
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
		for(f = 0; f < ans[animation].frames.length; f++){
			cmd = '';
			for(var i = 0; i < 8; i++){
				for(var j = 0; j < 8; j++){
					var val = parseInt(ans[animation].frames[f][i].charAt(j), 16);
					// if(invert == 'false' || invert == '0') val = 15 - val; // Invert the colour if asked
					if(val >= 15) val = 14;
					cmd += val.toString(16);
				}
			}
			q.add(ans[animation].frames[f][8] / totalTime * length, cmd);
		}
	}while(--l > 0);

	if(loop == 0){
		q.setEndCallback(function(){
			addAnimation(ans, animation, queue, length, invert, 0);
		});
	}
}