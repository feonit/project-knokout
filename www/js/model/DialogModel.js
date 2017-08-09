define([
	'knockout',
	'application',
	'UserModel',
	'MessagesCollection'
], function(
	ko,
	application,
	UserModel,
	MessagesCollection
){

	var DialogModel = function(data) {
		var that = this;

		this.chat_id = ko.observableArray(0);
		this.read = ko.observable(false);
		this.last_message = ko.observable('');
		this.last_update = ko.observable('');

		var mapping = {
			'author': {
				create: function(options) {
					return new UserModel(options.data);
				}
			},
			// не используется вроде как нигде, проверить нужно
			'last_user': function(options) {
				return new UserModel(options.data);
			}
		};

		this._load = function (data) {
			ko.mapping.fromJS(data, mapping, that);
		};
		this._load(data);

		this.openDialog = function () {
			application.mediator.trigger('DIALOG_FRAME', 'open_dialog', this.author.id());
		};
	};

	return DialogModel;
});