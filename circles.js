var lamp = require('./lamps');

var frame = [
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0]
];

var circles = [];
var done = true;

setInterval(drawFrame, 30);

exports.addCircle = function(circle){
	console.log(circle);
	circles.push(circle);
	done = false;
};

function drawFrame(){
	if(done) return;
	for(var i = 0; i < circles.length; i++){
		var circle = circles[i];
		circle.r += 0.5;
		if (circle.r > 12) {
			circles.splice(i, 1);
			i--;
		}else {
			drawCircle(circle);
		}
	}
	var buf = '';
	var workFlag = false;
	for(var i = 0; i < frame.length; i++){
		for(var j = 0; j < frame[i].length; j++){
			var v = frame[i][j];
			if(v > 14) v = 14;
			if(v > 9) 
				buf += String.fromCharCode(65 + v - 10);
			else 
				buf += v;
			if(v > 0) workFlag = true;
			if(frame[i][j] > 0) frame[i][j] --;
		}
	}
	lamp.sendCmd(buf);
	if(!workFlag){
		done = true;
	}
}

function drawCircle(circle){
	var dx = circle.r;
	var dy = 0;

	while(dx >= 0){
		if(dx > dy){
			dx = Math.sqrt(circle.r * circle.r - dy * dy);
			aaDot(circle.x - dx, Math.round(circle.y + dy));
			aaDot(circle.x + dx, Math.round(circle.y + dy));
			aaDot(circle.x - dx, Math.round(circle.y - dy));
			aaDot(circle.x + dx, Math.round(circle.y - dy));
			dy++;
		}else {
			dx = Math.floor(dx);
			dy = Math.sqrt(circle.r * circle.r - dx * dx);
			aaDot(Math.round(circle.x + dx), circle.y + dy);
			aaDot(Math.round(circle.x + dx), circle.y - dy);
			aaDot(Math.round(circle.x - dx), circle.y + dy);
			aaDot(Math.round(circle.x - dx), circle.y - dy);
			dx--;
		}
	}
}

/**
 * x is integer
 * y is float
 */
function aaDot(x, y){
	var xi = Math.floor(x);
	var xf = x - xi;
	var yi = Math.floor(y);
	var yf = y - yi;
	var intensity = 14
	if(xf == 0){
		dot(x, yi		, Math.round((1 - yf) * intensity));
		dot(x, yi + 1	, Math.round(yf * intensity));
	}else {
		dot(xi	  , y	, Math.round((1 - xf) * intensity));
		dot(xi + 1, y	, Math.round(xf * intensity));
	}
}

function dot(x, y, i){
	if(y >= 0 && y < frame.length){
		if(x >= 0 && x < frame[y].length){
			frame[y][x] += i;
			if(frame[y][x] > 14) frame[y][x] = 14;
		}
	}
}