window.onload = function() {
	var CIRCLE_RADIUS = 15;
	var MAX_VELOCITY = 20;
	var MAX_GRAVITY = 190000;
	var MIN_GRAVITY = 10000;
	var MAX_TENSION = 0.0545;
	var MIN_TENSION = 0.0005;

	var tdEmpty = document.getElementById('tdEmpty');
	tdEmpty.style.width = '220px';
	
	var divCanvas = document.getElementById("divCanvas");
	var tableGraph = document.getElementById('tableGraph');
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	//var buttonMatrix = document.getElementById('buttonMatrix');
	
	var divGravity = document.getElementById('divGravity');
	var tdGravity = document.getElementById('tdGravity');
	var divTension = document.getElementById('divTension');
	var tdTension = document.getElementById('tdTension');
	var imgPlus = document.getElementById('imgPlus');
	var imgMinus = document.getElementById('imgMinus');
	var butMatAdjasency = document.getElementById('butMatAdjasency');
	var butMatDistance = document.getElementById('butMatDistance');
	var butMatReach = document.getElementById('butMatReach');
	var butCycleDraw = document.getElementById('butCycleDraw');
	var butCycleDrawNot = document.getElementById('butCycleDrawNot');
	var traces = [];
	var cycles = [];
	var curCycle = -1;

	getBoundingRects();

	var gravity = 100000;
	var zep = 0.03;
	var whichMatrix = 0;	

	var mx = 0, my = 0;
	var changingGravity = false;
	var changingTension = false;
	var changingLength = -1;
		var matType = 0

	butCycleDraw.onclick = function() {
		if (curCycle !==-1) {
			for (var i = 0 ; i<cycles[curCycle].length-1; i++) {
			graph[cycles[curCycle][i]].highlighted = false;
			graph[cycles[curCycle][i]][cycles[curCycle][i+1]].highlighted = false;
		}
		}
		curCycle = Math.floor(Math.random()*cycles.length);
		for (var i = 0 ; i<cycles[curCycle].length-1; i++) {
			graph[cycles[curCycle][i]].highlighted = true;
			graph[cycles[curCycle][i]][cycles[curCycle][i+1]].highlighted = true;
		}

	}

	butCycleDrawNot.onclick = function() {

		for (var i = 0 ; i<cycles[curCycle].length-1; i++) {
			graph[cycles[curCycle][i]].highlighted = false;
			graph[cycles[curCycle][i]][cycles[curCycle][i+1]].highlighted = false;
		}
	}

	butMatAdjasency.onclick = function() {
		matType = 0;
		for (var i = 0; i<graph.cityNum; i++) {
			for (var j = 0; j < graph.cityNum; j++) {
				if (graph[i][j] === undefined) {
					tableGraph.rows[j+1].cells[i+1].innerHTML = 0; 
				} else {
					tableGraph.rows[j+1].cells[i+1].innerHTML = graph[i][j].length;
				}
			}
		}
	}

	butMatDistance.onclick = function() {
		matType = 1;
		var mtx = [];
		traces = [];
		for (var cityN = 0; cityN < graph.cityNum; cityN++) {
			var pr = true;
			var s = Array(graph.cityNum);
			var minDist = Array(graph.cityNum);
			var minDistCities = Array(graph.cityNum);
			for (var i = 0 ; i <graph.cityNum; i++) {
				s[i] = true;
				minDist[i] = -1;
			}
			s[cityN] = false;
			minDist[cityN] = 0;
			minDistCities[cityN] = [];
			for (var i = 0; i < graph.cityNum; i++) {
				if (i !== cityN && graph[cityN][i] !== undefined) {
					minDist[i] = graph[cityN][i].length;
					minDistCities[i] = [cityN];
				}
			}
			for (var i = 0; i < graph.cityNum - 1; i++) {
				var minJ = -1;
				var minV = 0;
				for (j = 0; j < graph.cityNum; j++) {
					if (s[j] && minDist[j] !== -1) {
						minJ = j;
						minV = minDist[j];
					}
				}
				if (minJ === -1) break;
				
				s[minJ] = false;
				for (var j = 0; j < graph.cityNum; j++) {
					if (s[j] && graph[minJ][j] !== undefined && (minDist[j] === -1 || minDist[minJ]+graph[minJ][j].length < minDist[j])) {
						minDist[j] = minDist[minJ] + graph[minJ][j].length;
						minDistCities[j] = [].concat(minDistCities[minJ]);
						minDistCities[j].push(minJ);
						if (graph[j][cityN] !== undefined) {
							cycles.push(minDistCities[j].concat([j, cityN]));
						}
					}
				}
			}

			mtx.push(minDist);
			traces.push(minDistCities);
		}
		for (var i = 0; i<graph.cityNum; i++) {
			for (var j =0; j <graph.cityNum; j++) {
				if (mtx[i][j] !== -1) {
					tableGraph.rows[i+1].cells[j+1].innerHTML = mtx[i][j];
				} else {
					tableGraph.rows[i+1].cells[j+1].innerHTML = 'oo';
				}
			}
		}
		console.log(cycles);
	}

	butMatReach.onclick = function() {
		butMatDistance.onclick();
		for (var i = 0; i < graph.cityNum; i++) {
			for (var j = 0; j < graph.cityNum; j++) {
				if (tableGraph.rows[i+1].cells[j+1].innerHTML === 'oo') {
					tableGraph.rows[i+1].cells[j+1].innerHTML = '0';
				} else {
					tableGraph.rows[i+1].cells[j+1].innerHTML = '1';
				}
			}
		}
		matType = 2;
		
	}

	tdGravity.onmousedown = function(e) {
		changingGravity = true;
	}

	tdTension.onmousedown = function(e) {
		changingTension = true;
	}
	/*
	for (var prop in ctx)
		console.log(prop+' '+ctx[prop]);
	*/

	imgPlus.onmouseenter = function() {
		this.style.border = "1px solid black"
	}
	
	imgPlus.onmouseleave = function() {
		if (changingLength != 0)
			this.style.border = "";
	}

	imgPlus.onclick= function() {
		if (changingLength != 0) {
			changingLength = 0;
			imgMinus.style.border = '';
		}
		else {
			changingLength = -1;
			this.style.border = ''
		}
	}

	imgMinus.onmouseenter = function() {
		this.style.border = "1px solid black";
	}

	imgMinus.onmouseleave = function() {
		if (changingLength != 1)
			this.style.border = "";		
	}

	imgMinus.onclick = function() {
		if (changingLength != 1) {
			changingLength = 1;
			imgPlus.style.border = '';
		}
		else {
			changingLength = 0;
			this.style.border = '';
		}
	}

	var cityNum = 10;

	function tableGraphTdMouseOver() {
		var coords = this.id.split(';');
		var pr1 = coords[0] !== "-1";
		var pr2 = coords[1] !== "-1";
		coords[0] = parseInt(coords[0]);
		coords[1] = parseInt(coords[1]);

		if (pr1) {
			graph[coords[0]].highlighted = true;
			
		}
		if (pr2) {
			graph[coords[1]].highlighted = true;
		}
		if (pr1 && pr2) {
			if (traces.length === 0) {
				if (graph[coords[1]][coords[0]] !== undefined) {
					graph[coords[1]][coords[0]].highlighted = true;
				}
			
				if (graph[coords[0]][coords[1]] !== undefined) {
					graph[coords[0]][coords[1]].highlighted = true;
				}
			} else {
				var put = traces[coords[0]][coords[1]];
				if (put !== undefined) {
					var len = put.length-1;
					for (var i = 0; i < put.length - 1; i++) {
						graph[put[i]].highlighted = true;
						graph[put[i]][put[i+1]].highlighted = true;
					}

					if (len !== -1)
					{
						graph[put[len]][coords[1]].highlighted = true;
						graph[put[len]].highlighted = true;
					}
				}
			}
		}
		this.bgColor = "green";

	}

	function tableGraphTdMouseLeave() {
		var coords = this.id.split(';');
		var pr1 = coords[0] !== "-1";
		var pr2 = coords[1] !== "-1";
		coords[0] = parseInt(coords[0]);
		coords[1] = parseInt(coords[1]);

		if (pr1) {
			graph[coords[0]].highlighted = false;
			
		}
		if (pr2) {
			graph[coords[1]].highlighted = false;
		}
		if (pr1 && pr2) {
			if (traces.length === 0) {
				if (graph[coords[1]][coords[0]] !== undefined) {
					graph[coords[1]][coords[0]].highlighted = false;
				}
			
				if (graph[coords[0]][coords[1]] !== undefined) {
					graph[coords[0]][coords[1]].highlighted = false;
				}
			} else {
				var put = traces[coords[0]][coords[1]];
				if (put !== undefined) {
					var len = put.length-1;
					for (var i = 0; i < put.length - 1; i++) {
						graph[put[i]].highlighted = false;
						
						graph[put[i]][put[i+1]].highlighted = false;
					}

					if (len !== -1) {
						graph[put[len]].highlighted = false;
						graph[put[len]][coords[1]].highlighted = false;
					}
				}
			}
		}
		this.bgColor = "white";
	}

	function tableGraphTdClick() {
		var coords = this.id.split(';');
		var pr1 = coords[0] !== "-1";
		var pr2 = coords[1] !== "-1";
		coords[0] = parseInt(coords[0]);
		coords[1] = parseInt(coords[1]);
		if (pr1 && pr2) {
			if (graph[coords[0]][coords[1]] !== undefined) {
				switch (changingLength) {
					case 0:{
						graph.changeRoadLengthAdd(coords[0],coords[1], 1);

					} break;
					case 1:{
						graph.changeRoadLengthAdd(coords[0],coords[1], -1);						
					}break;
					case -1:{
						graph.removeRoad(coords[0], coords[1]);		
					}
				}
				
			} else {
				graph.addRoad(coords[0], coords[1]);
			}
		}	
	}

	/*
	buttonMatrix.onclick = function() {
		for (var t=0; t<graph.cityNum; t++) {
			tableGraph.rows[1].remove();
		}
		var roadsNum = 0;
		for (var t=0; t<graph.cityNum; t++) {
			for (var t1=0; t1<graph.cityNum; t1++) {
				if (graph[t][t1] !== undefined) {
					var tr = document.createElement('tr');
					var td = document.createElement('td');
					td.innerHTML = roadsNum+1;
					tr.appendChild(td);
					for (var t2 = 0; t2<graph.cityNum; t2++) {
						var td = document.createElement('td');
						if (t2 === t)
							if (t2 === t1)
								td.innerHTML = 2;
							else
								td.innerHTML = -1;
						else
							if (t2 === t1) 
								td.innerHTML = 1;
							else
								td.innerHTML = 0;
						tr.appendChild(td);

					}
					tableGraph.appendChild(tr);
					roadsNum++;
				}
			}
		}
	}
	*/

	function Graph() {	
		this.cityNum = 0;
		
		this.addCity = function(x, y) {
			var td = document.createElement('td');
			td.innerHTML = this.cityNum+1;
			td.id = '-1;'+this.cityNum;
			td.onmouseenter = tableGraphTdMouseOver;
			td.onmouseleave = tableGraphTdMouseLeave;
			td.onclick = tableGraphTdClick;
			tableGraph.rows[0].appendChild(td);

			for (var t=0; t<this.cityNum; t++) {
				var td = document.createElement('td');
				td.innerHTML = "0";
				td.id = t+";"+this.cityNum;
				td.onmouseenter = tableGraphTdMouseOver;
				td.onmouseleave = tableGraphTdMouseLeave;
				td.onclick = tableGraphTdClick;
				tableGraph.rows[t+1].appendChild(td);
			}

			var tr = document.createElement('tr');
			var td = document.createElement('td');
			td.innerHTML = this.cityNum + 1;
			td.id = this.cityNum+';-1';
			td.onmouseenter = tableGraphTdMouseOver;
			td.onmouseleave = tableGraphTdMouseLeave;
			td.onclick = tableGraphTdClick;
			tr.appendChild(td);
			for (var t=0; t<=this.cityNum; t++) {
				var td = document.createElement('td');
				td.innerHTML = "0";
				td.id = this.cityNum + ";" + t;
				td.onmouseenter = tableGraphTdMouseOver;
				td.onmouseleave = tableGraphTdMouseLeave;
				td.onclick = tableGraphTdClick;
				tr.appendChild(td);
			}
			tableGraph.appendChild(tr);
			getBoundingRects();

			this[this.cityNum] = new City(x, y);
			this.cityNum++;
		}

		this.addRoad = function(from, to, length, selected) {
			this[from][to] = new Road(length, selected);
			tableGraph.rows[from+1].cells[to+1].innerHTML = this[from][to].length;
		}

		this.changeRoadLengthAdd = function(from, to, length) {
			this.changeRoadLength(from, to, graph[from][to].length+length);
		}

		this.changeRoadLength = function(from, to, length) {
			if (length <=0) length = 1;
			graph[from][to].length = length;
			tableGraph.rows[from+1].cells[to+1].innerHTML = this[from][to].length;
		}

		this.removeRoad = function(from, to) {
			this[from][to] = undefined;
			tableGraph.rows[from+1].cells[to+1].innerHTML = "0";
		}

		return this;
	}

	function City(x, y) {
		this.moving = false;
		this.selected = false;
		this.selectingTime = 0;
		this.roadTarget = false;
		this.highlighted = false;
		this.angleCos = 1;
		this.angleSin = 0;
		if (x === undefined)
			this.x = Math.random()*canvas.width
		else
			this.x = x;
		if (y === undefined) 
			this.y = Math.random()*canvas.height
		else 
			this.y = y;
		return this;
	}

	function Road(length, selected) {
		this.highlighted = false;
		if (length === undefined) 
			this.length = 1;
		else
			this.length = length;
		if (selected === undefined)
			this.selected = false;
		else
			this.selected = selected;
		return this;
	}

	var graph = new Graph();
	for (var t=0; t<cityNum; t++) {
		graph.addCity();
		
	}

	for (var t=0; t<cityNum; t++) {
		for (var t1=0; t1<cityNum; t1++)
			if (t != t1 && Math.random()<2/cityNum) {
				graph.addRoad(t, t1);
			}
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

	window.onmousedown = function(e) {
		/*for (var prop in e) {
			console.log(prop+' '+e[prop]);
		}*/
		
		mx = e.pageX - canvasBoundRect.left;
		my = e.pageY - canvasBoundRect.top;
		if (mx>0 && my>0 && mx<canvasBoundRect.right-canvasBoundRect.left
						 && my<canvasBoundRect.bottom-canvasBoundRect.top) {
			var pr =false;
			for (var t=0; t<graph.cityNum; t++) {
				for (var t1=0; t1<graph.cityNum; t1++) {
					if (graph[t][t1] !== undefined && graph[t][t1].selected) {
						graph.removeRoad(t, t1);
						pr = true;
					}
				}
			}

			if (pr) return;

			var minl2 = -1;
			var minl2n = -1;
			for (var t=0; t<graph.cityNum; t++) {
				var dx = mx-graph[t].x;
				var dy = my-graph[t].y;
				var l2 = dx*dx+dy*dy;
				if (minl2 == -1 || l2<minl2) {
					minl2 = l2;
					minl2n = t;
				}
				if (dx*dx+dy*dy <= CIRCLE_RADIUS*CIRCLE_RADIUS) {
					graph[t].moving = true;
					graph[t].lmx = mx;
					graph[t].lmy = my;
					graph[t].lDate = new Date();
				}
			}
			if (minl2 > CIRCLE_RADIUS*CIRCLE_RADIUS*4) {
				var n = graph.cityNum;
				graph.addCity(mx, my);
				graph.addRoad(n, minl2n);
			}
		}
	}
	window.onmousemove = function(e) {

		var nmx = e.pageX - canvasBoundRect.left;
		var nmy = e.pageY - canvasBoundRect.top;
		for (var t=0; t<graph.cityNum; t++) {
			if (graph[t].moving) {
				graph[t].x += nmx - mx;
				graph[t].y += nmy - my;
			}
		}

		if (changingGravity) {
			var newTop = Math.min(Math.max(0, e.pageY - scalaGravityTop), 100);
			gravity = MIN_GRAVITY + newTop/100*(MAX_GRAVITY - MIN_GRAVITY);
			divGravity.style.top = newTop +'px';
		}
		
		if (changingTension) {
			var newTop = Math.min(Math.max(0, e.pageY - scalaTensionTop), 100);
			zep = MIN_TENSION + newTop/100*(MAX_TENSION - MIN_TENSION);
			divTension.style.top = newTop +'px';
		}

		mx = nmx;
		my = nmy;
	}

	window.onmouseup = function(e) {
		var selectedCities = [];
		var roadTargetCities = [];
		for (var t=0; t<graph.cityNum; t++) {
			if (graph[t].selected) {
				selectedCities[selectedCities.length] = t;
			}
			if (graph[t].roadTarget) {
				roadTargetCities[roadTargetCities.length] = t;
			}

			
		}

		for (var t=0; t<selectedCities.length; t++) {
			for (var t1=0; t1<roadTargetCities.length; t1++) {
					if (selectedCities[t] === roadTargetCities[t1] && graph[selectedCities[t]][selectedCities[t]] !==undefined) {
						graph[selectedCities[t]][selectedCities[t]] = undefined;
						continue;
					}
					graph.addRoad(selectedCities[t], roadTargetCities[t1]);	
				}
		}

		for (var t=0; t<graph.cityNum; t++) {
			graph[t].moving = false;
			graph[t].selected = false;
			graph[t].selectingTime = 0;
			graph[t].roadTarget = false;
		}
		changingTension = false;
		changingGravity = false;
	}

	setInterval(timer, 33);

	function timer() {
		physics();
		paint();
	}

	function physics() {
		for (var t=0; t<graph.cityNum; t++) {
			if (graph[t][t] !== undefined) {
				var newCos = 0.9962*graph[t].angleCos - 0.0872*graph[t].angleSin;
				var newSin = 0.9962*graph[t].angleSin + 0.0872*graph[t].angleCos;
				graph[t].angleCos = newCos;
				graph[t].angleSin = newSin;
			}
			if (graph[t].moving) {
				if (Math.abs(mx-graph[t].lmx)+Math.abs(my-graph[t].lmy)<20) {
					var dt = new Date() - graph[t].lDate;
					if (dt > 1000) {
						graph[t].selected = true;
						graph[t].selectingTime = 0;
						graph[t].moving = false;
					} else {
						graph[t].selectingTime = dt;
					}
				} else {
					graph[t].lmx = mx;
					graph[t].lmy = my;
					graph[t].lDate = new Date();
				}
			}
		}
		
		var div1 = document.getElementById('div1');
		var div2 = document.getElementById('div2');
		var dt = 0.1;
		for (var t=0; t < graph.cityNum; t++) {
			for (var t1=t+1; t1<graph.cityNum; t1++) {
				var dx = graph[t1].x - graph[t].x;
				var dy = graph[t1].y - graph[t].y;  
				var l2 = dx*dx + dy*dy;
				var l = Math.sqrt(l2);
				var cosa = dx/l;
				var sina = dy/l;
				var elecForce = gravity/l2*dt;
				if (!graph[t].moving) {
					graph[t].x -= Math.min(elecForce, MAX_VELOCITY)*cosa;
					graph[t].y -= Math.min(elecForce, MAX_VELOCITY)*sina;
				}
				if (!graph[t1].moving) {
					graph[t1].x += Math.min(elecForce, MAX_VELOCITY)*cosa;
					graph[t1].y += Math.min(elecForce, MAX_VELOCITY)*sina;
				}
				if (graph[t][t1] !== undefined || graph[t1][t] !== undefined) {
					var averLength = 0;
					if (graph[t][t1] !== undefined) {
						if (graph[t1][t] !== undefined) {
							averLength = (graph[t][t1].length+graph[t1][t].length)/2;
						} else {
							averLength = graph[t][t1].length;
						}
					} else {
						averLength = graph[t1][t].length;
					}
					var zepForce = zep*(l - averLength);
					if (!graph[t].moving) {
						graph[t].x += Math.max(-MAX_VELOCITY, Math.min(zepForce, MAX_VELOCITY))*cosa;
						graph[t].y += Math.max(-MAX_VELOCITY, Math.min(zepForce, MAX_VELOCITY))*sina;
					}
					if (!graph[t1].moving) {
						graph[t1].x -= Math.max(Math.min(zepForce, MAX_VELOCITY))*cosa;
						graph[t1].y -= Math.max(Math.min(zepForce, MAX_VELOCITY))*sina;
					}
				}
			}
		}

	}

	function getBoundingRects() {
		canvasBoundRect = canvas.getBoundingClientRect();
		scalaGravityTop = document.getElementById('scalaGravity').getBoundingClientRect().top;
		scalaTensionTop = document.getElementById('scalaTension').getBoundingClientRect().top;
	}

	function paint() {
		var ARROW_HEIGHT = 10;
		var ARROW_COEF = 0.1;
		ctx.fillStyle = "#6c6";	
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		for (var t = 0; t < graph.cityNum; t++) {
			ctx.beginPath();

			ctx.lineWidth = 2;
			ctx.strokeStyle = graph[t].selected? "#54F" : "#939";
			ctx.arc(graph[t].x, graph[t].y,CIRCLE_RADIUS, 0, 2*Math.PI, true);
			if (graph[t][t] !== undefined) {
				var dx = CIRCLE_RADIUS*graph[t].angleCos;
				var dy = CIRCLE_RADIUS*graph[t].angleSin;
				ctx.moveTo(graph[t].x+dx, graph[t].y+dy);
				ctx.lineTo(graph[t].x-dx, graph[t].y-dy);
			}
			ctx.stroke();

			if (graph[t].highlighted) {

				ctx.beginPath();

				ctx.strokeStyle = '#DBE';
				ctx.arc(graph[t].x, graph[t].y,CIRCLE_RADIUS+3, 0, 2*Math.PI, true);
				ctx.stroke();
			}

			ctx.beginPath();

			if (graph[t].selectingTime>200) {
				ctx.arc(graph[t].x, graph[t].y, CIRCLE_RADIUS*(graph[t].selectingTime - 200)/800, 0, 2*Math.PI, true);
			}


			if (graph[t].selected) {
				var dx = mx - graph[t].x;
				var dy = my - graph[t].y;
				if (dx*dx+dy*dy<CIRCLE_RADIUS*CIRCLE_RADIUS) {
					graph[t].roadTarget = true;
				} else {
					graph[t].roadTarget = false;
				var l2 = dx*dx+dy*dy;
				var l = Math.sqrt(l2);
				var cosa = l? dx/l : 0;
				var sina = l? dy/l : 0;
				var x1 = graph[t].x + CIRCLE_RADIUS*cosa;
				var y1 = graph[t].y + CIRCLE_RADIUS*sina;
				var x2 = mx;
				var y2 = my;
				var minl2 = -1;
				var minl2n = -1;
				for (var t1=0; t1<graph.cityNum; t1++) 
					if (t != t1)
					{
						var dx = graph[t1].x-mx;
						var dy = graph[t1].y-my;
						var l2 = dx*dx+dy*dy;
						if (minl2 == -1 || l2 < minl2) {
							minl2 = l2;
							minl2n = t1;
						}
						graph[t1].roadTarget = false;

					}
				if (minl2n != -1 && minl2<CIRCLE_RADIUS*CIRCLE_RADIUS*4) {
					dx = graph[minl2n].x - graph[t].x;
					dy = graph[minl2n].y - graph[t].y;
					l2 = dx*dx+dy*dy;
					l = Math.sqrt(l2);
					cosa = l? dx/l : 0;
					sina = l? dy/l : 0;
					x1 = graph[t].x + CIRCLE_RADIUS*cosa;
					y1 = graph[t].y + CIRCLE_RADIUS*sina;
					x2 = graph[minl2n].x - CIRCLE_RADIUS*cosa;
					y2 = graph[minl2n].y - CIRCLE_RADIUS*sina;
					graph[minl2n].roadTarget = true;
				}
				


				drawArrow(ctx, x1, y1, x2, y2, cosa, sina, l, true, false);
				}

			}

			ctx.stroke();


			for (var t1 = t + 1; t1 < graph.cityNum; t1++) {
				var pr1 = graph[t][t1] !== undefined;
				var pr2 = graph[t1][t] !== undefined;
				if (pr1 || pr2) {
					var dx = graph[t1].x - graph[t].x;
					var dy = graph[t1].y - graph[t].y;
					var l = Math.sqrt(dx*dx+dy*dy);
					var cosa = l? dx/l : 0;
					var sina = l? dy/l : 0;
					var x1 = graph[t].x+CIRCLE_RADIUS*cosa;
					var y1 = graph[t].y+CIRCLE_RADIUS*sina;
					var x2 = graph[t1].x-CIRCLE_RADIUS*cosa;
					var y2 = graph[t1].y-CIRCLE_RADIUS*sina;
					var ndx = x2-x1;
					var ndy = y2-y1;
					var nl = Math.sqrt(ndx*ndx+ndy*ndy);
					
					var projX = (mx - x1)*cosa + (my - y1)*sina; 
					var projY = (mx - x1)*(-sina) + (my - y1)*cosa;

					if ((pr1 && graph[t][t1].highlighted) ||
						(pr2 && graph[t1][t].highlighted)) {
						ctx.beginPath();
						ctx.lineWidth = 5;
						
						ctx.strokeStyle = '#DBE';
						drawArrow(ctx, x1, y1, x2, y2, cosa, sina, l, pr1, pr2);
						ctx.stroke();

					}

					ctx.beginPath();
					ctx.lineWidth = 2;
						
					if (Math.abs(0.5-projX/nl)<0.25 && Math.abs(projY/nl)<0.2) {
						ctx.strokeStyle = "#c33";
						if (pr1)
							graph[t][t1].selected = true;
						if (pr2)
							graph[t1][t].selected = true;
					} else {
						ctx.strokeStyle = "#939";	
						if (pr1)
							graph[t][t1].selected = false;
						if (pr2)
							graph[t1][t].selected = false;
					}

					

					drawArrow(ctx, x1, y1, x2, y2, cosa, sina, l, pr1, pr2);
					ctx.stroke();

					

				}
			}

			

			

		}

		function drawArrow(ctx, x1, y1, x2 ,y2, cosa, sina, l, pr1, pr2) {
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

		
		/*
		ctx.beginPath();
			
			ctx.moveTo(x, ARROW_HEIGHT0);
			ctx.lineTo(x+ARROW_HEIGHT0, 200);
			ctx.arc(x, ARROW_HEIGHT0, 50, 0, Math.PI, true);
			
		ctx.stroke();
		*/
	}

}