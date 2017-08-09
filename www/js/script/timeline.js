(function( $ ){
	"use strict";

	var markNumber = 0;
    var callbackArray = {};

 $.fn.dragble = function (stepValue, moveCallback) {
      var clicking = false;
      var curentPos;
      var curentObj;
      var takeMinutes;
      var progWidth = $(".progress_line").outerWidth();

      $(this).on('mousedown', "div.line_mark", function() {
        clicking = true;
        curentObj = $(this);
      }).on('mouseup', "div.line_mark", function() {
        clicking = false;
      });

      $(this).swipe("destroy");
      $(this).swipe({
          swipeStatus:function(event, phase, direction, distance, duration, fingers) {
            if (phase=="start") {
              if (typeof curentObj === 'undefined') {
                return false;
              } else {
                if (clicking == true) {
                  curentPos = parseInt(curentObj.css("left"));
                  takeMinutes = Math.round(parseInt(curentObj.css("left")) / stepValue);
                }
              }
            }
            if (phase!="cancel" && phase!="end") {
              if (clicking == true) {
                if (direction=="right") {
                  curentObj.css("left", curentPos + distance);

                  if (parseInt(curentObj.css("left")) > progWidth) {
                    curentObj.css("left", progWidth);
                  }
                  takeMinutes = Math.round(parseInt(curentObj.css("left")) / stepValue);
                }
                if (direction=="left") {
                  curentObj.css("left", curentPos - distance);

                  if (parseInt(curentObj.css("left")) < 0) {
                    curentObj.css("left", "0px");
                  }

                  takeMinutes = Math.round(parseInt(curentObj.css("left")) / stepValue);
                }
              }
            }
            if (phase=="cancel" || phase=="end") {
              var minute_Position = Math.round(takeMinutes * stepValue);
              curentObj.css("left", minute_Position);
              moveCallback(curentObj, takeMinutes);
            }
          },
          triggerOnTouchLeave:true
        });
 }
})( jQuery );