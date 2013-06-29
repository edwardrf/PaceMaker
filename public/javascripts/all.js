'use strict';
angular.module('lh', ['lh.filters', 'lh.services', 'lh.directives', 'lh.lampDirective', 'ui']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/edit', {templateUrl: 'partials/edit.html'});
    $routeProvider.when('/play', {templateUrl: 'partials/play.html'});
    $routeProvider.when('/export', {templateUrl: 'partials/export.html'});
    $routeProvider.when('/import', {templateUrl: 'partials/import.html'});
    $routeProvider.otherwise({redirectTo: '/edit'});
  }]);
function DirectCtrl($scope, frame, color){
	$scope.f = frame.newFrame();
	$scope.circles = [];
	$scope.query = '';
	color.setColor(14);
	var cnt = 0;
	setInterval(function(){
		var query = '';
		var post = false;
		if($scope.circles.length > 0){
			for(var i = 0; i < $scope.circles.length; i++){
				var circle = $scope.circles[i];
				drawCircle(circle, $scope.f);
				growCircle(circle, 0.5);
				if(circle.r > 12) {
					//Remove the circle
					$scope.circles.splice(i--, 1);
				}
			}
		}
		if(cnt == 1){
			for(var i = 0; i < $scope.f.length; i++){
				for(var j = 0; j < $scope.f[i].length; j++){
					if($scope.f[i][j] > 0){
						$scope.f[i][j]-=3;
						if($scope.f[i][j] < 0) $scope.f[i][j] = 0;
						post = true;
					}
					// query += $scope.f[i][j].toString(16);
					// UNSAFE swap of i, j to do a cheap transpose
					// assuming the size is square
					query += $scope.f[j][i].toString(16);
				}
			}
			cnt = 0;
		}
		$scope.$apply();
		if(post){
			$scope.query = query;
			$.get('/?cmd=' + query);
		}
		cnt++;
	}, 40);

	function drawCircle(circle, frame){
		var dx = circle.r;
		var dy = 0;

		while(dx >= 0){
			if(dx > dy){
				dx = Math.sqrt(circle.r * circle.r - dy * dy);
				aaDot(circle.x - dx, Math.round(circle.y + dy), frame);
				aaDot(circle.x + dx, Math.round(circle.y + dy), frame);
				aaDot(circle.x - dx, Math.round(circle.y - dy), frame);
				aaDot(circle.x + dx, Math.round(circle.y - dy), frame);
				dy++;
			}else {
				dx = Math.floor(dx);
				dy = Math.sqrt(circle.r * circle.r - dx * dx);
				aaDot(Math.round(circle.x + dx), circle.y + dy, frame);
				aaDot(Math.round(circle.x + dx), circle.y - dy, frame);
				aaDot(Math.round(circle.x - dx), circle.y + dy, frame);
				aaDot(Math.round(circle.x - dx), circle.y - dy, frame);
				dx--;
			}
		}
	}

	function growCircle(circle, size){
		circle.r = circle.r + size;
	}

	/**
	 * x is integer
	 * y is float
	 */
	function aaDot(x, y, frame){
		var xi = Math.floor(x);
		var xf = x - xi;
		var yi = Math.floor(y);
		var yf = y - yi;
		var intensity = 14
		if(xf == 0){
			dot(x, yi		, Math.round((1 - yf) * intensity), frame);
			dot(x, yi + 1	, Math.round(yf * intensity), frame);
		}else {
			dot(xi	  , y	, Math.round((1 - xf) * intensity), frame);
			dot(xi + 1, y	, Math.round(xf * intensity), frame);
		}
	}

	function dot(x, y, i, frame){
		if(y >= 0 && y < frame.length){
			if(x >= 0 && x < frame[y].length){
				frame[y][x] += i;
				if(frame[y][x] > 14){
					frame[y][x] = 14;
				}
			}
		}
	}
}
angular.module('lh.directives', []).
	directive('appVersion', ['version', function(version) {
		return function(scope, elm, attrs) {
			elm.text(version);
		};
	}]).
	directive('mouseWheel', ['$parse', function($parse){
		return function(scope, elm, attrs) {
			var fn = $parse(attrs['mouseWheel']);
			elm.bind("mousewheel", function(event){
				scope.$apply(function(){
					fn(scope, {$event:event});
				});
			});
		};
	}]).
	directive('touchStart', ['$parse', function($parse){
		return function(scope, elm, attrs) {
			var fn = $parse(attrs['touchStart']);
			elm.bind("touchstart", function(event){
				scope.$apply(function(){
					fn(scope, {$event:event});
				});
			});
		};
	}]).
	directive('touchMove', ['$parse', function($parse){
		return function(scope, elm, attrs) {
			var fn = $parse(attrs['touchMove']);
			elm.bind("touchmove", function(event){
				scope.$apply(function(){
					fn(scope, {$event:event});
				});
			});
		};
	}]).
	directive('touchStop', ['$parse', function($parse){
		return function(scope, elm, attrs) {
			var fn = $parse(attrs['touchStop']);
			elm.bind("touchstop", function(event){
				scope.$apply(function(){
					fn(scope, {$event:event});
				});
			});
		};
	}]);
'use strict';
function intToHexColor(input){
	var tmp = ("00000" + input.toString(16));
	tmp = tmp.substr(tmp.length - 6, 6);
	return "#" + tmp;
}

function offsetColor(input, offset){
	var r = (input & 0xFF0000) >> 16;
	var g = (input & 0x00FF00) >> 8;
	var b = (input & 0x0000FF) >> 0;
	r = r * (0xFF - offset) / 0xFF + offset;
	g = g * (0xFF - offset) / 0xFF + offset;
	b = b * (0xFF - offset) / 0xFF + offset;
	var output = (r << 16) + (g << 8) + b;
	return output;
}

