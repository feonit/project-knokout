define([
    'knockout',
    'application',
    'ajaxAdapter',
    'text!components/notification-bar/notification-bar.html',
    'MessageModel'
], function (
    ko,
    application,
    ajaxAdapter,
    template,
    MessageModel
)
{

    function notificationShow(divId) {
        var noteId = $("#"+divId);
        noteId.hide().slideDown(300);
    }

    //todo notif component
    function notificationHide(divId, callback) {
        var noteId = $("#"+divId);
        noteId.slideUp(300, function() {
            callback();
        });
    }


    function NotificationBarComponent(params) {
        var self = this;
        this.list = ko.observableArray();
        this.fastNotification = ko.observable({});
        this.fastNotificationTimer = 0;
        this.types = [];
        this.loaded = false;
        this.queue = [];

        this._route = params.route;
        /**
         * @public
         * */
        this.groups = ko.observableArray();

        this.hide = function (instanceNotification) {
            if (instanceNotification.groupId != 0 && self.groups().indexOf(instanceNotification.groupId) != -1) {
                if (this.byGroup(instanceNotification.groupId).length <= 1) {
                    self.groups.remove(instanceNotification.groupId);
                }
            }
            self.list.remove(instanceNotification);
        };

        this.notifictionHideTimer = function (state) {
            if (self.fastNotificationTimer != 0) {
                clearTimeout(self.fastNotificationTimer);
            }

            if (state == true) {
                self.fastNotificationTimer = setTimeout(function() {
                    self.hideFastNotification();
                }, 5000);
            }
        };

        this.show = function (id, type, messageParam, buttons, links, data) {
            if (self.loaded == false) {
                self.queue.push({'id':id, 'type':type, 'messageParam':messageParam, 'buttons':buttons, 'links':links});
            } else {
                var notification = $.extend(
                    {
                        'id': id,
                        'createTime': new Date().getTime(),
                        'divId': 'Notification'+Math.floor(Math.random()*1000),
                        'buttons': buttons,
                        'type': type
                    },
                    self.types[type]
                );
                var links = self.types[type].links;

                for (var i in messageParam) {
                    if (links.hasOwnProperty(i)) {
                        var url = links[i];

                        for (var iu in messageParam) {
                            url = url.replace(iu, messageParam[iu])
                        }


                        if (notification.type === "NEW_MESSAGE"){
                            if ( i === "%message%"){
                                var linkToChat = self.getHrefToChat( messageParam['%chat_id%'] );
                                notification.message = notification.message.replace(i, '<a href=\"' + linkToChat + '\">' + messageParam[i] + '</a>')
                            } else if ( i === "%name%" ){
                                notification.message = notification.message.replace(i, '<a href=\"' + url + '\">' + messageParam[i] + '</a>')
                            }
                        }

                        else if (notification.type === "FILE_ADDED"){
                            if ( i === "%file_name%" ){
                                var linkToMyFile = self.getHrefToMyFile( data.params.id );
                                notification.message = notification.message.replace(i, '<a href=\"' + linkToMyFile + '\">' + messageParam[i] + '</a>')
                            }
                        }

                        else {
                            notification.message = notification.message.replace(i, '<a href="'+url+'">'+messageParam[i]+'</a>')
                        }
                    } else {
                        notification.message = notification.message.replace(i, messageParam[i])
                    }
                }
                if (notification.groupId == 0) {
                    var oldFastNotification = self.fastNotification();
                    self.fastNotification(notification);
                    if ($.isEmptyObject(oldFastNotification)) {
                        notificationShow(notification.divId);
                    }
                    self.notifictionHideTimer(true);
                } else if (self.groups().indexOf(notification.groupId) == -1) {
                    self.groups.push(notification.groupId);
                    self.list.push(notification);
                    notificationShow(notification.divId);
                } else {
                    self.list.push(notification);
                }
            }
        };

        this.getHrefToChat = function(id){
            return application.router.generateUrlToChatUser(id);
        };

        this.getHrefToMyFile = function(id){
            return application.router.generateUrlToMyFile(id);
        };

        /**
         * @public
         * */
        this.byGroup = function (groupId) {
            var self = this;
            var filteredArray = [];
            var list = self.list();

            if (list){
                list.forEach(function(item){
                    if (groupId == item.groupId) {
                        filteredArray.push(item);
                    }
                });
            }
            return filteredArray;
        };

        this.clickButton=function (model, buttonNumber) {
            var self = this;
            if (typeof(model.buttons) == 'object' && typeof(model.buttons[buttonNumber]) != 'undefined') {
                var buttonArray = model.buttons[buttonNumber];
                ajaxAdapter.requestRestApi(buttonArray.url, buttonArray.method, buttonArray.params, function () {

                });
            }

            return ajaxAdapter.requestRestApi("/notification/"+model.id, 'DELETE', {}, function( data ) {
                self.list.remove(model);
            });
        };

        this.okButton=function (model) {
            self.clickButton(model, 1);
        };

        this.cancelButton=function (model) {
            self.clickButton(model, 2);
        };

        this.load = function () {
            var that = this;

            return ajaxAdapter.requestRestApi('/notification', 'GET', {}, function(data) {
                if (data.status == 'success') {
                    var result = data.result,
                        longMessage = result.default;

                    that.types = result.notification_types;
                    that.loaded = true;

                    for (var i in longMessage) {
                        self.show(longMessage[i].id, longMessage[i].type, longMessage[i].messageParams, longMessage[i].buttons, longMessage[i].buttons);
                    }

                    for (var i in self.queue) {
                        self.show(self.queue[i].id, self.queue[i].type, self.queue[i].messageParam, self.queue[i].buttons, self.queue[i].links);
                    }
                }
            })
        };

        this.hideFastNotification = function () {
            notificationHide(self.fastNotification().divId, function () {
                self.fastNotification({});
            });
        };

        this.arrowClick = function(model, event){
            $(this).toggleClass("minimize_response");
            $(this).parents(".grouped_items").next().slideToggle("fast");
        };

        var checkInterval = 5000;

        this._timer = setInterval(function () {
            if (self.list().length > 0) {
                if (!self.enableHiddenTimer) { // В пролете, пользователь завис курсором над нотификатором
                    checkInterval += 1000;
                    return '';
                }

                var notificationCount = (self.list().length-1);
                if ((new Date().getTime()-self.list()[notificationCount].createTime) < checkInterval) { // Прошло еще слишком мало времени, рано убивать
                    return '';
                }

                if (checkInterval > 5000) {
                    checkInterval = 5000;
                }
                self.hideFastNotification();
            }
        }, 1000);

        this.afterRender();
    }

    NotificationBarComponent.prototype = {

        constructor : NotificationBarComponent,

        /**
         * EventSource Handler
         * */
        userOnlineStatusHandler: function userOnlineStatusHandler(event, params) {
            var user_id = params.user_id,
                status = params.status,
                allowChange,
                changeStatusLegend = userOnlineStatusHandler.changeStatusLegend || [];

            if (status == 'offline') {
                var now = new Date().getTime();
                allowChange = false;
                if (!changeStatusLegend.hasOwnProperty(user_id)) {
                    changeStatusLegend[user_id] = now;
                }

                if (changeStatusLegend.hasOwnProperty(user_id) && (now - changeStatusLegend[user_id]) >= 3000) {
                    allowChange = true;
                    changeStatusLegend[user_id] = now;
                }
            } else {
                allowChange = true;
            }

            if (allowChange) {
                for (var i in window.allUserModel) {
                    if (window.allUserModel[i].id() == user_id) {
                        window.allUserModel[i].online((status == 'online')); //todo
                    }
                }
            }
        },

        /**
         * EventSource Handler
         * */
        notificationCancelHandler: function (event, params) {
            var id = params.id;
            var notificationList = this.list();
            var that = this;

            notificationList.forEach(function(item){
                if (item.id == id) {
                    if (item.groupId == 0 || that.byGroup(item.groupId).length <= 1) {
                        notificationHide(item.divId, function () {
                            that.hide(item);
                        });
                    } else {
                        that.hide(item);
                    }
                }
            });
        },

        /**
         * EventSource Handler
         * */
        chatMessageHandler: function (event, params) {
            var dialog_count = params.dialog_count,
                app = application.root(),
                data = params.data,
                broadcast = params.broadcast,
                messageCollection = app.chat() || (app.uiEvent() && app.uiEvent().chat()),
                that = this;

            // способ подтверждения доставки сообщения на сервер, методом возврата его по event-source
            // не является необходимостью
            // поскольку отправка сообщения по ajax и получения состояния успеха является достаточным
            // по хорошему, этот механизм можно выпилить

            if (messageCollection && messageCollection.id == data.chat_id) {
                var messageOnConfirmation = messageCollection.messageWaitingConfirmation[0];

                // if it is my message
                if (typeof messageOnConfirmation !== 'undefined'
                    && data.message === messageOnConfirmation.message()
                    && data.author.id === app.currentUser().id()){

                    messageOnConfirmation.isConfirmedByServer(true);

                    ko.mapping.fromJS(data, {}, messageOnConfirmation); // дополняем поля

                    messageCollection.messageWaitingConfirmation.splice(0, 1);//remove
                } else{
                    messageCollection.addMessage(new MessageModel(data));
                }
            }

            if (broadcast){
                return '';
            }

            var notShow = app.chat() && ( app.chat().id === parseInt(params.data.chat_id, 10) );

            if (!notShow){
                that.show(null, 'NEW_MESSAGE', {
                    '%name%': data.author.name + ' ' + data.author.family,
                    '%chat_id%': params.data.author.id,//params.data.chat_id,//todo
                    '%user_id%': params.data.author.id,
                    '%message%': data.message
                });
            }

        },

        /**
         * EventSource Handler
         * */
        userLogoutHandler: function () {
            window.location.reload();
        },

        /**
         * EventSource Handler
         * */
        notificationAddHandler: function (event, params) {
            var data = params.data,
                webinarGroupId = 2,
                isWebinarPage = application.router.currentRoute().page === "webinar-start-page", // todo
                noteForWebinarPage = this.types[params.data.type].groupId === webinarGroupId;

            if (isWebinarPage || (!isWebinarPage && !noteForWebinarPage)){
                this.show(data.id, data.type, data.messageParams, data.buttons, data.links, params.data);
            }
        },

        afterRender: function(){
            this.load();

            application.$body.eventRegister({
                notification_add : this.notificationAddHandler.bind(this),
                notification_cancel : this.notificationCancelHandler.bind(this),
                user_online_status : this.userOnlineStatusHandler.bind(this),
                user_logout : this.userLogoutHandler.bind(this),
                chat_message : this.chatMessageHandler.bind(this)
            });
        },

        dispose : function() {
            application.$body.eventUnRegister({
                notification_add : this.notificationAddHandler,
                notification_cancel : this.notificationCancelHandler,
                user_online_status : this.userOnlineStatusHandler,
                user_logout : this.userLogoutHandler,
                chat_message : this.chatMessageHandler
            });
            clearInterval(this._timer);
        }
    };

    return { viewModel: NotificationBarComponent, template: template }
});