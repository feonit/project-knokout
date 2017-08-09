define([
	'jquery',
	'knockout',
	'ajaxAdapter',
	'WebinarModel',
	'application'
], function(
	$,
	ko,
	ajaxAdapter,
	WebinarModel,
	application
){

	"use strict";
	
	var callbackFn;
	var translation = application.translation;

	function dateToYMD(y, m, d) {
		return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
	}

//	window.getEventsByDate = getEventsByDate;
//	function getEventsByDate(date) {
//		date = date || "2015-04-15";
//		$.getJSON("/calendar/getJsonCalendar/date/"+date+"?limit=10&offset=0", function( data ) {
//			var context = ko.dataFor($('#calendarCounteiner')[0]).calendar;
//			var arr = [];
//			//context.items.removeAll();
//			for (var key in data ) {
//				context.items.push(new WebinarModel(data[key]));
//			}
//			//context.items(arr);
//		})
//	}

	var CalendarViewModel = function(){
		this.items = ko.observableArray('');
		this.loaded = ko.observable(false)
	};

	function getEventsByDate(date) {
		if (window.API_calendarWebinarComponent){
			API_calendarWebinarComponent.destroy();
		}
		var calendarViewModel = new CalendarViewModel();

		application.root().calendar(calendarViewModel);

		ajaxAdapter.request("/calendar/getJsonCalendar/date/" + date, 'GET', {}, function( response ) {

			var data = response.result;

			var arr = [];

			calendarViewModel.items.removeAll();
			for (var key in data ) {
				arr.push(new WebinarModel(data[key]));
			}
			calendarViewModel.items(arr);

			callbackFn && callbackFn();

			calendarViewModel.loaded(true);
		})
	}

	return {
		init: function(callback){
			callbackFn = callback;
			
			var d = new Date();
			var firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
			var lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
			var today_date = dateToYMD(d.getFullYear(), d.getMonth() + 1, d.getDate())
			var month = d.getMonth();
			var month_val = d.getMonth() + 1;
			var day = d.getDate() - 1;
			var day_val = d.getDate();
			var year_value = d.getFullYear();
			var past_count = year_value;
			var future_count = year_value;
			var full_width_year = 0;
			var full_slwidth = 0;
			var right_counter = 0;
			var cur_m_pos = 0;
			var sel_year = year_value;
			var sel_month = month_val;
			var sel_day = day_val;
			var year_value_past = d.getFullYear();
			var year_value_future = d.getFullYear() + 3;
			var max_month_width = 0;
			var barier_width = 0;
			var barier_days = 0;
			var preloadTimer;
			var day_full_width = 0;
			var send_date_rqs;
			var curent_today_date;
			var cur_m_marg;
			var cur_m_width;
			var cur_m_pos;
			var cur_d_pos;
			var cur_d_marg;
			var cur_d_width;
			var ready_cur_mn;
			var ready_cur_dd;
			var main_cords;
			var second_cords;

			var day_contain = '{"val_1":"'+ translation['mon'] +'","val_2":"'+ translation['tue'] +'","val_3":"'+ translation['wed'] +'","val_4":"'+ translation['thu'] +'","val_5":"'+ translation['fri'] +'","val_6":"'+ translation['sat'] +'","val_0":"'+ translation['sun'] +'"}';
			var list_of_days = JSON.parse(day_contain);

			var curent_days = lastDay.getDate();
			var one_day = firstDay.getDay();

			var long_child = $(".days_count").parent(".menu_step_blck");

			send_date_rqs = dateToYMD(sel_year, sel_month, sel_day);
			curent_today_date = dateToYMD(year_value, month_val, day_val);
			disableToday();

			/* ====================================================================== */
			var onload = function(){
				var c_id = year_value_past;
				var pas_id = year_value_past;
				var future_id = year_value_future;
				var div_chld = $("div.wrap_links_block");

				while (c_id <= year_value_future ) {
					if (c_id != year_value) {
						// todo add individual selector
//						$(".jq-selectbox-wrapper select").append(
						$("select").append(
							"<option>" + c_id + "</option>"
						);
					} else {
//						$(".jq-selectbox-wrapper select").append(
						$("select").append(
							"<option selected='selected'>" + c_id + "</option>"
						);
					}
					c_id++;
				}
				$('select').trigger('refresh');

				while (pas_id < year_value) {
					past_count = past_count - 1;
					past_year(div_chld, past_count);
					pas_id++;
				}

				while (future_id > year_value) {
					future_count = future_count + 1;
					next_year(div_chld, future_count);
					future_id--;
				}

				$(".year_list").each(function (i) {
					max_month_width = max_month_width + $(this).outerWidth(true);
				});
				max_month_width = max_month_width - 948;
				barier_width = max_month_width + 131;

				$("div.wrap_links_block div.calendar_link").each(function (i) {
					full_width_year = full_width_year + $(this).outerWidth(true) + 30;
				});
				full_slwidth = full_width_year / 2 - 400;
				right_counter = full_slwidth - 200;

				ready_cur_mn = 0;

				cur_m_marg = parseInt($("div.year_list[name='" + month_val + "']:not(.past_end_link)").css("padding-left"));
				cur_m_width = $("div.year_list[name='" + month_val + "']:not(.past_end_link)").width();
				cur_m_pos = $("div.year_list[name='" + month_val + "']:not(.past_end_link)").position();

				cur_d_pos = $("div.day_list[name='" + day_val + "']").position();
				cur_d_marg = parseInt($("div.day_list[name='" + day_val + "']").css("padding-left"));
				cur_d_width = $("div.day_list[name='" + day_val + "']").width();

				if (month_val != 1) {
					var changed_month = month_val - 1 ;
					var onload_prev = $("div.year_list[name='" + changed_month + "']:not(.past_end_link)").outerWidth(true);
					var onload_marg = parseInt($("div.year_list[name='" + changed_month + "']:not(.past_end_link)").css("padding-left"));
					ready_cur_mn = onload_prev - onload_marg;
				}

				if (day_val != 1) {
					var changed_day = day_val - 1 ;
					var onload_prev = $("div.day_list[name='" + changed_day + "']").outerWidth(true);
					var onload_marg = parseInt($("div.day_list[name='" + changed_day + "']").css("padding-left"));
					ready_cur_dd = onload_prev - onload_marg;
				}

				today_year_sel();
				slide_today();

				$(".today_month").click(function() {
					if (send_date_rqs != today_date) {
						sel_year = year_value;
						sel_month = month_val;
						sel_day = day_val;

						send_date_rqs = dateToYMD(sel_year, sel_month, sel_day);
						getEventsByDate(send_date_rqs);

						curent_days = lastDay.getDate();
						one_day = firstDay.getDay();

						draw_days();
						make_counter();
						jump_today();
					}
					disableToday();

				});

				$(".jq-selectbox__dropdown ul li").click(function() {
					var cur_this = $(this);
					change_year(cur_this);
				});

			}

			this.onload = onload;
			//window.onload = onload;
			/* ====================================================================== */

			month_past(month_val);
			draw_days();
			make_counter();

			$('.top_scroll_value').on('mousewheel', function(event, delta) {
				var leftValue = parseInt($(".wrap_links_block").css("left"));
				var vertScroll = (leftValue - (delta * 50));
				var moved_pos = -leftValue;

				if (vertScroll > 0) {
					$(".wrap_links_block").css("left", "0px");
				} else if (moved_pos >= max_month_width) {
					if (delta > 0) {
						$(".wrap_links_block").css("left", -max_month_width);
					} else {
						$(".wrap_links_block").css("left", vertScroll);
					}
				} else {
					$(".wrap_links_block").css("left", vertScroll);
				}

				event.stopPropagation();
			});

			$('.days_count').on('mousewheel', function(event, delta) {
				var leftValue = parseInt($(".days_links_block").css("left"));
				var vertScroll = (leftValue - (delta * 50));
				var moved_pos = -leftValue;
				var avail_width = day_full_width - 988;

				if (vertScroll > 0) {
					$(".days_links_block").css("left", "0px");
				} else if (moved_pos >= avail_width) {
					if (delta > 0) {
						$(".days_links_block").css("left", -avail_width);
					} else {
						$(".days_links_block").css("left", vertScroll);
					}
				} else {
					$(".days_links_block").css("left", vertScroll);
				}

				event.stopPropagation();
			});

			// knockout has conflict with tag select, so you need to init third-party plugins after render knockout
//			$(function(){
//				$('select').styler();
//			});

			function month_past(curentMonth) {
				$(".curent_year").each(function() {
					if ($(this).attr("name") < curentMonth) {
						$(this).addClass("past_curent_link");
					}
				});
			}

			function disableToday() {
				if (send_date_rqs == today_date) {
					$(".today_month").addClass("disabled_btn").attr("disabled", "disabled");
				} else {
					$(".today_month").removeClass("disabled_btn").removeAttr("disabled");
				}
			}

			function change_year(cur_this) {
				var select_value = cur_this.html();
				sel_year = select_value;
				var option_year = $("span.year_count[name='" + sel_year + "']").parent("div.year_list[name='" + sel_month + "']");

				var changed_weak = new Date(sel_year, sel_month, 0);
				var changed_day = new Date(sel_year, sel_month - 1, 1);

				curent_days = changed_weak.getDate();
				one_day = changed_day.getDay();

				if (select_value != year_value) {
					var option_width = option_year.width();
					var option_pos = option_year.position();
					var option_marg = parseInt(option_year.css("padding-left"));
					var option_wdth_mp = 0;

					if (option_year.is(":not(:first-child)")) {
						var minus_prev = option_year.prev(".calendar_link").outerWidth(true);
						var minus_marg = parseInt(option_year.prev(".calendar_link").css("padding-left"));
						option_wdth_mp = minus_prev - minus_marg;
					}
					if (option_pos.left < barier_width) {
						$("div.wrap_links_block").animate({left: - option_pos.left + option_wdth_mp}, "500");
					} else {
						$("div.wrap_links_block").animate({left: - barier_width}, "500");
					}
					$("div.wrap_links_block .slide_border").animate({left: option_pos.left + option_marg, width: option_width}, "500");

				} else {
					var y_cur_m = parseInt($("div.year_list[name='" + sel_month + "']:not(.past_end_link)").css("padding-left"));
					var y_cur_w = $("div.year_list[name='" + sel_month + "']:not(.past_end_link)").width();
					var y_cur_p = $("div.year_list[name='" + sel_month + "']:not(.past_end_link)").position();

					var minus_prev = $("div.year_list[name='" + sel_month + "']:not(.past_end_link)").prev(".calendar_link").outerWidth(true);
					var minus_marg = parseInt($("div.year_list[name='" + sel_month + "']:not(.past_end_link)").prev(".calendar_link").css("padding-left"));
					var option_wdth = minus_prev - minus_marg;

					$("div.wrap_links_block .slide_border").animate({left: y_cur_p.left + y_cur_m, width: y_cur_w}, "500");
					$("div.wrap_links_block").animate({left: - y_cur_p.left + option_wdth}, "500");
				}

				draw_days();
				make_counter();

				send_date_rqs = dateToYMD(sel_year, sel_month, sel_day);
				getEventsByDate(send_date_rqs);
				disableToday();

			}

			function slide_today() {
				$("div.wrap_links_block .slide_border").css({"left" : cur_m_pos.left + cur_m_marg, "width" : cur_m_width});
				$(".wrap_links_block").css("left", - cur_m_pos.left + ready_cur_mn);
				$(".days_links_block .slide_border").css({"left" : cur_d_pos.left + cur_d_marg, "width" : cur_d_width});
				if (cur_d_pos.left < barier_days) {
					if (typeof(ready_cur_dd) == "undefined") {
						$(".days_links_block").css({left: cur_d_pos.left});
					} else {
						$(".days_links_block").css({left: - cur_d_pos.left + ready_cur_dd});
					}
				} else {
					$(".days_links_block").css({left: - barier_days});
				}
			}

			function jump_today() {
				$("div.wrap_links_block .slide_border").animate({left: cur_m_pos.left + cur_m_marg, width: cur_m_width}, "500");
				$(".wrap_links_block").animate({left: - cur_m_pos.left + ready_cur_mn}, "500");
				$(".days_links_block .slide_border").animate({left: cur_d_pos.left + cur_d_marg, width: cur_d_width}, "500");
				if (cur_d_pos.left < barier_days) {
					if (typeof(ready_cur_dd) == "undefined") {
						$(".days_links_block").css({left: cur_d_pos.left});
					} else {
						$(".days_links_block").css({left: - cur_d_pos.left + ready_cur_dd});
					}
				} else {
					$(".days_links_block").css({left: - barier_days});
				}
				today_year_sel();
			}

			function today_year_sel() {
				var select_yrt = $(".center_block").find(".jq-selectbox__select-text");
				select_yrt.text(year_value);
			}

			function make_counter() {
				var i = 0;
				var request_url = "/calendar/GetJsonCalendarDays/month/" + sel_month + "/year/" + sel_year;
				var txt_counter = {};
				day_full_width = 0;

				$(".days_links_block").css({opacity: "0"});
				$(".days_count").append(
					"<div class='preloader preloader_calendar'>" +
					"<div class='preloader_core'></div>" +
				  "</div>"
				);

				ajaxAdapter.request(request_url, 'GET', {}, function(response) {

					var tag_data = response.result;

					$.each(tag_data, function(key, item) {
						txt_counter[item.date] = item.counter;
					});

					while ( curent_days >= i ) {
						var myDate = dateToYMD(sel_year, sel_month, i);
						if (txt_counter[myDate] != undefined) {
							if (myDate < today_date) {
								$(".day_list[name='" + i + "']").append(" <span class='blue_count past_day_count'>" + txt_counter[myDate] + "</span>");
							} else {
								$(".day_list[name='" + i + "']").append(" <span class='blue_count'>" + txt_counter[myDate] + "</span>");
							}

						}
						i++;
					}

					if (send_date_rqs == curent_today_date) {
						cur_d_pos = $("div.day_list[name='" + day_val + "']").position();
						cur_d_marg = parseInt($("div.day_list[name='" + day_val + "']").css("padding-left"));
						cur_d_width = $("div.day_list[name='" + day_val + "']").width();
						slide_today();
					}

					$(".days_links_block div.day_list").each(function (){
						day_full_width = day_full_width + $(this).outerWidth(true);
					});

					barier_days = day_full_width - 922;

					if (curent_days < sel_day) {
						sel_day = curent_days;
					}

					var day_pos_id = $("div.day_list[name='" + sel_day + "']").position();
					var day_width_id = $("div.day_list[name='" + sel_day + "']").width();
					var day_margin_id = parseInt($("div.day_list[name='" + sel_day + "']").css("padding-left"));

					var day_minus_prev = $("div.day_list[name='" + sel_day + "']").prev(".day_list").outerWidth(true);
					var day_minus_marg = parseInt($("div.day_list[name='" + sel_day + "']").prev(".day_list").css("padding-left"));
					var day_curent_wdth_mp = day_minus_prev - day_minus_marg;

					$(".days_links_block .slide_border").css({left: day_pos_id.left + day_margin_id, width: day_width_id});
					$(".days_links_block").animate({opacity: "1"}, "200");
					$(".preloader_calendar").remove();

					if (day_pos_id.left < barier_days) {
						$(".days_links_block").css({left: - day_pos_id.left + day_curent_wdth_mp});
					} else {
						$(".days_links_block").css({left: - barier_days});
					}

				});
				getEventsByDate(send_date_rqs);
			}

			function draw_days() {
				var i = 0;


				$(".days_links_block div.day_list").remove();
				while ( curent_days > i ) {
					var myDate = dateToYMD(sel_year, sel_month, i+1);

					if (one_day < 7) {
						var name_of_day = list_of_days['val_' + one_day];
						one_day++;
						if (one_day == 7) {
							one_day = 0;
						}
					}
					i++;
					if (i == 1) {
						if (myDate == today_date) {
							$(".days_links_block").append("<div name='" + i + "' class='calendar_link padding_left_none day_list'>" + translation['today'] + "</div>");
						} else {
							if (myDate < today_date) {
								$(".days_links_block").append("<div name='" + i + "' class='calendar_link padding_left_none day_list past_day'>" + name_of_day + " " + i + "</div>");
							} else {
								$(".days_links_block").append("<div name='" + i + "' class='calendar_link padding_left_none day_list'>" + name_of_day + " " + i + "</div>");
							}
						}
					} else {
						if (myDate == today_date) {
							$(".days_links_block").append("<div name='" + i + "' class='calendar_link day_list'>" + translation['today'] + "</div>");
						} else {
							if (myDate < today_date) {
								$(".days_links_block").append("<div name='" + i + "' class='calendar_link day_list past_day'>" + name_of_day + " " + i + "</div>");
							} else {
								$(".days_links_block").append("<div name='" + i + "' class='calendar_link day_list'>" + name_of_day + " " + i + "</div>");
							}

						}
					}
				}

			}


			$(".month_select").swipe({
					swipeStatus:function(event, phase, direction, distance, duration, fingers) {
						if (phase=="start") {
							main_cords = parseInt($(this).children(".wrap_links_block").css("left"));
							second_cords = parseInt($(this).children(".days_links_block").css("left"));
						}
						if (phase!="cancel" && phase!="end" && distance > 10) {
							var div_chld = $(this).children("div");
							if (direction=="right") {
								if (div_chld.hasClass("wrap_links_block")) {
									div_chld.css("left", main_cords + distance);

									if (div_chld.css("left") > "0px") {
										div_chld.css("left", "0px");
									}
								}

								if (div_chld.hasClass("days_links_block")) {
									div_chld.css("left", second_cords + distance);

									if (div_chld.css("left") > "0px") {
										$(".days_links_block").css("left", "0px");
									}
								}
							}
							if (direction=="left") {
								/* ============================================ */
								if (div_chld.hasClass("wrap_links_block")) {
									div_chld.css("left", main_cords - distance);
									var right_now = parseInt(div_chld.css("left"));
									var moved_pos = -right_now;

									if (moved_pos > right_counter) {
										if (moved_pos > max_month_width) {
											div_chld.css("left", -max_month_width);
										}
									}
								}
								/* ============================================ */
								if (div_chld.hasClass("days_links_block")) {
									div_chld.css("left", second_cords - distance);
									var right_now = parseInt(div_chld.css("left"));
									var moved_pos = -right_now;
									var avail_width = day_full_width - 988;

									if (moved_pos > avail_width) {
										div_chld.css("left", -avail_width);
									}
								}
							}
						}
					},

					triggerOnTouchLeave:true,

					tap:function(event, target) {

						var position = $(target).position();
						var left_marg = parseInt($(target).css("padding-left"));
						var w_plank = $(target).width();
						var curent_wdth_mp = 0;
						var div_chld = $(this).children("div");
						var right_now = parseInt(div_chld.css("left"));
						var moved_pos = -right_now;

						if ($(target).is(":not(:first-child)")) {
							var minus_prev = $(target).prev(".calendar_link").outerWidth(true);
							var minus_marg = parseInt($(target).prev(".calendar_link").css("padding-left"));
							curent_wdth_mp = minus_prev - minus_marg;
						}

						/* =========================================================================== */
						if ($(target).hasClass("year_list")) {

							/* ========== MAKE REQUEST ========== */
							if ($(target).children("span").length > 0 ) {
								sel_year = $(target).children("span.year_count").attr("name");
							} else {
								sel_year = year_value;
							}
							sel_month = $(target).attr("name");

							var changed_weak = new Date(sel_year, sel_month, 0);
							var changed_day = new Date(sel_year, sel_month - 1, 1);

							curent_days = changed_weak.getDate();
							one_day = changed_day.getDay();

							send_date_rqs = dateToYMD(sel_year, sel_month, sel_day);
							getEventsByDate(send_date_rqs);
							disableToday();
							/* ========== MAKE REQUEST ========== */

							draw_days();
							make_counter();

							if (position.left < barier_width) {
								$(target).parents("div.wrap_links_block").animate({left: - position.left + curent_wdth_mp}, "medium");
							} else {
								$(target).parents("div.wrap_links_block").animate({left: - barier_width}, "medium");
							}

							if ($(target).children("span").length > 0) {
								var cur_year_select = $(target).children("span.year_count").attr("name");
								var select_yrt = $(".center_block").find(".jq-selectbox__select-text");
								select_yrt.text(cur_year_select);
							} else {
								today_year_sel();
							}

						}

						/* =========================================================================== */
						if ($(target).hasClass("day_list")) {

							sel_day = $(target).attr("name");
							send_date_rqs = dateToYMD(sel_year, sel_month, sel_day);
							getEventsByDate(send_date_rqs);
							disableToday();
							if (position.left < barier_days) {
								$(target).parents("div.days_links_block").animate({left: - position.left + curent_wdth_mp}, "medium");
							} else {
								$(target).parents("div.days_links_block").animate({left: - barier_days}, "medium");
							}
						}

						$(target).siblings(".slide_border").animate({left: position.left + left_marg, width: w_plank}, "fast");

					}

				});

			function past_year(div_chld, past_count){
				var past_cut = past_count - 2000;
				div_chld.prepend(
					"<div name='1' class='calendar_link year_list past_end_link'>"+ translation['january'] + " <span name='" + past_count + "' class='year_count'>" + "\'" + past_cut + "</span></div>" +
						"<div name='2' class='calendar_link year_list past_end_link'>"+ translation['february'] + " <span name='" + past_count + "' class='year_count'>" + "\'" + past_cut + "</span></div>" +
						"<div name='3' class='calendar_link year_list past_end_link'>"+ translation['march'] + " <span name='" + past_count + "' class='year_count'>" + "\'" + past_cut + "</span></div>" +
						"<div name='4' class='calendar_link year_list past_end_link'>"+ translation['april'] + " <span name='" + past_count + "' class='year_count'>" + "\'" + past_cut + "</span></div>" +
						"<div name='5' class='calendar_link year_list past_end_link'>"+ translation['may'] + " <span name='" + past_count + "' class='year_count'>" + "\'" + past_cut + "</span></div>" +
						"<div name='6' class='calendar_link year_list past_end_link'>"+ translation['june'] + " <span name='" + past_count + "' class='year_count'>" + "\'" + past_cut + "</span></div>" +
						"<div name='7' class='calendar_link year_list past_end_link'>"+ translation['july'] + " <span name='" + past_count + "' class='year_count'>" + "\'" + past_cut + "</span></div>" +
						"<div name='8' class='calendar_link year_list past_end_link'>"+ translation['august'] + " <span name='" + past_count + "' class='year_count'>" + "\'" + past_cut + "</span></div>" +
						"<div name='9' class='calendar_link year_list past_end_link'>"+ translation['september'] + " <span name='" + past_count + "' class='year_count'>" + "\'" + past_cut + "</span></div>" +
						"<div name='10' class='calendar_link year_list past_end_link'>"+ translation['october'] + " <span name='" + past_count + "' class='year_count'>" + "\'" + past_cut + "</span></div>" +
						"<div name='11' class='calendar_link year_list past_end_link'>"+ translation['november'] + " <span name='" + past_count + "' class='year_count'>" + "\'" + past_cut + "</span></div>" +
						"<div name='12' class='calendar_link year_list past_end_link'>"+ translation['december'] + " <span name='" + past_count + "' class='year_count'>" + "\'" + past_cut + "</span></div>"
				);
			}

			function next_year(div_chld, future_count){
				var future_cut = future_count - 2000;
				div_chld.children(".year_list:last").after(
					"<div name='1' class='calendar_link year_list past_end_link'>"+ translation['january'] + " <span name='" + future_count + "' class='year_count'>" + "\'" + future_cut + "</span></div>" +
						"<div name='2' class='calendar_link year_list past_end_link'>"+ translation['february'] + " <span name='" + future_count + "' class='year_count'>" + "\'" + future_cut + "</span></div>" +
						"<div name='3' class='calendar_link year_list past_end_link'>"+ translation['march'] + " <span name='" + future_count + "' class='year_count'>" + "\'" + future_cut + "</span></div>" +
						"<div name='4' class='calendar_link year_list past_end_link'>"+ translation['april'] + " <span name='" + future_count + "' class='year_count'>" + "\'" + future_cut + "</span></div>" +
						"<div name='5' class='calendar_link year_list past_end_link'>"+ translation['may'] + " <span name='" + future_count + "' class='year_count'>" + "\'" + future_cut + "</span></div>" +
						"<div name='6' class='calendar_link year_list past_end_link'>"+ translation['june'] + " <span name='" + future_count + "' class='year_count'>" + "\'" + future_cut + "</span></div>" +
						"<div name='7' class='calendar_link year_list past_end_link'>"+ translation['july'] + " <span name='" + future_count + "' class='year_count'>" + "\'" + future_cut + "</span></div>" +
						"<div name='8' class='calendar_link year_list past_end_link'>"+ translation['august'] + " <span name='" + future_count + "' class='year_count'>" + "\'" + future_cut + "</span></div>" +
						"<div name='9' class='calendar_link year_list past_end_link'>"+ translation['january'] + " <span name='" + future_count + "' class='year_count'>" + "\'" + future_cut + "</span></div>" +
						"<div name='10' class='calendar_link year_list past_end_link'>"+ translation['september'] + " <span name='" + future_count + "' class='year_count'>" + "\'" + future_cut + "</span></div>" +
						"<div name='11' class='calendar_link year_list past_end_link'>"+ translation['november'] + " <span name='" + future_count + "' class='year_count'>" + "\'" + future_cut + "</span></div>" +
						"<div name='12' class='calendar_link year_list past_end_link'>"+ translation['december'] + " <span name='" + future_count + "' class='year_count'>" + "\'" + future_cut + "</span></div>"
				);
			}

			return this;
		},

		onload: null,

		destroy: function(){
			//todo deinit
		}
	}

});