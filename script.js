class CollapserMaster{
	constructor(btn, content){
		const tt = this;

		tt.qA = function(selector, origin = document){ return origin.querySelectorAll(selector) };
		tt.q = function(selector, origin = document){ return origin.querySelector(selector) };
		tt.btn = tt.qA(btn);
		tt.content = content;
		tt.findContent = function(el){
			const wrapper = function(){return el.classList.contains('coll-wrapper')},
			btn = function(){
				const classL = el.classList
				for (let i = 0; i < classL.length; i++) {
					if (classL.item(i).includes('coll-btn')
						|| classL.item(i).includes('acc-btn')) { return el; }
				}
			};

			if (wrapper()) {
				return tt.q(content, el)
			}
			else if (btn()){
				return tt.q(content, el.parentElement)
			}
		};
		tt.findWrapper = function(children){
			let wrappers = []
			for (var i = 0; i < children.length; i++) {
				wrappers.push(children[i].parentElement)
			}
			return wrappers;
		};
		tt.addListener = function(el, eventType, f){
			for (var i = 0; i < el.length; i++) {
				el[i].addEventListener(eventType, f)
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
	}
}

class Collapser extends CollapserMaster{
	constructor(btn, content){
		super(btn, content);

		const tt = this;

		tt.display = function(t){
			const content = tt.findContent(t),
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
			hiding(t, onDisplayedOnly, content){
				const height = tt.getElProperty.height(content, false);
				if (!onDisplayedOnly && !tt.q('.displayed', t)) {
					clearTimeout(tt.collapsing.timeoutRemoveHeight);
				}
				content.style.height = height + 'px';
				tt.collapsing.addCollapsing(content, 0, 'remove');
			},
			currentContent(t, onDisplayedOnly = false){
				const content = tt.findContent(t);
				this.hiding(t, onDisplayedOnly, content);
			},
			nastedContent(t, onDisplayedOnly = false){
				const content = tt.q('.coll-nasted .displayed', t.parentElement);
				if(content){ this.hiding(t, onDisplayedOnly, content) }
			}
		}
		tt.toggle = function(t){
			const content = tt.findContent(t);
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
	constructor(btn, content){
		super(btn, content);

		const tt = this;

		tt.addListener(tt.btn, 'mouseenter', function(){
			tt.display(this);
		});
		tt.addListener(tt.findWrapper(tt.btn), 'mouseleave', function(){
			tt.hide.currentContent(this);
		});
		tt.addListener(tt.btn, 'touchend', function(){
			tt.toggle(this);
		});
	}
}

class CollapserClick extends Collapser{
	constructor(btn, content){
		super(btn, content);
		
		const tt = this;

		tt.addListener(tt.btn, 'click', function(){
			tt.toggle(this);
		});
	}
}

class AccordionHover extends Collapser{
	constructor(btn, content){
		super(btn, content)

		const tt = this;

		tt.addListener(tt.btn, 'mouseenter', function(){
			const content = tt.findContent(this);
			if(!content.classList.contains('displayed') && !content.classList.contains('collapsing')) {
				const content = tt.q('.displayed', this.parentElement.parentElement),
				collapsingContent = Array.from(tt.qA('.collapsing', this.parentElement.parentElement))
				
				if (!collapsingContent.length) {
					tt.display(this)
				}

				tt.hide.hiding(this, true, content)
			}
		});
		
	}
}

// class AccordionClick extends Collapser{
// 	constructor(btn, content){
// 		super(btn, content)

// 		const tt = this;
		
// 		// tt.addListener(tt.btn, 'click', function(){
// 		// 	tt.toggle(this);
// 		// });
// 	}
// }

const collapserHover = new CollapserHover('.coll-btn-hover', '.coll-content');
const collapserClick = new CollapserClick('.coll-btn-click', '.coll-content');
const accordionHover = new AccordionHover('.acc-btn-hover', '.coll-content');
// const accordionClick = new AccordionClick('.coll-btn-click', '.coll-content');