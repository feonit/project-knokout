define([
    '_',
    'knockout',
    'application',
    'View',
    'text!components/pages/webinar-create-page/tab-webinar-create-info/tab-webinar-create-info.html',
    'ClockDaemon'
], function(
    _,
    ko,
    application,
    View,
    template,
    ClockDaemon
){

    var _isNull = function(value){
        return value === null;
    };

    var Component = _.defineSubclass(View,

        function Component(params) {

            var eventModel = application.root().eventModel();

            var _isInteger = Number.isInteger; //ES6

            var process = false;

            eventModel.startTime.subscribe(function(value){
                if (typeof value === 'undefined') return;
                if (process === true) return;

                var duration = eventModel.duration();
                // duration is major field for settings
                if (_isInteger(duration)){
                    eventModel.endTime(eventModel.startTime() + eventModel.duration());
                }
            });
            eventModel.endTime.subscribe(function(value){
                if (typeof value === 'undefined') return;
                if (process === true) return;
                process = true;

                // if end=25:99
                if (value > 1440){
                    process = false;
                    setTimeout(function(){
                        eventModel.endTime(1439)
                    }, 0); // after setter (reset)
                    return;
                } else {
                    var end = eventModel.endTime(),
                        start = eventModel.startTime();

                    if ( _isInteger(end) && _isInteger(start)){
                        var computed = eventModel.endTime() - eventModel.startTime();

                        // if start=10:00 end=00:12
                        if (computed < 0){
                            computed = computed + 1440;
                        }
                        eventModel.duration(computed);
                    }
                }
                process = false;
            }, this);
            eventModel.duration.subscribe(function(value){
                if (typeof value === 'undefined') return;
                if (process === true) return;

                var duration = eventModel.duration(),
                    start = eventModel.startTime();

                if (_isInteger(duration) && _isInteger(start)){
                    process = true;
                    var computed = duration + start;

                    // if duration > 24:00
                    if (computed > 1440){
                        computed = computed - (Math.floor(computed/1440) * 1440); //when duration more than 24 hours
                    }

                    eventModel.endTime(computed);
                    process = false;
                }

            }, this);

            // ================== обработка переключателя экспресс
            eventModel.isExpress.subscribe(setTimerForStartTime);

            // init
            if (eventModel.isExpress()){
                setTimerForStartTime(true)
            }


            function setTimerForStartTime(isExpress){
                var $dateSelector = $('#eventDateSelector');//todo

                var _fn = setTimerForStartTime;

                eventModel.endTime(undefined);
                eventModel.startTime(undefined);
                eventModel.duration(undefined);


                if (isExpress === true){
                    _fn.clockDaemon = new ClockDaemon();

                    eventModel.startTime(_fn.clockDaemon.minutesPerDay());

                    _fn.sub1 = _fn.clockDaemon.minutesPerDay.subscribe(function(value){
                        eventModel.startTime(value);
                    });

                    _fn.sub2 = _fn.clockDaemon.dayOfMonth.subscribe(function(value){
                        $dateSelector.dateSelector(new Date(),function (date){eventModel.createDate(date)});
                    });

                    if ($dateSelector.length){
                        $dateSelector.dateSelector(new Date(),function (date){eventModel.createDate(date)},{ disabled: true});
                    }
                } else {
                    if (_fn.clockDaemon){
                        _fn.clockDaemon.destroy();
                    }
                    if ($dateSelector.length){
                        $dateSelector.dateSelector(new Date(),function (date){eventModel.createDate(date)});
                    }
                }
            }
            // ==================

        } , {

            dispose: function(){

            }
        }
    );

    return { viewModel: Component, template: template }
});