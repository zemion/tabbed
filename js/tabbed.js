if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
		if (this == null) {	throw new TypeError(); }
		var n, k, t = Object(this), len = t.length >>> 0;

		if (len === 0) return -1;
		n = 0;
		if (arguments.length > 1) {
			n = Number(arguments[1]);
			if (n != n) n = 0;
			else if (n != 0 && n != Infinity && n != -Infinity) n = (n > 0 || -1) * Math.floor(Math.abs(n));
		}
		if (n >= len) return -1;
		for (k = n >= 0 ? n : Math.max(len - Math.abs(n), 0); k < len; k++) if (k in t && t[k] === searchElement) return k;
		return -1;
	};
}

Tab = function() {
	var self = this;
	//which container do I belong to???
	var container = null;
	//which content do I hold? (might be a JSON object)
	var content = '';
	//whats my title
	var title = '';
	//initialize element
	var element = null;
	// i'm active?
	var active = false;

	var closeThis = function() { container.destroyTab(self); }

	var i = 0, l = arguments.length;
	for(; i < l; i++) {
		if(arguments[i] instanceof Container) container = arguments[i];
		else if(typeof arguments[i] === 'boolean') active = arguments[i];
		else if(typeof arguments[i] === 'string') {
			if(title == '') title = arguments[i];
			else content = arguments[i];
		} else content = arguments[i];
	}

	__construct = function() {
		var f = document.createElement('span');
		f.className = 'close';
		f.innerHTML = '&times;';
		f.onclick = closeThis;
		f.onmousedown = function(e) { return false; }
		f.onselectstart = function(e) {
			e = e || window.event;
			if(e.preventDefault) e.preventDefault();
			else e.returnValue = false;
			return false;
		}
		var g = document.createElement('div');
		g.className = 'tmp';
		g.innerHTML = '' + title;
		g.appendChild(f);
		f = document.createElement('div');
		f.appendChild(g);
		f.className = 'tmp2';
		element = document.createElement('div')
		element.appendChild(f);
		element.className = 'wrap';
		element.onmousedown = function(e) {
			return container.getManager().mouseFct(e, self);
		}
		element.onselectstart = function(e) {
			e = e || window.event;
			if(e.preventDefault) e.preventDefault();
			else e.returnValue = false;
			return false;
		}
	}()

	this.setContainer = function(c) {
		if(c instanceof Container) {
			container = c;
		}
	}

	this.getContainer = function() { return container; }

	this.getElement = function() { return element }

	this.removeElement = function() {
		if(element && element.parentNode) element.parentNode.removeChild(element);
	}

	this.getElementWidth = function() {
		if(element) {
			var i = 0;
			if(element.currentStyle) {
				i = element.currentStyle;
				i = parseInt(i['paddingLeft']) + parseInt(i['paddingRight']) + parseInt(i['marginLeft']) + parseInt(i['marginRight'])
			} else {
				i = document.defaultView.getComputedStyle(element);
				i = parseInt(i.paddingLeft) + parseInt(i.paddingRight) + parseInt(i.marginLeft) + parseInt(i.marginRight)
			}
			return i + element.offsetWidth;
		} else return 0;
	}

	this.setTitle = function(t) {
		if(typeof t === 'string') {
			title = t;
			element.children[0].children[0].childNodes[0].textContent = title;
		}
	}

	this.getTitle = function() { return title }

	this.setActive = function(t) {
		active = !!t;
		if(element) element.className = 'wrap' + (active?'_active':'');
	}
}

