var fs = require('fs'),
    PNG = require('pngjs').PNG,
    util = require('util'),
    async = require('async');

var animations = null;

function loadAnimations(callback){
	fs.readdir('img', function(err, files){
		files.sort();
		async.map(files, loadAnimationsFromFile, function(err, results){
			var animations = [];
			for(var i = 0; i < results.length; i++){
				var a = results[i];
				if(a == null) continue;
				if(a.name in animations){
					continue; // This animation has been processed before
				}else {
					var item  = {
						name: a.name,
						frames: []
					};
					// Find all the frames
					for(var f = 1; f <= results.length; f++){
						for(var j = 0; j < results.length; j++){
							if(results[j].name == a.name && results[j].frame == f){
								results[j].data.push(results[j].frameTime);
								item.frames.push(results[j].data);
								continue;
							}
						}
					}
					animations[a.name] = item;
				}
			}
			if(callback) callback(null, animations);
		});
	});
}

function loadAnimationsFromFile(file, callback) {
	var animation = {};
	// Determine the animation name and frame number
	var chops = file.split('.');
	if(chops[1] != 'png' && chops[1] != 'PNG') return null; // Only allow png files

	var chop = chops[0];
	var animationName = "";
	var frameNumber = 1;
	var frameTime = 100; // Default frame time is 100ms
	if(chop.indexOf('_') >= 0){
		var tmp = chop.split('_');
		animationName = tmp[0];
		frameNumber = tmp[1];
		if(tmp.length > 2) frameTime = parseInt(tmp[2]);
	}else if(chop.length == 1 && parseInt(chop) >= 0 && parseInt(chop) <= 9){
		animationName = 'digit' + chop;
	}else {
		animationName = chop;
	}

	animation.name = animationName;
	animation.frame = frameNumber;
	animation.frameTime = frameTime;
	var png = new PNG({filterType: -1});
	png.__filename=file;
	var src = fs.createReadStream('img/' + file);
	png.on('parsed', function(){
		var arr = [];
		var buf = '';
		for(var i = 7; i >= 0; i--){
			for(var j = 7; j >= 0; j--){
				var p = j * 8 * 4 + i * 4;
				var r = png.data[p++];
				var g = png.data[p++];
				var b = png.data[p++];
				var a = png.data[p];
				var val = parseInt(((r + g + b) / 3 * a / 255) / 16);
				buf += val.toString(16);
			}
			arr.push(buf);
			buf = '';
		}
		animation.data = arr;
		callback(null, animation);
	}).on('error', function(err){
		console.log(err, png);
	});
	src.pipe(png);
}

exports.get = function(callback){
	if(animations !== null){
		callback(animations);
	}else {
		loadAnimations(function(err, ans){
			animations = ans;
			callback(animations);
		});
	}
};

exports.load = loadAnimations;