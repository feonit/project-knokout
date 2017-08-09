define([
    'knockout',
    'text!components/controls/control-confirm/control-confirm.html'
], function (
    ko,
    template
) {

    function ControlConfirmComponent(params) {
        if (!params || !params.value){
            throw Error(' \"control-confirmation\" - Has no parameters')
        }

        if (typeof params.value.confirm !== 'function') params.value.confirm = function(){};
        if (typeof params.value.cancel !== 'function') params.value.cancel = function(){};

        var $deferred,
            that = this;

        this.isProcessing = ko.observable(false);

        this.confirm = function(viewModel, jqEvent){
            $deferred = params.value.confirm.apply(params.value.context, params.value.arguments);

            if ($deferred){
                //$deferred.done(function(){
                that.isProcessing(true);
                //});
            }
        };
        this.cancel = function(viewModel, jqEvent){
            $deferred = params.value.cancel.apply(params.value.context, params.value.arguments);

            if ($deferred){
                //$deferred.done(function(){
                that.isProcessing(true);
                //});
            }
        };
    }

    return { viewModel: ControlConfirmComponent, template: template }
});