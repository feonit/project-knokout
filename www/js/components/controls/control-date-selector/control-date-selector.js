define([
    'knockout',
    'application'
], function (
    ko,
    application
) {

    "use strict";

    /**
     * Created by apopov, vadimzem on 11.09.14.
     */

    var translation = application.translation;

    $.fn.dateSelector = function(date, callback, options) {
        options = options || {};

        var dat  = new Date();
        var cur_day = dat.getDate();
        var cur_month = dat.getMonth() + 1;
        var cur_year = dat.getFullYear();


        var list_of_month = {
            1 : translation.january,
            2 : translation.february,
            3 : translation.march,
            4 : translation.april,
            5 : translation.may,
            6 : translation.june,
            7 : translation.july,
            8 : translation.august,
            9 : translation.september,
            10 : translation.october,
            11 : translation.november,
            12 : translation.december,
        };

        if (typeof(date) == 'undefined') {
            var globYear = cur_year;
            var globMonth = cur_month;
            var globDay = cur_day;

            var daySelected = cur_day;
            var monthSelected = cur_month;
            var yearSelected = cur_year;
        } else {
            var editDate  = date;

            var selectedDay = editDate.getDate();
            var selectedMonth = editDate.getMonth() + 1;
            var selectedYear = editDate.getFullYear();

            var globYear = selectedYear;
            var globMonth = selectedMonth;
            var globDay = selectedDay;

            var daySelected = selectedDay;
            var monthSelected = selectedMonth;
            var yearSelected = selectedYear;
        }

        $(this).empty();
        var mainDiv = $('<div class="inside_select_field"></div>').appendTo(this);

        if (options.disabled){
            $(mainDiv).append("<select disabled id=\"daySelect\" class=\"regdate_select day_picker\"></option>");
            $(mainDiv).append("<select disabled id=\"monthSelect\" class=\"monthdate_select month_picker\"></option>");
            $(mainDiv).append("<select disabled id=\"yearSelect\" class=\"regdate_select year_picker\"></option>");
        } else {
            $(mainDiv).append("<select id=\"daySelect\" class=\"regdate_select day_picker\"></option>");
            $(mainDiv).append("<select id=\"monthSelect\" class=\"monthdate_select month_picker\"></option>");
            $(mainDiv).append("<select id=\"yearSelect\" class=\"regdate_select year_picker\"></option>");
        }

        function fillYear(year) {
            var tYear = cur_year;
            var maxYear = tYear + 3;

            while (tYear <= maxYear ) {
                if (tYear != year) {
                    $("#yearSelect").append(
                        "<option>" + tYear + "</option>"
                    );
                } else {
                    $("#yearSelect").append(
                        "<option selected='selected'>" + tYear + "</option>"
                    );
                }
                tYear++;
            }
        }

        function fillMonth(year) {
            var month = cur_month;

            if (year == cur_year) {

                $("#monthSelect option").remove();
                var monthCounter = month;
                while (monthCounter <= 12 ) {
                    if (monthCounter != month) {
                        if (monthSelected == monthCounter) {
                            $("#monthSelect").append(
                                "<option selected='selected'>" + list_of_month[monthCounter] + "</option>"
                            );
                        } else {
                            $("#monthSelect").append(
                                "<option>" + list_of_month[monthCounter] + "</option>"
                            );
                        }
                    } else {
                        if (monthSelected == monthCounter) {
                            $("#monthSelect").append(
                                "<option selected='selected'>" + list_of_month[monthCounter] + "</option>"
                            );
                        } else if (monthSelected < monthCounter) {
                            $("#monthSelect").append(
                                "<option selected='selected'>" + list_of_month[monthCounter] + "</option>"
                            );
                            monthSelected = monthCounter;
                            globMonth = monthCounter;
                            callback(yearSelected+"-"+monthSelected+"-"+daySelected);
                        } else {
                            $("#monthSelect").append(
                                "<option>" + list_of_month[monthCounter] + "</option>"
                            );
                        }

                    }
                    monthCounter++;
                }

            } else {

                $("#monthSelect option").remove();
                var monthCounter = 1;
                while (monthCounter <= 12 ) {
                    if (monthSelected == monthCounter) {
                        $("#monthSelect").append(
                            "<option selected='selected'>" + list_of_month[monthCounter] + "</option>"
                        );
                    } else {
                        $("#monthSelect").append(
                            "<option>" + list_of_month[monthCounter] + "</option>"
                        );
                    }
                    monthCounter++;
                }
            }

        }

        function fillDay(month, year) {
            var day = cur_day;

            var changed_weak = new Date(year, month, 0);
            var curent_days = changed_weak.getDate();

            if (year == cur_year && month == cur_month) {
                $("#daySelect option").remove();
                var dayCounter = day;
                while (dayCounter <= curent_days) {
                    if (dayCounter != day) {
                        if (daySelected == dayCounter) {
                            $("#daySelect").append(
                                "<option selected='selected'>" + dayCounter + "</option>"
                            );
                        } else if (daySelected > curent_days) {
                            $("#daySelect").append(
                                "<option selected='selected'>" + dayCounter + "</option>"
                            );
                            daySelected = curent_days;
                            callback(yearSelected+"-"+monthSelected+"-"+daySelected);
                        } else {
                            $("#daySelect").append(
                                "<option>" + dayCounter + "</option>"
                            );
                        }
                    } else {
                        if (daySelected == dayCounter) {
                            $("#daySelect").append(
                                "<option selected='selected'>" + dayCounter + "</option>"
                            );
                        } else if (daySelected < dayCounter) {
                            $("#daySelect").append(
                                "<option selected='selected'>" + dayCounter + "</option>"
                            );
                            daySelected = dayCounter;
                            callback(yearSelected+"-"+monthSelected+"-"+daySelected);
                        } else {
                            $("#daySelect").append(
                                "<option>" + dayCounter + "</option>"
                            );
                        }
                    }
                    dayCounter++;
                }

            } else {

                $("#daySelect option").remove();
                var dayCounter = 1;
                while (dayCounter <= curent_days) {
                    if (daySelected == dayCounter) {
                        $("#daySelect").append(
                            "<option selected='selected'>" + dayCounter + "</option>"
                        );
                    } else if (daySelected > curent_days) {
                        $("#daySelect").append(
                            "<option selected='selected'>" + dayCounter + "</option>"
                        );
                        daySelected = curent_days;
                        callback(yearSelected+"-"+monthSelected+"-"+daySelected);
                    } else {
                        $("#daySelect").append(
                            "<option>" + dayCounter + "</option>"
                        );
                    }

                    dayCounter++;
                }

            }

        }

        function change_fill(htmlObject) {
            var openedSelect = htmlObject.parents(".jq-selectbox").siblings();

            if (openedSelect.hasClass("year_picker")) {
                var valueYear = htmlObject.html();
                yearSelected = valueYear;
                fillMonth(valueYear);
                fillDay(globMonth, valueYear);
                globYear = valueYear;
                $('select').trigger('refresh');
                callback(yearSelected+"-"+monthSelected+"-"+daySelected);
            }
            if (openedSelect.hasClass("month_picker")) {
                var getMonthName = htmlObject.html();
                var valueMonth;
                for(var i=0; i < 13; i++){
                    if (list_of_month[i] == getMonthName) {
                        valueMonth = i;
                    }
                }

                monthSelected = valueMonth;
                fillDay(valueMonth, globYear);
                globMonth = valueMonth;
                $('select').trigger('refresh');
                callback(yearSelected+"-"+monthSelected+"-"+daySelected);
            }
            if (openedSelect.hasClass("day_picker")) {
                var valueDay = htmlObject.html();
                daySelected = valueDay;
                callback(yearSelected+"-"+monthSelected+"-"+daySelected);
            }
        }

        if (typeof(date) == 'undefined') {
            fillYear(cur_year);
            fillMonth(cur_year);
            fillDay(cur_month, cur_year);
        } else {
            fillYear(selectedYear);
            fillMonth(selectedYear);
            fillDay(selectedMonth, selectedYear);
            callback(selectedYear+"-"+selectedMonth+"-"+selectedDay);
        }
// knockout has conflict with tag select, so you need to init third-party plugins after render knockout
        this.find('select').styler();

        $(".jq-selectbox-wrapper").on('click', "li", function() {
            var cur_this = $(this);
            change_fill(cur_this);
        });
    };

    function Component(params, componentInfo) {

        var that = this;
        var element = componentInfo.element;
        var $dateSelector = $(element).find('#eventDateSelector');

        this.webinarModel = params.webinarModel;

        this.disable = params.disable;

        this.webinarModel.startTimestamp.subscribe(setDate, this);

        function setDate(){

            if (that.webinarModel.editMode()){
                var fullUnixTime;

                if (!that.webinarModel.startTimestamp()){
                    return;
                }
                fullUnixTime = that.webinarModel.startTimestamp() * 1000;

                $dateSelector.dateSelector(new Date(fullUnixTime),function (date){
                    that.webinarModel.createDate(date);
                });
            } else {
                $dateSelector.dateSelector(new Date(),function (date){
                    that.webinarModel.createDate(date);
                });
            }
        }

        setDate();
    }

    Component.prototype = {
        afterRender: function(){

        },

        dispose : function() {

        }
    };

    return { viewModel: {
        createViewModel: function (params, componentInfo){
            return new Component(params, componentInfo)
        }
    }, template: '<div class="select_field date_picker_style float_left" id="eventDateSelector"></div>' }
});