define([
	'application',
	'knockout'
], function(
	application,
	ko
){

	"use strict";

	var API = {

		tabComponents: {}, // hash

		findBySelector: function (selector) {
			return this.tabComponents[selector];
		},

		renderWithHashComponents : function(){
			var selector, tabsComponent;

			for ( selector  in this.tabComponents ){
				tabsComponent = this.tabComponents[selector];

				if (tabsComponent.hashEnabled() === true){
					tabsComponent.reRenderTabs();
				}
			}
		},

		removeAllTabComponents : function(){
			this.tabComponents = {};
		}
	};

	application.api.tabs = API;

	function getSelector(elem) {
		if (elem.id) {
			return "#" + elem.id;
		}
		if (elem.tagName == "BODY") {
			return '';
		}
		var path = getSelector(elem.parentNode);

		if (elem.className) {
			return path + " " + elem.tagName + "." + elem.className;
		}
		return path + " " + elem.tagName;
	}

	ko.bindingHandlers.renderTabs = {
		init: function(element, valueAccessor, allBindings, data, bindingContext){

			ko.bindingHandlers.template.init(element, function(){
				var unwrapValue = ko.utils.unwrapObservable(valueAccessor()),
					selector = getSelector(element),
					hashEnabled = Boolean(unwrapValue.hashEnabled),
					tabsComponent = application.api.tabs.findBySelector(selector);

				if (!tabsComponent){
					tabsComponent = new TabsComponent(selector, hashEnabled);

					var tabs = [], attr, tab;

					for (var i in unwrapValue.tabs) {
						attr = unwrapValue.tabs[i];

						if (attr.disable !== true) {
							tab = ko.mapping.fromJS(attr, {}, new TabModel(tabs.length, tabsComponent));
							tabs.push(tab);
						}
					}

					tabsComponent.tabs(tabs);

					ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
						//API.tabComponents.destroy(tabsComponent);
						//API.tabComponents.remove(tabsComponent);
						if (selector === "#event_view_tabs"){ // TODO
							delete API.tabComponents[selector];
						}

					});

					API.tabComponents[selector] = tabsComponent;

				} else {
					tabsComponent.currentTabIndex(-1); //reset
				}

				return {
					name: valueAccessor().template,
					data: tabsComponent
				};
			}, allBindings, data, bindingContext);

			// Also tell KO *not* to bind the descendants itself, otherwise they will be bound twice
			return { controlsDescendantBindings: true };
		},
		update: function(element, valueAccessor, allBindings, data, bindingContext) {

			ko.bindingHandlers.template.update(element, function () {
				var unwrapValue = ko.utils.unwrapObservable(valueAccessor()),
					selector = getSelector(element);

				var tabsComponent = application.api.tabs.findBySelector(selector);

				return {
					name: valueAccessor().template,
					data: tabsComponent,

					afterRender: function(){
						tabsComponent.$el = $(element);
						tabsComponent.selectTab.call(tabsComponent);
					}
				};
			}, allBindings, data, bindingContext);
		}
	};

	function TabModel(index, parent) {
		this.parent = parent;
		this.index = ko.observable(index);
		this.visible = ko.observable(true);
		this.tabTitle = ko.observable();
		this.isValid = ko.observable();
		this.event = ko.observable();
		this.counterEval = '';
		this.onTabShow = null;
		this.counter = ko.pureComputed({
			read: function(){
				if (typeof this.counterEval === "string" && this.counterEval !== '')
					return eval(this.counterEval);
				else {
					return undefined;
				}
			},
			write: function(value){
				console.log(value)
			},
			owner: this
		});
		this.hashName = ko.computed(function(){
			return 'tab' + (this.index() + 1);
		}, this);
	}

	TabModel.prototype = {
		constructor: TabModel,
		getAttr: function(){
			return this.parent.hashEnabled() ? { href: this._getHref() } : {};
		},
		_getHref: function(){
			return '#' + this.hashName();
		}
	};

	/**
	 * Модель одного компонента (один набор вкладок)
	 */

	var TabsComponent;
	TabsComponent = function(domElem, hashEnabled) {
		var that = this;

		this.componentDomElement = domElem;
		this.$el = null;
		this.tabs = ko.observableArray();
		this.currentTabIndex = ko.observable(-1);
		this.hashEnabled = ko.observable(hashEnabled);
		this.initialized = ko.observable(false);

		/**
		 * Used in view, FOR NESTED TABS
		 * @this TabModel
		 * @public api
		 * */
		this.clickTab = function (data, event) {
			if ( that.hashEnabled() === true )
				return true;
			if ( that.currentTabIndex() === this.index() )
				return true;

			var $target = $((event.currentTarget) ? event.currentTarget : event.srcElement);
			var nextTabIndex = $target.index();

			that.openTab(nextTabIndex);
		};
	};

	TabsComponent.prototype = {

		defaultTabIndex : 0,

		selectTab : function(){
			var firstLoad = this.currentTabIndex() === -1;

			if ( this.hashEnabled() ) {
				var indexOpeningTab,
					indexFromHash = this._getIndexFromHash();

				indexOpeningTab = $.isNumeric(indexFromHash) ? indexFromHash : this.defaultTabIndex;

				this.openTab(indexOpeningTab, firstLoad);

			} else {
				this.openTab(this.defaultTabIndex, firstLoad);
			}
		},

		openTab : function (nextTabIndex, firstLoad) {

			if ( !$.isNumeric(nextTabIndex) || nextTabIndex < 0 ){
				throw "incorrect id of tab";
			}

			var domElem = this.$el,
				bodyTab = domElem.next(".menu_switcher"),
				$nextTarget = domElem.children().eq(nextTabIndex),
				currentTabIndex = bodyTab.children(".menu_step_blck:visible").index(),
				isEqualIndex = (currentTabIndex === nextTabIndex),
				speed = firstLoad ? 0 : "fast";

			this._renderSlideBorder($nextTarget, speed);

			this._triggerCurrentTabHide();

			this.currentTabIndex(nextTabIndex);

			if ( !isEqualIndex ) {
				this._animateBodyTab(bodyTab, nextTabIndex, currentTabIndex, 300 || speed);
			}

			this._triggerCurrentTabShow();
		},

		reRenderTabs : function(){
			var indexOpeningTab;

			if (this.hashEnabled()){
				var indexFromHash = this._getIndexFromHash();

				indexOpeningTab = indexFromHash !== 'undefined' ? indexFromHash : this.currentTabIndex();
			} else {
				indexOpeningTab = this.currentTabIndex();
			}

			this.openTab(indexOpeningTab);
		},

		_triggerCurrentTabShow : function(){
			if ( !this.initialized() ){
				this.initialized(true);
			}
			var bodyTab = this.$el.next(".menu_switcher").children().eq(this.currentTabIndex());
			bodyTab.trigger('tabShow');

			var tabModel = this.tabs()[this.currentTabIndex()];
			if (typeof tabModel.onTabShow === 'function'){
				tabModel.onTabShow();
			}
		},

		_triggerCurrentTabHide : function(){
			var bodyTab = this.$el.next(".menu_switcher").children().eq(this.currentTabIndex());
			bodyTab.trigger('tabHide');
		},

		_renderSlideBorder : function (currentTarget, speed){
			var position = currentTarget.position();
			var cssMarginLeft = parseInt(currentTarget.css("margin-left"));
			var	targetWidth = currentTarget.width();

			// если установить длинну шапки вкладки не удалось, значит она
			// не может быть вычисленна, так как не отображена в браузере и имеет display: none
			// этот способ позволит получить искомое значение
			if (targetWidth === 0){
				var cloned = currentTarget.clone();
				cloned.css({position: 'absolute', left: -10000, top: -10000});
				cloned.appendTo(document.body);
				targetWidth = cloned.width();
				cloned.remove();
			}
			var	rule = {
				left: position.left + cssMarginLeft,
				width: targetWidth
			};

			currentTarget.siblings(".slide_border").animate(rule, speed);
		},

		_getIndexFromHash : function(){
			var hashName = "tab",
				hash = location.href.split("#")[1],
				tabIndex,
				DEFAULT_INDEX = 0;

			if (hash){
				tabIndex = parseInt(hash.replace(hashName, ''), 10) - 1;
			} else {
				tabIndex = DEFAULT_INDEX;
			}

			return tabIndex;
		},

		_animateBodyTab : function (bodyTab, index_cnt, index, speed){
			var tab = this.tabs()[index_cnt],
				childrens = bodyTab.children(),
				children = childrens.eq(index_cnt),
				cssLeft = index_cnt < index ? "-200px" : "200px";

			childrens.hide();
			children.css("left", cssLeft ).animate({opacity: "show", left: "0"}, speed, function() {
				if (bodyTab.find(".slide_border:visible").width() == 0) {
					var hidden_w = bodyTab
						.children(".menu_step_blck:visible")
						.children(".main_menu")
						.children("div:first")
						.width();
					bodyTab.find(".slide_border:visible").css("width", hidden_w);
				}
			});
		}
	};

	//debug space
	window.tabs = application.root().tabs;
});