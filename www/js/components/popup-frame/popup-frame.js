define([
    'knockout',
    'application',
    'text!components/popup-frame/popup-frame.html'
], function(
    ko,
    application,
    template
){

    var API_popup_frame = null;

    /**
     * @public API
     * */
    var API = application.api.popupModule = {
        createPopup: function(options){
            var templateName = options.templateName;

            require(['text!components/popup-frame/popups/' + templateName + '.html'], function(template){
                if (!ko.components.isRegistered(templateName)){
                    ko.components.register(templateName, {
                        viewModel: PopupFrameComponent,
                        template: template
                    });
                }
                // store options
                API_popup_frame.options(options);
                API_popup_frame.currentPopupName(templateName);
                API_popup_frame.isOpen(true);
            });
        }
    };

    var PopupFrameComponent = function (){
        // restore options
        var options = API_popup_frame.options();

        this.afterRenderCustom  = (typeof options.afterRender === "function") ? options.afterRender : function(){};
        this.onDispose  = (typeof options.onDispose === "function") ? options.onDispose : function(){}; //todo replace to onDispose (that have the conflict with Component.prototype.dispose in ko)
        this.onConfirm  = (typeof options.onConfirm === "function") ? options.onConfirm : function(){};
        this.onFailure  = (typeof options.onFailure === "function") ? options.onFailure : function(){};

        this.context = ko.observable(options.context);

        var that = this;

        this.$el = API_popup_frame.$el;

        that.afterRender();
        that.afterRenderCustom.call(this.$el);
    };

    PopupFrameComponent.prototype = {

        // common afterRender event handler
        afterRender: function(){
            var that = this;

            this.$el.find('.modal_button_cancel').on('click', function(){
                that.onFailure();
                that._closePopup(false);
            });

            this.$el.find('.modal_button_ok').on('click', function(){
                API_popup_frame.isAccepted(true);
                that.onConfirm();
                that._closePopup(true);
            });

        },

        dispose: function(){
            if (this.$el){
                this.$el.find('.modal_button_cancel').off();
                this.$el.find('.modal_button_ok').off();
            }
            this._closePopup();
        },

        _closePopup: function(confirm){
            API_popup_frame.currentPopupName(undefined);
            API_popup_frame.options(undefined);
            API_popup_frame.isRendered(false); // clear frame
            API_popup_frame.isOpen(false); // close frame
        }
    };

    function Component (){
        this.$el = $('#popupFrame');
        this.currentPopupName = ko.observable();
        this.options = ko.observable();
        this.isOpen = ko.observable(false);
        this.isRendered = ko.observable(false);
        this.isAccepted = ko.observable(false);

        API_popup_frame = this;
    }

    Component.prototype = {
        constructor: Component,

        onTransitionEnd: function(){
            if (this.isOpen()){
                this.isRendered(true);
            } else {
                // reset that state too, after end
                this.isAccepted(false);
            }
        }
    };

    return { viewModel: Component, template: template };
});