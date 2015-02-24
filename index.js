window.onload = function() {
	var divCanvas = document.getElementById("divCanvas");
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	/*
	for (var prop in ctx)
		console.log(prop+' '+ctx[prop]);
	*/

	var cityNum = 10;

	var graph = [];
	for (var t=0; t<cityNum; t++) {
		graph[t] = {};
		for (var t1=0; t1<cityNum; t1++)
			if (t != t1 && Math.random()<2/cityNum) {
				graph[t][t1] = 10;
			}
		graph[t].moving = false;
		graph[t].x = Math.random()*canvas.width;
		graph[t].y = Math.random()*canvas.height;
	}
	

	/*
	graph[0] = {};
	graph[0][1] = 10;
	graph[0][2] = 10;
	graph[0][3] = 10;
	graph[0].x = 100;
	graph[0].y = 100;

	graph[1] = {};
	graph[1][2] = 10;
	graph[1].x = 200;
	graph[1].y = 100;
	graph[2] = {};
	graph[2][3] = 10;
	graph[2][1] = 10;
	graph[2].x = 200;
	graph[2].y = 200;
	graph[3] = {};
	graph[3].x = 100;
	graph[3].y = 200;
	*/

	var CIRCLE_RADIUS = 15;
	var mx = 0, my = 0;
	
	window.onmousedown = function(e) {
		/*for (var prop in e) {
			console.log(prop+' '+e[prop]);
		}*/
		mx = e.clientX - parseInt(divCanvas.style.left);
		my = e.clientY - parseInt(divCanvas.style.top);
		for (var t=0; t<graph.length; t++) {
			var dx = mx-graph[t].x;
			var dy = my-graph[t].y;
			if (dx*dx+dy*dy <= CIRCLE_RADIUS*CIRCLE_RADIUS) {
				graph[t].moving = true;
			}
		}
	}
	window.onmousemove = function(e) {
		var nmx = e.clientX - parseInt(divCanvas.style.left);
		var nmy = e.clientY - parseInt(divCanvas.style.top);
		for (var t=0; t<graph.length; t++) {
			if (graph[t].moving) {
				graph[t].x += nmx - mx;
				graph[t].y += nmy - my;
			}
		}
		mx = nmx;
		my = nmy;
	}

	window.onmouseup = function(e) {
		for (var t=0; t<graph.length; t++) {
			graph[t].moving = false;
		}
	}

	setInterval(timer, 33);

	function timer() {
		physics();
		paint();
	}

	function physics() {
		var div1 = document.getElementById('div1');
		var div2 = document.getElementById('div2');
		var dt = 0.1;
		var gravity = 100000;
		var zep = 0.03;
		for (var t=0; t < graph.length; t++) {
			for (var t1=t+1; t1<graph.length; t1++) {
				var dx = graph[t1].x - graph[t].x;
				var dy = graph[t1].y - graph[t].y;  
				var l2 = dx*dx + dy*dy;
				var l = Math.sqrt(l2);
				var cosa = dx/l;
				var sina = dy/l;
				var elecForce = gravity/l2*dt;
				if (!graph[t].moving) {
					graph[t].x -= elecForce*cosa;
					graph[t].y -= elecForce*sina;
				}
				if (!graph[t1].moving) {
					graph[t1].x += elecForce*cosa;
					graph[t1].y += elecForce*sina;
				}
				if (graph[t][t1] !== undefined || graph[t1][t] !== undefined) {
					var zepForce = zep*Math.abs(l-CIRCLE_RADIUS);
					if (!graph[t].moving) {
						graph[t].x += zepForce*cosa;
						graph[t].y += zepForce*sina;
					}
					if (!graph[t1].moving) {
						graph[t1].x -= zepForce*cosa;
						graph[t1].y -= zepForce*sina;
					}
				}
			}
		}

	}

	function paint() {
		var ARROW_HEIGHT = 10;
		var ARROW_COEF = 0.1;
		ctx.fillStyle = "#6c6";	
		ctx.strokeStyle = "#939";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		for (var t = 0; t < graph.length; t++) {
			ctx.beginPath();

			ctx.arc(graph[t].x, graph[t].y,CIRCLE_RADIUS, 0, 2*Math.PI, true);

			for (var t1 = t + 1; t1 < graph.length; t1++) {
				var pr1 = graph[t][t1] !== undefined;
				var pr2 = graph[t1][t] !== undefined;
				if (pr1 || pr2) {
					var dx = graph[t1].x - graph[t].x;
					var dy = graph[t1].y - graph[t].y;
					var l = Math.sqrt(dx*dx+dy*dy);
					var cosa = dx/l;
					var sina =  dy/l;
					var x1 = graph[t].x+CIRCLE_RADIUS*cosa;
					var y1 = graph[t].y+CIRCLE_RADIUS*sina;
					var x2 = graph[t1].x-CIRCLE_RADIUS*cosa;
					var y2 = graph[t1].y-CIRCLE_RADIUS*sina;
					ARROW_HEIGHT = ARROW_COEF*l;

					ctx.moveTo(x1, y1);
					ctx.lineTo(x2, y2);
					if (pr1) {
						ctx.lineTo(x2-ARROW_HEIGHT*cosa-ARROW_HEIGHT*sina, y2-ARROW_HEIGHT*sina+ARROW_HEIGHT*cosa);
						ctx.moveTo(x2, y2);
						ctx.lineTo(x2-ARROW_HEIGHT*cosa+ARROW_HEIGHT*sina, y2-ARROW_HEIGHT*sina-ARROW_HEIGHT*cosa);
					}
					if (pr2) {
						ctx.moveTo(x1, y1);
						ctx.lineTo(x1+ARROW_HEIGHT*cosa-ARROW_HEIGHT*sina, y1+ARROW_HEIGHT*sina+ARROW_HEIGHT*cosa);
						ctx.moveTo(x1, y1);
						ctx.lineTo(x1+ARROW_HEIGHT*cosa+ARROW_HEIGHT*sina, y1+ARROW_HEIGHT*sina-ARROW_HEIGHT*cosa);
					
					}
				}
			}

			ctx.stroke();

		}
		
		/*
		ctx.beginPath();
			
			ctx.moveTo(x, ARROW_HEIGHT0);
			ctx.lineTo(x+ARROW_HEIGHT0, 200);
			ctx.arc(x, ARROW_HEIGHT0, 50, 0, Math.PI, true);
			
		ctx.stroke();
		*/
	}

}