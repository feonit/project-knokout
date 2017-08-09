//todo exit for horizontal window resize scrolling
//todo $(window).unbind("resize scroll",(_onResizeWindow));
//todo scroll animate for state isNeedScrolling = false
define([
	'_',
	'ajaxAdapter',
	'View',
	'knockout',
	'application',
	'MessagesCollection',
	'text!components/dialog-frame/dialog-frame.html'
], function(
	_,
	ajaxAdapter,
	View,
	ko,
	application,
	MessagesCollection,
	template
){

	var Component = _.defineSubclass(View, function DialocChatComponent(params){
		//var dataModel = params.value(); // TODO
		View.apply(this, arguments);

		var processScrollingTop = false;

		this.scrollingTop = function(model, event){
			var target = event.target;
			var INTERVAL_LAZY_UPLOADING = 1000;

			if (processScrollingTop) {
				return;
			}

			if (target.scrollTop < 50 ) {
				processScrollingTop = true;
				application.mediator.publish('page_scrolled_top');

				// rule out for doubled event
				setTimeout(function(){
					processScrollingTop = false;
				}, INTERVAL_LAZY_UPLOADING); // not more than 500ms

				return true;
			}
		};

		this.isOpen = ko.observable(false);

		this.close = function () {
			var that = this;
			if (this.isOpen()){
				this._closeChatNodeField(function(){
					that.isOpen(false);
					that._destroy();
				});
			}
			return true; // continue link
		};

		var that = this;

		this.API = {
			commands: {
				open: function(id){
					that.openDialog(id);
				}
			}
		};

		this.afterRender();
	} , {

		openDialog: function(idUser){
			var that = this;
			return ajaxAdapter.requestRestApi('/chat', 'POST', { user_id : idUser }, function (data) {
				application.root().chat(new MessagesCollection({
					id : data.result, //chat_id,
					title : data.name //title
				}));
				application.root().chat().lazyFetch();
				that._openChat();
			});
		},

		getHrefToBack: function(){
			return application.router.getLocationWithoutParms();
		},

		_destroy : function(){
			application.root().chat('');
		},

		_closeChatNodeField : function (callback) {
			$(".inside_center").animate(
				{opacity: "hide"}, 200, function() {
					// 1 Animation complete
					$(".chat_holder").animate(
						{left: "100%"}, 200, function(){
							// 2 Animation complete
							callback && callback();
						});
				});
		},

		_openChat : function (callback) {
			var that = this;
			var chatElement = $(".chat_holder");

			closeAllCurtain();//todo
			popUpScrollFix(chatElement);//todo
			chatElement.animate({left: "0"}, {
				duration: 200,
				complete: function() {
					$(".inside_center").animate({opacity: "show"}, {
						duration: 200,
						complete: function(){
							that.isOpen(true);
						}
					});
				}
			});
		},

		afterRender: function(){
			this.isOpen.subscribe(function(isOpen){ //toggler
				isOpen
					? application.mediator.subscribe('close_opened_components', this.close, this)
					: application.mediator.unsubscribe('close_opened_components', this.close, this)
			}, this);
			this.addCommand('open_dialog', this.API.commands.open, this);
		},

		dispose : function(){
			this.removeCommand('open_dialog', this.API.commands.open);
			application.mediator.unsubscribe('close_opened_components', this.close);
		}
	});

	return { viewModel: Component, template: template };
});