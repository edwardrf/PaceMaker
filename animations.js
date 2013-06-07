var fs = require('fs'),
    PNG = require('pngjs').PNG,
    util = require('util'),
    async = require('async');

var animations = null;

function loadAnimations(callback){
	fs.readdir('img', function(err, files){
		files.sort();
		async.map(files, output, function(err, results){
			var animations = [];
			for(var i = 0; i < results.length; i++){
				var a = results[i];
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
							if(results[j].name == a.name && a.frame == f){
								results[j].data.push(100);
								item.frames.push(results[j].data);
								continue;
							}
						}
					}
					animations[a.name] = item;
				}
			}
			callback(null, animations);
		});
	});
}

function output(file, callback) {
	var animation = {};
	// Determine the animation name and frame number
	var chop = file.split('.')[0];
	var animationName = "";
	var frameNumber = 1;
	if(chop.indexOf('_') >= 0){
		var tmp = chop.split('_');
		animationName = tmp[0];
		frameNumber = tmp[1];
	}else if(chop.length == 1 && parseInt(chop) >= 0 && parseInt(chop) <= 9){
		animationName = 'digit' + chop;
	}else {
		animationName = chop;
	}
	animation.name = animationName;
	animation.frame = frameNumber;

	var png = new PNG({filterType: -1});
	var src = fs.createReadStream('img/' + file);
	png.on('parsed', function(){
		var arr = [];
		var buf = '';
		for(var i = 0; i < 8; i++){
			for(var j = 0; j < 8; j++){
				var p = i * 8 * 4 + j * 4;
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