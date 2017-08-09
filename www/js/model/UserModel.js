define([
	'application',
	'knockout',
	'ajaxAdapter'
], function(
	application,
	ko,
	ajaxAdapter
){

	"use strict";

	var UserModel = function (data) {
		var self = this;

		this.search_type = ko.observable();
		this.id        = ko.observable();
		this.viewMode = ko.observable('view');
		this.name      = ko.observable('');
		this.family    = ko.observable('');
		this.patronymic = ko.observable('');
		this.confirmed = ko.observable(0);
		this.position  = ko.observable();
		this.address   =  ko.observable();
		this.selected  =  ko.observable(false);
		this.online    =  ko.observable(false);
		this.sendInvite =  ko.observable();
		this.censored_email = ko.observable();
		this.isLoad = ko.observable(false);
		this.loading = ko.observable(false);
		this.loaded = [];
		this.formValid = false;
		this.avatar_full_path = ko.observable('');
		this.avatar = ko.observable();

		this.setParams = function(itemData, callback) {
			ko.mapping.fromJS(itemData, {}, self);
			for (var i in self.loaded) {
				self.loaded[i](self);
			}
			//todo
			self.isLoad(true);
			window.allUserModel.push(self); //todo
			callback && callback();
		};

		this.url = function(){
			return "/user/" + this.id();
		};

		this.fetch = function(options){
			var that = this,
				callback;

			if (options){
				callback = options.callback;
			}

			this.loading(true);

			ajaxAdapter.getRequestRestApi(this.url(), function(data){
				that.setParams(data.result);
				that.loading(false);
				callback && callback();
			});
		};

		this.onLoad = function (callback) {
			if (self.isLoad()) {
				callback(self);
			} else {
				self.loaded.push(callback);
			}
		};

		this.small_avatar_full_path = ko.computed(function(){
            if (!appConfig.auth.guest && this.avatar()) {
                return ajaxAdapter.getStaticUrlBaseUrl('/file/avatar/' + appConfig.auth.user.options.USER_THEME + '/small/') + this.avatar();
            }
			else {
				return ajaxAdapter.getStaticUrlBaseUrl('/file/avatar/default/small/default.png')
			}
	    }, this);

		this.avatar_full_path = ko.computed(function(){
            if (!appConfig.auth.guest && this.avatar()) {
			    return ajaxAdapter.getStaticUrlBaseUrl('/file/avatar/' + appConfig.auth.user.options.USER_THEME + '/default/') + this.avatar();
            }
		}, this);

		this.removalUser = ko.observable(''); // only for currentUser model

		this.fullName = ko.computed(function(){
			return this.name() + ' ' + this.family();
		}, this);

		this.resetViewMode = function () {
			self.viewMode('view');
		};

		this.changeViewMode = function (mode) {
			self.viewMode(mode);
		};

		this.email = ko.observable('').extend({
			validate: {
				deferredMode: true, // Если TRUE, то отображать ошибки только в случаи вызова чек функции
				rules: [
					{
						type: "required",
						message: "Поле не заполнено"
					}
				]
			}
		});

		this.confirmEmail = ko.observable('').extend({
			validate: {
				deferredMode: true, // Если TRUE, то отображать ошибки только в случаи вызова чек функции
				rules: [
					{
						type: "required",
						message: "Поле не заполнено"
					}
				]
			}
		});

		this.password = ko.observable('').extend({
			validate: {
				deferredMode: true, // Если TRUE, то отображать ошибки только в случаи вызова чек функции
				rules: [
					{
						type: "required",
						message: "Поле не заполнено"
					}
				]
			}
		});

		this.confirmPassword = ko.observable('').extend({
			validate: {
				deferredMode: true, // Если TRUE, то отображать ошибки только в случаи вызова чек функции
				rules: [
					{
						type: "required",
						message: "Поле не заполнено"
					}
				]
			}
		});

		this.updatePasswordRequest = function (target) {
			var model = self;
			if (self.formValid) {
				return true;
			}

			return ajaxAdapter.requestRestApi(location.pathname, 'POST', {
					'User[password]': self.password(),
					'User[confirmPassword]': self.confirmPassword()
				},
				function (data, textStatus) { // вешаем свой обработчик на функцию success
					if (data.status == 'error') {
						for (var varName in data.fields) {
							model[varName].validationMessage(data.fields[varName][0]);
						}
						model.formValid = false;
					} else {
						$(target).trigger('submit');
						model.formValid = true;
					}
				}
			);
		};

		this.confirmEmailRequest = function(target) {
			var model = self;

			return ajaxAdapter.requestRestApi(location.pathname, 'POST', {
				'User[password]': self.password()
			}, function (data, textStatus) { // вешаем свой обработчик на функцию success
				if (data.status == 'error') {
					model.password.validationMessage('Неверный пароль');
				} else {
					$(target).trigger('submit');
				}
			});
		};

		this.changePassword = function() {
			var model = self;
			if (self.validate(['password', 'confirmPassword'])) {

				ajaxAdapter.request('/module/user/profile/changePassword', 'POST', {
					'password': self.password(),
					'confirmPassword': self.confirmPassword()
				}, function (data, textStatus) { // вешаем свой обработчик на функцию success
					if (data.status == 'error') {
						for (var varName in data.fields) {
							model[varName].validationMessage(data.fields[varName]);
						}
					} else {
						model.resetViewMode();
					}
				});
			}
		};

		this.validate = function(fields) {
			var hasError=false;
			for (var i in fields) {
				if (!self[fields[i]].check()) {
					hasError = true;
				}
			}
			return !hasError;
		};

		this.changeEmail = function() {
			var model = self;

			if (self.validate(['email', 'confirmEmail'])) {
				ajaxAdapter.request('/module/user/profile/changeEmail', 'POST', {
					'email': self.email(),
					'confirmEmail': self.confirmEmail()
				}, function (data, textStatus) { // вешаем свой обработчик на функцию success
					if (data.status == 'error') {
						for (var varName in data.fields) {
							model[varName].validationMessage(data.fields[varName]);
						}
					} else {
						model.resetViewMode();
					}
				});
			}
		};

		this.getCssClass = function (confirmed){
			switch (confirmed) {
				case "0":
					return 'web_success';
					break;
				case "1":
					return 'web_wait';
					break;
				case "2":
					return 'web_canceled';
					break;
			}
			return '';
		};

		this.getTextStatus = function (confirmed){
			switch (confirmed) {
				case "0":
					return 'ОЖИДАЕТСЯ';
					break;
				case "1":
					return 'УЧАСТВУЕТ';
					break;
				case "2":
					return 'ОТКАЗАЛСЯ';
					break;
			}
		};

		this.subscribe = function() {
           self.sendInvite(true);
			return ajaxAdapter.requestRestApi('/user/'+self.id()+'/subscribers', 'POST', {}, function (data) {
           });
        };

		this.unsubscribeConfirm = function () {
			application.root().currentUser().removalUser(this);
			application.api.popupModule.createPopup({
				templateName : 'popup-delete-collegue'
			});
		};

		this.unsubscribe = function() {
			this.sendInvite(false);
			this.confirmed(false);
			return ajaxAdapter.requestRestApi('/user/' + this.id()+'/subscribers/'+ this.id(), 'DELETE', {}, function (data) {
				application.root().currentUser().removalUser('');
			});
		};

		this.openDialog = function () {
			application.root().search().closeForce();//todo
			application.mediator.trigger('DIALOG_FRAME', 'open_dialog', self.id());
		};

		if (typeof(data) != 'undefined') {
			self.setParams(data);
		}

		this.viewMode.subscribe(function(value) {
			self.password.reset();
			self.confirmPassword.reset();
			self.email.reset();
			self.confirmEmail.reset();
			return true;
		});
	};

	return UserModel;
});