function grayToHexColor(gray) {
  var intval = gray * 16 * 256 * 256 + gray * 16 * 256;
  return intToHexColor(offsetColor(intval, 0x66));
}

function grayToShadowColor (gray) {
  var intval = gray * 16 * 256 * 256 + gray * 16 * 256;
  return intToHexColor(offsetColor(intval, 0x66) - 0x222200);
}

angular.module('lh.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }]).filter('color', function() {
    return intToHexColor;
  }).filter('lampColor', function(){
    return function(input){
      return intToHexColor(offsetColor(input, 0x66));
    };
  }).filter('shadowColor', function(){
    return function(input){
      return intToHexColor(offsetColor(input, 0x66) - 0x222222);
    };
  }).filter('grayToHexColor', function(){
    return grayToHexColor;
  }).filter('grayToShadowColor', function(){
    return grayToShadowColor;
  });
angular.module('lh.lampDirective', []).
	directive('lamp', ['$parse', 'color', function($parse, color){
		return {
			restrict	: 'E',
			replace		: true,
			transclude	: true,
			scope		: {
				data		: '=',
				circles		: '=',
				editable	: '='
			},
			// templateUrl	: '/partials/lamp.html',
			link		: function(scope, elm, attrs){

				var size = attrs.size || "large";
				var buf = "<table class='" + size + " lamp'>";
				for(var i = 0; i < scope.data.length; i++){
					buf += "<tr>";
					for(var j = 0; j < scope.data[i].length; j++){
						buf += "<td class='row" + i + " col" + j + "'><div style='background-color: " + grayToHexColor(scope.data[i][j]) + ";'></div></td>";
						//+ ";box-shadow: 0 0 7px 4px " + grayToShadowColor(scope.data[i][j]) // Box shadow is too slow
					}
					buf += "</tr>";
				}
				buf += "</table>";
				var dom = $(buf);
				elm.append(dom);

				// Assume the size of the array will never change
				scope.$watch(function(scp){
					var str = JSON.stringify(scp.data);
					return str;
				}, function(n, o){
					var oldVal = JSON.parse(o);
					var newVal = JSON.parse(n);
					for(var i = 0; i < scope.data.length; i++){
						for(var j = 0; j < oldVal[i].length; j++){
							if(oldVal[i][j] != newVal[i][j]){
								dot(j, i, newVal[i][j]);
							}
						}
					}
				});

				if(attrs.editable !== 'true'){
					return;
				}

				dom.bind('click', brushMouse);
				dom.bind('mousemove', brushMouse);
				dom.bind('touchstart', brushTouch);
				dom.bind('touchmove', brushTouch);

				function brushMouse(event){
					event.preventDefault();
					if(event.which === 1){
						brush(event.pageX, event.pageY);
					}
				}

				function brushTouch(event){
					event.preventDefault();
					var touches = event.originalEvent.changedTouches;
					for (var i=0; i<touches.length; i++) {
						brush(touches[i].pageX, touches[i].pageY);
					}
				}

				function brush(px, py){
					var offset = dom.offset();
					var ex = px - offset.left;
					var ey = py - offset.top;
					var fx = ex / dom.width() * scope.data[0].length;
					var fy = ey / dom.height() * scope.data.length;
					var ix = Math.floor(fx);
					var iy = Math.floor(fy);
					if(ix >=0 && ix < scope.data.length && iy >=0 && iy < scope.data[ix].length){
						scope.$apply(function(){
							scope.circles.push({x: fx - 0.5, y: fy - 0.5, r: 0});
						});
					}
				}

				function dot(x, y, g){
					var brushColor = grayToHexColor(g);
					var shadowColor = grayToShadowColor(g);
					dom.find('.row' + y + '.col' + x  + '>div')
						.css({
							'background-color': brushColor
							// 'box-shadow': '0 0 7px 4px ' + shadowColor // Box-shadow is too slow
						});
				}
			}
		};
	}]);
'use strict';
angular.module('lh.services', []).
value('version', '0.1').
factory('frame', function(){
	var SIZE = 8;

	var frame = {};
	var i = 0;
	frame.newFrame = function(){
		var f = [];
		for(var i = 0; i < SIZE; i++){
			var ff = [];
			for(var j = 0; j < SIZE; j++){
				ff.push(15);
			}
			f.push(ff);
		}
		return f;
	};
	frame.clone = function(frm) {
		var copy = [];
		for(var i = 0; i < SIZE; i++){
			copy.push(frm[i].slice(0));
		}
		return copy;
	};
	frame.step = function(frm){
		// console.log(i);
		for(var j = 0; j < SIZE; j++){
			for(var k = 0; k < SIZE; k++){
				frm[j][k] = i;
			}
		}
		i++;
		if(i > 0xFFFFFF) i = 0;
	};
	return frame;
}).factory('color', function(){
	var color = {currentColor: 0};
	color.setColor = function(c){this.currentColor = c;};
	color.getColor = function(){return this.currentColor;};
	return color;
}).factory('animation', function(frame){
	var keyFrame = {frame: frame.newFrame(), time:30, '$$hashKey': function(){return JSON.stringify(this);}};
	var animation = {keyFrames : [keyFrame], currentFrame : 0};
	animation.setKeyFrames = function(kf){this.keyFrames = kf;};
	animation.getKeyFrames = function(){return this.keyFrames;};
	animation.setCurrentFrame = function(i){
		this.currentFrame = i;
	};
	animation.getCurrentFrame = function(){
		if(this.currentFrame > this.keyFrames.length) this.currentFrame = this.keyFrames.length - 1;
		return this.keyFrames[this.currentFrame];
	};
	return animation;
});
