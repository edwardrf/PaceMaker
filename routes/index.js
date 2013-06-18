/*
 * GET home page.
 */

var animations = require('../animations');
var q = require('../queue');

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
				title: 'Express',
				animation: ans[animation],
				cmd: cmd
			});
		}else {
			res.send(404, 'We don\'t have animation by the name "' + animation + '"');
			console.log( 'We don\'t have animation by the name "' + animation + '"');
		}
	});
};


function addAnimation(ans, animation, queue, length, invert, loop){
	if(queue == 'false' || queue == '0') q.clear(); // if not queueing the animation, clear the current one

	// Calculate the total time, so we can scale it when length is required
	var totalTime = 0;
	for(var f = 0; f < ans[animation].frames.length; f++){
		totalTime += ans[animation].frames[f][8];
	}
	console.log('length is ' + length);
	if(length && !isNaN(length)){
		length = parseInt(length, 10);
		if(length === 0) length = totalTime;
	}else {
		length = totalTime;
	}
	console.log('length is ' + length);


	// Play every frame of the animation
	for(f = 0; f < ans[animation].frames.length; f++){
		cmd = 'http://10.0.10.24/cgi-bin/p.lua?f';

		for(var i = 0; i < 8; i++){
			for(var j = 0; j < 8; j++){
				var val = parseInt(ans[animation].frames[f][i].charAt(j), 16);
				if(invert == 'false' || invert == '0') val = 15 - val; // Invert the colour if asked
				if(val >= 15) val = 14;
				cmd += val.toString(16);
			}
		}
		q.add(ans[animation].frames[f][8] / totalTime * length, cmd);
	}

	if(loop != 1){
		var loopNumber = parseInt(loop, 10);
		if(loopNumber > 0) loopNumber--;
		q.setEndCallback(function(){
			addAnimation(ans, animation, queue, length, invert, loopNumber);
		});
	}
}