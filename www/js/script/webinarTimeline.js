define(['jquery'], function($){

	"use strict";

	var clearTimeLine;
	var clearTimeWebinar;

	var options = {
		timeMaxGL : null,
		timeOffsetGL : null,
		loudArrayGL : null,
		ownerWebGL : null
	};

	function makeDouble(number) {
		return (number<=9 ? '0' + number : number);
	}

	function timeToHM(h, m) {
		return (h<=9 ? '0' + h : h) + ':' + (m <= 9 ? '0' + m : m);
	}

	$.fn.webinarTimeline = function(timeMaxLen, timeOffset, loudArray, ownerWeb){
		var that = $(this);
		// var loudArray = [{'time': 1, 'я': 'Упомянуть о Пушкине'}, {'time': 3, 'title': 'Процитировать свои мысли'}, {'time': 25, 'title': 'Поругать кого нибудь'}, {'time': 34, 'title': 'Подготовится к прощанию'}];
		var fullValueW = $(this).width() / timeMaxLen;
		var curentAppend = timeOffset * fullValueW;
		var markSkiped = 0;
		var iCount = timeOffset;

		options.timeMaxGL = timeMaxLen;
		options.timeOffsetGL = timeOffset;
		options.loudArrayGL = loudArray;
		options.ownerWebGL = ownerWeb;

		clearInterval(clearTimeWebinar);
		clearInterval(clearTimeLine);
		that.find("div").remove();
		that.append(
			"<div class='progress_line_holder'>" +
				"<div class='timeline_progress' style='width:" + curentAppend + "px'></div>" +
			"</div>"
		);

		if (ownerWeb == true) {
			for(var i=0; i < loudArray.length; i++){
				var markPos = loudArray[i].time * fullValueW;
				if (loudArray[i].time < timeOffset) {
					markSkiped++;
				}
				that.append(
					"<div class='timeline_mark hover_mark' style='left:" + markPos + "px'>" +
						"<div id='artm_" + i + "' class='arrow_tl ltm_mark'></div>" +
						"<div id='note_" + i + "' class='mark_time_title'>" + loudArray[i].message + "<span class='close_tl_note'></span></div>" +
						"</div>"
				);

				var createdMark = $('#note_' + i);
				var createdArrow = $('#artm_' + i);
				var centMarg = createdMark.outerWidth() / 2;
				var remainW = that.width() - markPos;
				var fixerCor = 0;

				if (markPos < centMarg) {
					fixerCor = centMarg - markPos;
					createdMark.css({'margin-left': -centMarg + fixerCor});
				} else if (remainW < centMarg) {
					fixerCor = centMarg - remainW;
					createdMark.css({'margin-left': -centMarg - fixerCor});
					createdArrow.addClass("rtm_mark").css({left: "auto", right: "1px"});
				} else {
					createdMark.css({'margin-left': -centMarg});
				}
			}
		}


		/* Time Line timer */
		function lineTimeCourse() {
			options.timeOffsetGL++;
			iCount++;
			if (iCount >= timeMaxLen) {
				clearInterval(clearTimeLine);
			}

			var wLine = parseInt(that.find(".timeline_progress").css("width")) + fullValueW;

			if (ownerWeb == true) {
				if (markSkiped < loudArray.length) {
					if (loudArray[markSkiped].time == iCount) {
						var idNote = $('#note_' + markSkiped);
						var idArrow = $('#artm_' + markSkiped);

						$('#note_' + (markSkiped - 1)).animate({opacity: "hide"}, 500).parent().addClass("hover_mark");
						$('#artm_' + (markSkiped - 1)).animate({opacity: "hide"}, 500);

						idNote.animate({opacity: "show"}, 500).parent().removeClass("hover_mark");
						idArrow.animate({opacity: "show"}, 500);
						markSkiped++;
					}
				}
			}


			that.find(".timeline_progress").animate({width: wLine}, 300);

		}
		clearTimeLine = setInterval(lineTimeCourse, 60000);

		/* Player timer */

		var takeHours = timeMaxLen / 60;
		var fullHours = Math.floor(takeHours);
		var fullMinutes = timeMaxLen - (fullHours * 60);
		var fullTimeWebinar = timeToHM(fullHours, fullMinutes) + ":00";
		var curHours = 0;
		var curMinutes = 0;
		var curSeconds = 0;
		var appndHours;
		var appndMinutes;
		var appndSeconds;

		$(".webinar_full_time").html(fullTimeWebinar);

		if (timeOffset == 0) {
			appndHours = makeDouble(curHours);
			appndMinutes = makeDouble(curMinutes);
			appndSeconds = makeDouble(curSeconds);

			$(".curw_hours").html(curHours);
			$(".curw_hours").html(curHours);
			$(".curw_hours").html(curHours);
		} else {
			var getHours = timeOffset / 60;
			curHours = Math.floor(getHours);
			curMinutes = timeOffset - (curHours * 60);

			appndHours = makeDouble(curHours);
			appndMinutes = makeDouble(curMinutes);
			appndSeconds = makeDouble(curSeconds);
		}

		$(".curw_hours").html(appndHours);
		$(".curw_minutes").html(appndMinutes);
		$(".curw_second").html(appndSeconds);

		function webinarTimeCourse() {

			if (curSeconds >= 59) {
				curSeconds = 0;
				curMinutes++;
			} else {
				curSeconds++;
			}

			if (curMinutes > 59) {
				curMinutes = 0;
				curHours++;
			}

			var overTime = (curHours * 60) + curMinutes;

			appndHours = makeDouble(curHours);
			appndMinutes = makeDouble(curMinutes);
			appndSeconds = makeDouble(curSeconds);
			$(".curw_hours").html(appndHours);
			$(".curw_minutes").html(appndMinutes);
			$(".curw_second").html(appndSeconds);

			if (overTime >= timeMaxLen) {
				$(".webinar_main_timer").addClass("overtime_span");
				$(".timeline_progress").addClass("overtime_webinar_time");
			}

		}
		clearTimeWebinar = setInterval(webinarTimeCourse, 1000);


		$(".close_tl_note").on("click", function() {
			$(this).parent().animate({opacity: "hide"}, 300).siblings().animate({opacity: "hide"}, 300, function () {
				$(this).parents(".timeline_mark").addClass("hover_mark");
			});
		});

		$(".time_line_webinar").on('mouseenter', ".hover_mark", function() {
			$(this).find("div").show().find("span").hide();

		}).on('mouseleave', ".hover_mark", function() {
			$(this).find("div").hide().find("span").show();;
		});

	};

	$.fn.updateTimeline = function(timeMax, curent, loudAr, owner) {
		$(this).webinarTimeline(timeMax, curent, loudAr, owner);
	};

	return {
		options : options
	};
});