Container = function() {
	var self = this;
	//container manager
	var manager = null;
	//which tabs has the container?
	var tabs = [];
	//which tab is active
	var active = -1;
	//our container element
	var element = null;
	//where are the tabs???
	var tabpane = null;
	//where is the display pane of the container?
	var display = null;
	//is the container visible
	var visible = false;
	//widths of the containers and coords of tapane, updated on change
	var widths = [];
	var coords = [];

	var recalcWidths = function() {
		widths = [];
		var i = 0, l = tabs.length;
		for(; i < l; i++) {
			tabs[i].setActive(i == active);
			if(i != active) widths.push(tabs[i].getElementWidth());
		}
		if(tabpane) {
			coords = findPos(tabpane.parentNode);
			coords = [coords[0], coords[1], coords[0]+tabpane.parentNode.offsetWidth, coords[1]+tabpane.parentNode.offsetHeight]
		} else coords = [];
	}

	this.moveContainer = function(x, y) {
		element.style.left = x + 'px';
		element.style.top = y + 'px';
		recalcWidths();
	}

	this.getWidths = function() { return widths; }

	this.getTabPaneElement = function() { return tabpane.parentNode }

	this.getTabPaneCoord = function() { return coords }

	this.isWithinTabPane = function(x, y, buffer) {
		var t = 0, l = 0, b = 0, r = 0;
		if(buffer instanceof Array && buffer.length > 0) {
			t = l = b = r = buffer[0];
			if(buffer.length > 1) {
				l = r = buffer[1];
				if(buffer.length > 2) {
					b = buffer[2];
					if(buffer.length > 3) r = buffer[3];
				}
			}
		}
		return !(x < coords[0]-r || x > coords[2]+l || y < coords[1]-t || y > coords[3]+b)
	}

	this.getElement = function() { return (element?element:null) }

	this.getActiveTab = function() { return (active>-1&&active<tabs.length?tabs[active]:null) }

	this.setActiveTab = function(pos) {
		if(pos instanceof Tab) {
			var i = tabs.indexOf(pos);
			if(i > -1) {
				active = i;
				recalcWidths();
			}
		} else {
			if(tabs.length == 0) active = -1;
			else active = (pos<0?0:(pos>tabs.length-1?tabs.length-1:pos));
			recalcWidths();
		}
	}

	this.getTab = function(pos) { return tabs[(pos<0?0:(pos>tabs.length-1?tabs.length-1:pos))] }

	this.getTabs = function() { return tabs }

	this.addTab = function(tab) {
		if(tab instanceof Tab && tabs.indexOf(tab) === -1) {
			tab.setContainer(this);
			tabs.push(tab);
			this.setActiveTab(tabs.length-1);
			tabpane.insertBefore(tab.getElement(), (tabpane.children[0] || null));
		}
		recalcWidths();
	}

	this.addNewTab = function() {
		var t = new Tab(this, false, 'New Tab', 'content');
		this.addTab(t);
		return t;
	}

	this.removeTab = function(tab) {
		var i = tabs.indexOf(tab);
		if(i > -1) {
			tabs[i].removeElement();
			tabs = tabs.slice(0, i).concat(tabs.slice(i+1));
			this.setActiveTab(i == active?active--:active);
			recalcWidths();
			return true;
		} else return false;
	}

	this.destroyTab = function(tab) {
		if(this.removeTab(tab)) {
			tab = null;
			delete tab;
		}
		if(tabs.length > 0) recalcWidths();
		else this.getManager().removeContainer(self);
	}

	this.moveTab = function(tab, to) {
		var i = tabs.indexOf(tab);
		if(i > -1) {
			to = (to<0?0:(to>tab.length-1?tab.length-1:to));
			if(i < to) {
				tabs = tabs.slice(0,i).concat(tabs.slice(i+1, to+1)).concat(tabs[i]).concat(tabs.slice(to+1));
			} else if(i > to) {
				tabs = tabs.slice(0,to).concat(tabs[i]).concat(tabs.slice(to, i)).concat(tabs.slice(i+1));
			}
			this.setActiveTab(i == active?to:active);
			tabpane.insertBefore(tab.getElement(), tab.getElement().parentNode.children[to]);
			recalcWidths();
		}
	}

	this.destroyContents = function() {
		for(var i = 0; i < tabs.length; i++) this.destroyTab(tabs[i]);
		element.parentNode.removeChild(element);
		element = null;
	}

	this.getManager = function() { return manager }

	__construct = function() {
		tabpane = document.createElement('div');
		tabpane.className = 'tabwrap';
		var g = document.createElement('div');
		g.className = 'addtab';
		g.onclick = function(e) { self.addNewTab(); };
		var f = document.createElement('div');
		f.className = 'twc';
		f.setAttribute('unselectable','on');
		f.appendChild(tabpane);
		f.appendChild(g);
		display = document.createElement('div');
		display.className = 'content';
		display.innerHTML = 'Lorem ipsum etc...';
		element = document.createElement('div');
		element.className = 'container';
		element.style.cssText = 'top: 0px; left: 0px;';
		element.appendChild(f);
		element.appendChild(display);
	}()

	var i = 0, l = arguments.length;
	for(; i < l; i++) {
		if(arguments[i] instanceof ContainerManager) manager = arguments[i];
		else if(typeof arguments[i] === 'boolean') visible = arguments[i];
		else if(arguments[i] instanceof Array) {
			for(var j in arguments[i])
				this.addTab(arguments[i][j]);
		}
	}

	if(tabs.length < 1) self.addNewTab();
}

