define([
    'knockout',
    'application',
    'text!components/controls/control-time/control-time.html'
], function (
    ko,
    application,
    template
) {

    function _isNull(value){
        return value === null;
    }

    function Component(params, componentInfo) {

        var that = this;
        var element = componentInfo.element;
        var $input = $(element).find('input');

        this.observableAttribute = params.observableAttribute;
        this.disable = params.disable;


        this.observableAttribute.subscribe(function(value) {
            $input.val(that.convertCountOfMinutesToHHMMFn(value));
        });

        $input.mask("99:99", { completed: onChange })
            .val(that.convertCountOfMinutesToHHMMFn(this.observableAttribute()))
            .on('change', onChange);

        function onChange() {
            var targetValue = that.convertHHMMtoCountOfMinutesFn($(this).val()),
                value = (targetValue === '' || _isNull(targetValue)) ? undefined : targetValue;
            that.observableAttribute(value);
        }

    }

    Component.prototype = {

        _store : {
            interval_id: undefined,
            timeout_id: undefined
        },

        bindTimer : function(action){
            var PERIOD_TIME = 100;
            var DELAY_TIME = 300;

            var that = this;

            application.$window.one('mouseup', this.onMouseUp.bind(this));

            clearInterval(this._store.interval_id);
            clearInterval(this._store.timeout_id);

            this[action]();

            this._store.timeout_id = setTimeout(function(){

                that._store.interval_id = setInterval(function(){
                    that[action]();
                }, PERIOD_TIME);

            }, DELAY_TIME);
        },

        unbindTimer : function(){
            if (this._store){
                clearInterval(this._store.interval_id);
                clearInterval(this._store.timeout_id);
            }
        },

        onMouseUp: function (){
            clearInterval(this._store.interval_id);
            clearInterval(this._store.timeout_id);
            return true;
        },

        convertHHMMtoCountOfMinutesFn: function (sourceString) {
            if (sourceString == '') return null;

            var timeArray = sourceString.split(":");
            return (Math.round(timeArray[0]*60) + Math.round(timeArray[1]));
        },

        convertCountOfMinutesToHHMMFn : function (minutes) {
            if (typeof minutes === 'undefined') return;
            var seconds = parseInt(minutes * 60, 10);
            return this.convertCountOfSecondsToHHMMSSFn(seconds, false, false);
        },

        convertCountOfSecondsToHHMMSSFn : function(seconds, dateTransfer, showSeconds){
            dateTransfer = typeof dateTransfer === 'undefined' ? true : dateTransfer;
            showSeconds = typeof showSeconds === 'undefined' ? true : showSeconds;

            if (seconds === 86400){
                return '00:00';
            }
            // Hours, minutes and seconds
            var hrs = Math.floor(seconds / 3600);
            var mins = Math.floor((seconds % 3600) / 60);
            var secs = (seconds % 60);
            var ret = "";

            if (hrs > 0) {
                if ((typeof dateTransfer == 'undefined' || dateTransfer == true) && hrs > 24) {
                    hrs = hrs-(24*~~(hrs/24));
                }

                ret += "" + (hrs<=9?"0"+hrs:hrs) + ":";
            } else {
                ret += "00:";
            }
            ret += (mins < 10 ? "0" : "") + mins;
            if (showSeconds == true) {
                ret += ":" + (secs < 10 ? "0" : "") + secs;
            }
            return ret;
        },

        incrementHours : function(){
            var time = this.observableAttribute();
            if ("undefined" === typeof time){
                this.observableAttribute(0);
                time = 0;
            }

            if ( Math.floor(time/60) === 23){
                time = time%60;
            } else {
                time = time + 60;
            }

                this.observableAttribute(time);
        },

        decrementHours : function(){
            var time = this.observableAttribute();
            if ("undefined" === typeof time){
                this.observableAttribute(0);
                time = 0;
            }

            if ( Math.floor(time/60) === 0){
                time = time + 60 * 23;
            } else {
                time = time - 60;
            }

            this.observableAttribute(time);
        },

        incrementMinutes : function(){
            var time = this.observableAttribute();
            if ("undefined" === typeof time){
                this.observableAttribute(0);
                time = 0;
            }

            if (time%60 === 59){
                time = Math.floor(time/60)*60;
            } else {
                time = time + 1;
            }

            this.observableAttribute(time);
        },

        decrementMinutes : function(){
            var time = this.observableAttribute();
            if ("undefined" === typeof time){
                this.observableAttribute(0);
                time = 0;
            }

            if (time%60 === 0){
                time = 59 + Math.floor(time/60)*60;
            } else {
                time = time - 1;
            }

            this.observableAttribute(time);
        },

        afterRender: function(){

        },

        dispose : function() {

        }
    };

    return { viewModel: {
        createViewModel: function (params, componentInfo){
            return new Component(params, componentInfo)
        }
    }, template: template }
});