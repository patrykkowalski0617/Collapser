(function() {
	class Collapser{
		constructor(btn){
			const tt = this;
			
			tt.qA = function(selector, origin = document){ return origin.querySelectorAll(selector) };
			tt.q = function(selector, origin = document){ return origin.querySelector(selector) };
			tt.btn = tt.qA(btn);
			tt.findCollContentFromThis = function(el){
				const contentClass = '.coll-content-wrapper',
				wrapper = function(){return el.classList.contains('coll-wrapper')},
				btn = function(){
					const classL = el.classList
					for (let i = 0; i < classL.length; i++) {
						if (classL.item(i).includes('coll-btn')
							|| classL.item(i).includes('acc-btn')
							|| classL.item(i).includes('nav-btn')
							) { return el; }
					}
				};

				if (wrapper()) {
					return tt.q(contentClass, el)
				}
				else if (btn()){
					return tt.q(contentClass, el.parentElement)
				}
			};
			tt.wrappers = function(){
				const children = tt.btn;
				let wrappers = [];
				for (var i = 0; i < children.length; i++) {
					wrappers.push(children[i].parentElement)
				}
				return wrappers;
			};
			tt.addListener = function(el, eventType, f, useCapture){
				for (var i = 0; i < el.length; i++) {
					el[i].addEventListener(eventType, f, useCapture)
				}
			};
			tt.getElProperty = {
				height(el, getAbsoluteH = true){
					if (getAbsoluteH) { el.classList.add('before-collapsing'); }
					const elementHeight = el.offsetHeight;
					if (getAbsoluteH) { el.classList.remove('before-collapsing'); }
					return elementHeight;
				},
				transitionTime(el){
					const st = window.getComputedStyle(el, null);
					return parseFloat(st.getPropertyValue('transition-duration')) * 1000;
				}
			},
			tt.collapsing = {
				timeoutAddHeight: null,
				timeoutRemoveHeight: null,
				removeCollapsing(el, method){
					const time = tt.getElProperty.transitionTime(el);
					this.timeoutRemoveHeight = setTimeout(function(){
						el.classList.remove('collapsing')
						el.classList[method]('displayed')
						el.style.height = ''
					}, time);
				},
				addCollapsing(el, height, method){
					el.classList.add('collapsing')
					this.timeoutAddHeight = setTimeout(function(){
						el.style.height = height + 'px';
					}, 0);
					
					this.removeCollapsing(el, method)
				}
			};
			tt.elConstHeight = [];
			tt.display = function(t){
				const content = tt.findCollContentFromThis(t),
				fromHiddenState = function(){
					tt.elConstHeight = []
					tt.elConstHeight.push(tt.getElProperty.height(content));
					tt.collapsing.addCollapsing(content, tt.elConstHeight[0], 'add');
				},
				fromCollapsingState = function(){
					clearTimeout(tt.collapsing.timeoutRemoveHeight);
					tt.collapsing.addCollapsing(content, tt.elConstHeight[0], 'add');
				};
				if(!content.classList.contains('displayed')){
					if (!content.classList.contains('collapsing')) {
						fromHiddenState()
					}
					else{
						fromCollapsingState()
					}
				}
				else{ // dbl check / prevent lags with removing class displayed
					let t;
					clearTimeout(t)
					t = setTimeout(function(){
						if(!content.classList.contains('displayed')){
							fromHiddenState()
						}
					}, 400)
				}
			};
			tt.hide = {
				specifiedContent(t, onDisplayedOnly, content){
					const height = tt.getElProperty.height(content, false);
					if (!onDisplayedOnly && !tt.q('.displayed', t)) {
						clearTimeout(tt.collapsing.timeoutRemoveHeight);
					}
					content.style.height = height + 'px';
					tt.collapsing.addCollapsing(content, 0, 'remove');
				},
				currentContent(t, onDisplayedOnly = false){
					const content = tt.findCollContentFromThis(t);
					this.specifiedContent(t, onDisplayedOnly, content);
				},
				nastedContent(t, onDisplayedOnly = false){
					const content = tt.q('.coll-nasted .displayed', t.parentElement);
					if(content){ this.specifiedContent(t, onDisplayedOnly, content) }
				}
			}
			tt.toggle = function(t){
				const content = tt.findCollContentFromThis(t);
				
				if(!content.classList.contains('displayed') && !content.classList.contains('collapsing')) {
					tt.display(t)
				}
				else if(!content.classList.contains('collapsing')){
					tt.hide.nastedContent(t, true)

					setTimeout(function(){
						tt.hide.currentContent(t, true)
					}, 0)
				}
			};
		}
	}

	class CollapserHover extends Collapser{
		constructor(btn){
			super(btn);

			const tt = this;		

			tt.addListener(tt.btn, 'mouseenter', function(){
				tt.display(this);
			});
			tt.addListener(tt.wrappers(), 'mouseleave', function(){
				tt.hide.currentContent(this);
			});
		}
	}

	class CollapserClick extends Collapser{
		constructor(btn){
			super(btn);
			
			const tt = this;

			tt.addListener(tt.btn, 'click', function(){
				tt.toggle(this);
			});
		}
	}

	class Accordion extends Collapser{
		constructor(btn){
			super(btn)

			const tt = this;

			tt.displayOne = function(t){
				const content = tt.findCollContentFromThis(t);
				if(!content.classList.contains('displayed') && !content.classList.contains('collapsing')) {
					const content = tt.q('.displayed', t.parentElement.parentElement),
					collapsingContent = Array.from(tt.qA('.collapsing', t.parentElement.parentElement))
					
					if (!collapsingContent.length) {
						tt.display(t)
					}

					tt.hide.specifiedContent(t, true, content)
				}
			}
		}
	}

	class AccordionHover extends Accordion{
		constructor(btn){
			super(btn)

			const tt = this;

			tt.addListener(tt.btn, 'mouseenter', function(){
				tt.displayOne(this)
			});
			
		}
	}

	class AccordionClick extends Accordion{
		constructor(btn){
			super(btn)

			const tt = this;
			
			tt.addListener(tt.btn, 'click', function(){
				tt.displayOne(this)
			});
		}
	}

	class Navigation extends Collapser{
		constructor(btn, breakPoint){
			super(btn);

			const tt = this,
			pageWidth = function(){return window.innerWidth};

			tt.addListener(tt.btn, 'mouseenter', function(){
				if(pageWidth() >= breakPoint){
					tt.display(this);
				}
			});
			tt.addListener(tt.wrappers(), 'mouseleave', function(){
				if(pageWidth() >= breakPoint && this.classList.contains('coll-nasted')){
					tt.hide.currentContent(this);
				}
			});
			tt.addListener(tt.btn, 'click', function(){
				if(pageWidth() < breakPoint){
					tt.toggle(this);
				}
			});
		}
	}

	const collapserHover = new CollapserHover('.coll-btn-hover'),
	collapserClick = new CollapserClick('.coll-btn-click'),
	accordionHover = new AccordionHover('.acc-btn-hover'),
	accordionClick = new AccordionClick('.acc-btn-click'),
	navigation = new Navigation('.nav-btn', 1024);
})()