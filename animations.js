var fs = require('fs'),
    PNG = require('pngjs').PNG,
    util = require('util'),
    async = require('async');
    chokidar = require('chokidar');

var animations = [];

var watcher = chokidar.watch('img');
watcher
	.on('add',		addAnimation)
	.on('change',	addAnimation)
	.on('unlink',	removeAnimation)
	.on('error', function(error) {console.error('FS watcher error', error);});

function addAnimation(file, stats){
	loadOneFrameFromFile(file, function(err, frame){
		if(frame == null) {
			console.log("Failed to load animation from " + file);
			return;
		}
		var animation = null;
		if(frame.name in animations){
			animation = animations[frame.name];
		}else {
			animation = {
				name: frame.name,
				frames: []
			};
			animations[frame.name] = animation;
		}
		// Create place holders for earlier frames
		while(animation.frames.length < frame.frame) animation.frames.push(null);
		frame.data.push(frame.frameTime); // Hack: frame time is the last number in a frame.
		console.log(frame.frame);
		animation.frames[frame.frame - 1] = frame.data;
	});
}

function removeAnimation(file, stats){
	var animation = getFileMetaInfo(file);
	if(animation && animation.name in animations){
		var frames = animations[animation.name].frames;
		frames[animation.frameNumber] = null;
		var allNull = true;
		for(var i = frames.length - 1; i >= 0 ; i--){
			if(frames[i] != null){
				frames.splice(i, 1)
			}else {
				break;
			}
		}
		// Remove the animation if all the frames are removed.
		if(frames.length == 0){
			delete animations[animation.name];
		}
	}
}

function getFileMetaInfo(file){
	var chops = file.split('.');
	if(chops[1] != 'png' && chops[1] != 'PNG') return null; // Only allow png files

	// Defaults
	meta = {
		name: '',
		frame: 1,
		frameTime: 100
	};

	var chop = chops[0].substr(4);
	if(chop.indexOf('_') >= 0){
		var tmp = chop.split('_');
		meta.name = tmp[0];
		meta.frame = tmp[1];
		if(tmp.length > 2) meta.frameTime = parseInt(tmp[2]);
	}else if(chop.length == 1 && parseInt(chop) >= 0 && parseInt(chop) <= 9){
		meta.name = 'digit' + chop;
	}else {
		meta.name = chop;
	}
	return meta;
}

function loadOneFrameFromFile(file, callback) {
	var animation = getFileMetaInfo(file);
	if(animation == null) callback(null, null);
	var png = new PNG({filterType: -1});
	var src = fs.createReadStream(file);
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
		callback(err, null);
	});
	src.pipe(png);
}

exports.get = function(name, callback){
	if(name in animations){
		callback(animations[name]);
	}else {
		callback(null);
	}
};

// exports.load = loadAnimations;