//TODO: 'window' move, window resize (toggle), window arrangement, window iconify
//TODO the different windows need to be stacked (z-index); by order, activate onclick (onmouseover while drag) -> reorder, apply z-index
ContainerManager = function() {
	var self = this;
	//which containers do we have
	var containers = [];
	//which is our element???
	var element = null;

	var i = 0, l = arguments.length;
	for(; i < l; i++) {
		if(arguments[i].nodeType && arguments[i].nodeType === 1) element = arguments[i];
	}

	this.setElement = function(e) { if(e.nodeType && e.nodeType === 1) element = e }
	this.getElement = function() { return element || null }

	this.addContainer = function(c) {
		if(c instanceof Container && containers.indexOf(c) < 0) {
			containers.push(c);
			element.appendChild(c.getElement());
		}
	}

	this.addNewContainer = function() {
		var c = null;
		if(arguments.length > 0) {
			c = new Container(this, true, [arguments[0]]);
		} else c = new Container(this, true);
		this.addContainer(c);
		return c;
	}

	this.removeContainer = function(c) {
		var i = containers.indexOf(c);
		if(i > -1) {
			containers[i].destroyContents();
			containers[i] = null;
			delete containers[i];
			containers = containers.slice(0, i).concat(containers.slice(i+1));
		}
	}

	this.getContainers = function() { return containers }

	this.mouseFct = function(event, tab) {
		var sx = 0, sy = 0;
		var ox = 0, oy = 0;
		var inmove = false;
		var actual = null;
		var cur = null;
		var pos = 0;
		var coo = [];
		var widths = [];

		if (window.getSelection) {
			var selection = window.getSelection();
			selection.removeAllRanges();
		} else {
			var range = document.selection.createRange();
			document.selection.empty();
		}
		window.onselectstart = function(e) {
			e = e || window.event;
			if(e.preventDefault) e.preventDefault();
			else e.returnValue = false;
			return false;
		}

//TODO scrollPane collapses!
		event = event || window.event;
		if(!(event.button == 0 || (window.event && event.button == 1))) return;
		var t = event.target || event.srcElement;
		if(t.nodeType == 3) t = t.parentNode;
		if(t.className != 'close') {
			cur = tab.getContainer();
			if(tab !== cur.getActiveTab()) cur.setActiveTab(tab);
// d.addEventListener("DOMSubtreeModified", function(e) {console.log(e)}, true)
			ox = event.offsetX || event.layerX;
			oy = event.offsetY || event.layerY;
			sx = event.clientX + self.getElement().scrollLeft;
			sy = event.clientY + self.getElement().scrollTop;
			actual = tab.getElement();
			coo = cur.getTabPaneCoord();

			document.onmousemove = function(e) {
				e = e || window.event;

				if(cur) {
					var d = actual.parentNode.children;
					var i = 0, l = d.length;
					for(; i < l; i++) d[i].style.cursor = 'move';
				}
				if(!inmove && (Math.abs(e.clientX - sx) > 5 || Math.abs(e.clientY - sy) > 5)) {
					document.body.style.cursor = 'move';
					actual.id = 'moved';
					actual.style.left = e.clientX-15-coo[0]-ox + 'px';
					widths = tab.getContainer().getWidths();
					var d = document.createElement('div');
					d.id = 'standin';
					d.style.width = (tab.getElementWidth()) + 'px';
					actual.parentNode.insertBefore(d, actual);
					actual.parentNode.insertBefore(actual, null);
					inmove = true;
					maxx = coo[2]-coo[0] - tab.getElementWidth() - 15;
				}
				if(inmove) {
					if(!(cur && cur.isWithinTabPane(e.clientX, e.clientY, [5, 0]))) {
						var d = null;
						var i = 0, l = containers.length;
						for(; i < l; i++) d = containers[i].isWithinTabPane(e.clientX, e.clientY, [5, 0])?containers[i]:d;
						if(d) {
							if(cur) cur.removeTab(tab);
							cur = d;
							cur.addTab(tab);
							widths = cur.getWidths();
							coo = cur.getTabPaneCoord();
							if(d = document.getElementById('dragproxy')) d.parentNode.removeChild(d);
							d = document.getElementById('standin');
							if(!d) {
								d = document.createElement('div');
								d.id = 'standin';
								d.style.width = (actual.offsetWidth+30) + 'px';
							}
							var t = cur.getTabs()[0].getElement();
							t.parentNode.insertBefore(d, t);
							t.parentNode.insertBefore(actual, null);
							maxx = coo[2]-coo[0] - tab.getElementWidth() - 15;
						} else if(cur) {
							cur.removeTab(tab);
							d = document.getElementById('standin');
							if(d) d.parentNode.removeChild(d);
							if(cur.getTabs().length < 1) cur.getManager().removeContainer(cur);
							cur = null;
							widths = coo = [];
							maxx = 0;
						}
					}
					if(cur) {
						var i = widths.length-1, sum = 0;
						for(; i >= 0; i--) if((sum+=widths[i]) > e.clientX-coo[0]-ox) break;
						var x = e.clientX-15-coo[0]-ox;
						x = x<15?15:(x>maxx?maxx:x);
						actual.style.left = x + 'px';
						actual.parentNode.insertBefore(document.getElementById('standin'), null);
						actual.parentNode.insertBefore(document.getElementById('standin'), actual.parentNode.children[i+1]);
					} else {
						var d = document.getElementById('dragproxy');
						if(!d) {
							d = document.createElement('div');
							d.id = 'dragproxy';
							d.style.cssText = 'position: absolute; width:' + 100 + 'px; height:' + 30 + 'px; border: 1px dotted dimgray; z-index:100000; border-radius:3px;';
							tab.getContainer().getManager().getElement().appendChild(d);
						}
						d.style.left = (e.clientX-ox-15) + 'px';
						d.style.top = (e.clientY-oy) + 'px';
					}
				}
			}
			document.onmouseup = function(e) {
				var d = [];
				if(document.querySelectorAll) {
					d = document.querySelectorAll('.wrap, .wrap_active');
				} else {
					var els = document.getElementsByTagName('div');
					var i = 0, l = els.lengt;
					for(; i<l; i++) if(els[i].className == 'wrap' || els[i].className == 'wrap_active') d.push(els[i]);
				}
				var i = 0, l = d.length;
				for(; i < l; i++) d[i].removeAttribute('style');
				document.onmousemove = document.onmouseup = window.onselectstart = null;
				if(inmove) {
					actual.style.cssText = '';
					actual.removeAttribute('style');
					actual.id = '';
					actual.removeAttribute('id');
					document.body.style.cssText = '';
					document.body.removeAttribute('style');
					var k = 0;
					if(cur) {
						e = document.getElementById('standin');
						while (e = e.previousSibling) k++;
					} else {
						e = e || window.event;
						var d = tab.getContainer().getManager().addNewContainer(tab);
						d.moveContainer(e.clientX-ox-30,e.clientY-oy);
					}
					while(document.getElementById('standin')) document.getElementById('standin').parentNode.removeChild(document.getElementById('standin'));
					if(document.getElementById('dragproxy')) document.getElementById('dragproxy').parentNode.removeChild(document.getElementById('dragproxy'));
					tab.getContainer().moveTab(tab, k);
				}
				widths = coo = [];
				inmove = false;
				cur = null;
			}
			return false;
		}
	}
}

function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
	}
	return [curleft,curtop];
}
