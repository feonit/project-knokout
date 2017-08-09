define([
    'knockout',
    'favicon',
    'application'
], function(
    ko,
    Favicon,
    application
){

    function CountersModel(invites, dialogs){
        this.newsCount = ko.observable(invites);
        this.dialogsCount = ko.observable(dialogs);

        this.sumCounters = ko.computed(function(){
            return parseInt(this.newsCount(), 10) + parseInt(this.dialogsCount(), 10);//loyalty todo backend string -> int
        }, this);

        this.favicon = new Favicon({
            animation:'none',
            fontFamily: 'PT Sans bold',
            type: 'rectangle',
            bgColor : '#c54b3b'
        });

        this.favicon.badge(this.sumCounters());

        this.subscription = this.sumCounters.subscribe(function(value){
            this.favicon.badge( value );
        }, this);

        var that = this;
        /**
         * EventSource Handler
         * */
        this.userCounterUpdateHandler = function (event, params) {
            var invites = parseInt(params.invites, 10),
                dialogs = parseInt(params.dialogs, 10);

            var app = application.root();
            var notIncr = app.chat() && ( app.chat().id === parseInt(params.entityId, 10) );
            var isDectrement = parseInt(that.dialogsCount(), 10) > parseInt(dialogs, 10); // ОСОБЫЙ СЛУЧАЙ
            // если не открыт
            if (isDectrement || !notIncr){
                that.newsCount(invites);
                that.dialogsCount(dialogs);
            }
            if (isDectrement){
                app.dialogs() && app.dialogs().load(); // тяжкий костыль для случая когда диалог меняет состояние на "прочитан" при переходе по нотификатору
            }
        };

        application.$body.eventRegister({
            user_counter_update : this.userCounterUpdateHandler
        });
    }

    return CountersModel;
});