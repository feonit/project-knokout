define([
	'application',
	'Collection',
	'knockout',
	'MessageModel',
	'ajaxAdapter',
	'UserModel'
], function(
	application,
	Collection,
	ko,
	MessageModel,
	ajaxAdapter,
	UserModel
){

	"use strict";

	//todo
	function scroll_to_bottom(speed, element, oldScrollHeight) {

		if ( oldScrollHeight ){
			var $element = $(element);

			if ($element.length){
				var scrollHeight = $element[0].scrollHeight;
				var diff = scrollHeight - oldScrollHeight;

				$element.animate({"scrollTop": diff }, speed);
			}
		} else {
			var $element = $(element);

			if ($element.length){
				var height = $element[0].scrollHeight;

				$element.animate({"scrollTop": height }, speed);
			}
		}
	}

	/**
	 * @class MessagesCollection
	 * */
	var MessagesCollection = Collection.extend({
		url: function(){
			return '/chat/' + this.id;
		},

		model: MessageModel,
		view: MessagesCollectionViewModel,

		getAdditionalReversParam: function(){
			return '&reverse=1';
		},

		adapterAnswerData: function(response){
			this.total(response.count);
			this.member(new UserModel());

			if (response.members){
				this.member().setParams(response.members[0])
			}

			return response.data;
		},

		parse: function(item){

		},

		initialize: function(models, data){
			ko.utils.arrayForEach(models, function(model, index){
				model.author(new UserModel(data[index].author));
			});
		},
		/**
		 * @public
		 * //todo method add at Collection.prototype
		 * */
		addMessage : function (messageModel) {
			var that = this;

			require(['UserModel'], function(UserModel){
				var authorParams = messageModel.author(),
					newUserModel = new UserModel(authorParams);

				messageModel.author(newUserModel);
				that.models.push(messageModel);

				that.count(that.count()+1); //todo @deprecated
			});
		}
	});

	/**
	 * @class MessagesCollectionViewModel
	 * @this {MessagesCollectionViewModel}
	 * @params {Object}
	 * */

	function MessagesCollectionViewModel(options){
		this.chat_id = options.id; //@deprecated
		this.count = ko.observable(0); //for new messages
		this.title = ko.observable(options.title);
		this.typeView = options.typeView;
		this.collection = options.collection;

		if (this.typeView === 'side_bar_chat'){
			var HEIGHT_ITEM_OF_LIST = 60; //60px
			// todo
			var heightContainer = $('.right_webinar_chat').height();
			var countOfVisibleElements = Math.ceil(heightContainer/HEIGHT_ITEM_OF_LIST);
			this.collection.portion = countOfVisibleElements;
		}

		this.myMessage = ko.observable("").extend({
			validate: {
				deferredMode: true, // Если TRUE, то отображать ошибки только в случаи вызова чек функции
				rules: [
					{
						type: "required",
						message: "Введите ваше сообщение"
					}
				]
			}
		});

		this.messageWaitingConfirmation = [];

		this.behaivoir1 = ko.computed(function(){
			if (this.collection.loaded()){
				this._adaptScrolling();
				this._addResizableSupport();
				this._addAdaptScrollingUpdateSupport();
			}
		}, this);
	}

	MessagesCollectionViewModel.prototype = {
		constructor: MessagesCollectionViewModel,

		_adaptScrolling : function(){
			var that = this,
				speed = this.speed === 0 ? 200 : 0;

			setTimeout(function(){
				that._setScrollBehavior();
				scroll_to_bottom(speed, '.js_main_chat_container');
			}, 200)
		},

		_addResizableSupport: function(){
			var freezeResize = false,
				that = this;

			application.$window.bind("resize",	_onResizeWindow);

			function _onResizeWindow(){
				if (freezeResize) return '';

				freezeResize = true;
				setTimeout(function(){
					that._setScrollBehavior.call(that);
					freezeResize = false;
					scroll_to_bottom(100, '.js_main_chat_container');
				}, 200);
				return true;
			}
		},

		_addAdaptScrollingUpdateSupport: function(){
			var savedModelsCount = 0,
				oldScrollHeight,
				that = this;

			this.behaivoir2 = ko.computed(function(){
				var countOfModels = that.collection.models().length,
					diff = countOfModels - savedModelsCount;

				if (diff === 1){ //new message
					that._adaptScrolling();
				}

				if (diff > 1){
					var $node = $('.js_main_chat_container');
					if ($node.length){
						oldScrollHeight = $node[0].scrollHeight; // in next step^ after models render view^ scrollHeight was change
					}
				}

				savedModelsCount = countOfModels;
			}, this);

			this.behaivoir3 = ko.computed(function(){
				if (that.collection.uploaded()){
					scroll_to_bottom(0, '.js_main_chat_container', oldScrollHeight);
				}
			}, this);

		},

		_setScrollBehavior: function (){
			var isNeedScrolling,
				countMessages = this.collection.models().length,
				$messagesContainer = $('.botttom_message_show'),
				$chatField = $('.js_main_chat_container');

			if (countMessages === 0){
				isNeedScrolling = false;
			} else {
				var occupiedSpace = $messagesContainer.height(),
					availableSpace = $chatField.outerHeight()
						- $(".js_chat_header").outerHeight()
						- $(".js_chat_footer").outerHeight();

				isNeedScrolling = occupiedSpace > availableSpace;
			}

			$chatField.toggleClass('chat_mode', isNeedScrolling);
		},

		_createModel: function(){
			var that = this,
				currentUser = application.root().currentUser();

			return new MessageModel({
				chat_id:  that.collection.id,
				message: that.myMessage(),
				message_preview: that.myMessage(), //todo message && message_preview ???
				time: undefined,
				isConfirmedByServer: false,
				author: {
					name: currentUser.name(),
					family: currentUser.family(),
					id: currentUser.id(),
					online: true,
					small_avatar_full_path: currentUser.small_avatar_full_path()
				}
			});
		},

		_sendMessage: function(messageText){
			return ajaxAdapter.requestRestApi("/chat/" + this.collection.id, "PUT", {'body': messageText}, function( data ) {
				if (data.status == 'success') {

				} else {

				}
			});
		},

		/**
		 * @public use in view
		 * @this {Object} chatViewModel from template
		 * */
		onSendMessage : function () {
			var that = this;

			if (that.myMessage.check()) {
				var message = that._createModel();
				that.messageWaitingConfirmation.push(message);
				that.addMessage(message);
				that._sendMessage(that.myMessage());
				that.myMessage('');
			}
		}
	};


	return MessagesCollection;
});