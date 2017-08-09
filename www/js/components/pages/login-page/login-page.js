define([
	'knockout',
	'text!components/pages/login-page/login-page.html',
	'LoginViewModel',
	'application',
	'ajaxAdapter',
	'cookieStoreManager',
	'UserModel',
	'LanguagesModel',
	'renderTabsBindingHandlers',
	'site_effects'
], function (
	ko,
	template,
	LoginViewModel,
	application,
	ajaxAdapter,
	cookieStoreManager,
	UserModel,
	LanguagesModel
) {

	"use strict";

	var translation = application.translation;
	var translationJSON = application.translationJSON;

	var messagesErrors = {
		selectCountry: translation.selectCountry,
		selectCity: translation.selectCity,
		selectOrganization: translation.selectOrganization,
		invalidLoginOrPass: translation.invalidLoginOrPass,
		fieldIsEmpty: translation.fieldIsEmpty,
		invalidEmail: translation.invalidEmail
	};

	function Component(params) {
		this.afterRender(params.route().modeName, params.route().code);

		setTimeout(function(){
			$('input[type=text], select').styler(); // TODO select control

			$(".med_select").change(function(){
				var selectedLanguage = $(this).find(':selected').val();
				application.USER_DATA.userLanguage = selectedLanguage;
				cookieStoreManager.setLanguage(selectedLanguage);
				application.restart(); // TODO select control
			});

		}, 0)

	}

	Component.prototype = {
		constructor: Component,

		afterRender: function(pageName, code){
			var app = application.root();

			app.loginViewModel(new LoginViewModel());
			app.languages(new LanguagesModel);
			app.user = new UserModel(); //todo for what it is there?

			if (pageName){

				if (pageName === 'after_change_email'){
					app.loginViewModel().loginStep('after_change_email');
				}
				if (pageName === 'after_rememer_password'){
					app.loginViewModel().loginStep('after_rememer_password');
				}
				if (pageName === 'after_activation'){
					app.loginViewModel().loginStep('after_activation');

					var $elem = $(".restore_pass_counter");
					var timer = parseInt($elem.text(), 10); //seconds

					setInterval(function timerFunc() {
						timer--;
						$elem.text(timer);

						if (timer <= 0) {
							application.router.redirectToGeneralPage();
						}
					}, 1000);
				}
			} else {
				app.loginViewModel().loginStep('general');
			}

			var filter  = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,6})+$/;
			var count_id_log = $(".reg_country");
			var city_id_log = $(".reg_city");
			var org_id_log = $(".reg_organization");
			var pos_id_log = $(".reg_position");


			$(".main_menu div.sub_menu_item").click(function (){
				$(".menu_switcher div.menu_step_blck").find(".regiser_step:first").show().next(".regiser_step").hide();
				$("input.regular_input").each(function (i) {
					var this_inpt = $(this);

					this_inpt.removeAttr("title");
					hide_error(this_inpt);
				});
			});

			$(document).click( function(event){
				if( $(event.target).closest(".regular_input, .blue_arrow_bm").length )
					return;
				$(".country_list").animate({opacity: "hide"}, 100);
				$(".regular_input").removeClass("selecor_active");
				event.stopPropagation();
			});

			count_id_log.blur(function (){
				if ($(this).val() == "") {
					city_id_log.addClass("dis_sep_input").val("");
					org_id_log.addClass("dis_sep_input").val("");
					pos_id_log.addClass("dis_sep_input").val("");
					$('#city_ls').animate({opacity: "hide"}, 100);
					$('#position_ls').animate({opacity: "hide"}, 100);
					$('#organization_ls').animate({opacity: "hide"}, 100);
				}
			});

			city_id_log.blur(function (){
				if ($(this).val() == "") {
					org_id_log.addClass("dis_sep_input").val("");
					pos_id_log.addClass("dis_sep_input").val("");
					$('#organization_ls').animate({opacity: "hide"}, 100);
					$('#position_ls').animate({opacity: "hide"}, 100);
				}
			});

			org_id_log.blur(function (){
				if ($(this).val() == "") {
					pos_id_log.addClass("dis_sep_input").val("");
					$('#position_ls').animate({opacity: "hide"}, 100);
				}
			});

			count_id_log.on("click", function (){
				getCountryList();
			}).next().next(".blue_arrow_bm").on("click", function (){
				getCountryList();
			});

			city_id_log.on("click", function (){
				getCityList()
			}).next().next(".blue_arrow_bm").on("click", function (){
				getCityList()
			});

			org_id_log.on("click", function (){
				getOrganizationList();
			}).next().next(".blue_arrow_bm").on("click", function (){
				getOrganizationList();
			});

			pos_id_log.on("click", function (){
				getPostitionList();
			}).next().next(".blue_arrow_bm").on("click", function (){
				getPostitionList();
			});

			/* ================================================================== */
			function getCountryList() {
				count_id_log.addClass("selecor_active");
				ajaxAdapter.getRequestRestApi('/countryCatalog', function(data) {
					var key, title;

					$('#country_ls span').remove();
					for (var i=0; i<data.result.length; i++) {

						key = data.result[i].key;
						title = translationJSON ? translationJSON[data.result[i].title] : data.result[i].title;

						$('#country_ls').append('<span class="span_list" id="' + key + '">' + title + '</span>');
					}

					$('#country_ls').animate({opacity: "show"}, 300);
					//success:
					$('#country_ls span').click(function (){
						var countr_key = $(this).attr("id");
						var countr_val = $(this).html();
						var this_inpt = count_id_log;
						var max = 20;
						if (countr_val.length < max) {
							var value_paste = countr_val.substring(0,max);
						} else {
							var value_paste = countr_val.substring(0,max)+'...';
						}

						clear_first();
						$('#country_ls').animate({opacity: "hide"}, 100);
						count_id_log.attr("id", countr_key).val(value_paste).removeClass("selecor_active");
						$(".country_hidden").val(countr_key);
						city_id_log.removeAttr('title').removeClass("dis_sep_input");
						hide_error(city_id_log);
						hide_error(this_inpt);
					});
				});
			}

			/* ================================================================== */
			function getCityList() {
				if (city_id_log.hasClass("dis_sep_input")) {
					var this_inpt = city_id_log;

					this_inpt.attr("title", messagesErrors.selectCountry);
					show_error(this_inpt);
				} else {
					city_id_log.addClass("selecor_active");

					var count_key = $('.reg_country').attr("id");
					var post_url = "/countryCatalog/" + count_key + "/city"

					ajaxAdapter.getRequestRestApi(post_url, function(data) {
						var key, title;

						$('#city_ls span').remove();
						for (var i=0; i<data.result.length; i++) {

							key = data.result[i].key;
							title = translationJSON ? translationJSON[data.result[i].title] : data.result[i].title;

							$('#city_ls').append('<span class="span_list" id="' + key + '">' + title + '</span>');
						}
						//success:
						$('#city_ls').animate({opacity: "show"}, 300);
						$('#city_ls span').click(function (){
							var countr_key = $(this).attr("id");
							var countr_val = $(this).html();
							var this_inpt = city_id_log;
							var max = 20;
							if (countr_val.length < max) {
								var value_paste = countr_val.substring(0,max);
							} else {
								var value_paste = countr_val.substring(0,max)+'...';
							}

							clear_second();
							$('#city_ls').animate({opacity: "hide"}, 100);
							city_id_log.attr("id", countr_key).val(value_paste).removeClass("selecor_active");
							$(".city_hidden").val(countr_key);
							org_id_log.removeAttr('title').removeClass("dis_sep_input");
							hide_error(org_id_log);
							hide_error(this_inpt);
						});
					});
				}
			}

			/* ================================================================== */
			function getOrganizationList() {
				if (org_id_log.hasClass("dis_sep_input")) {
					var this_inpt = org_id_log;

					this_inpt.attr("title", messagesErrors.selectCity);
					show_error(this_inpt);
				} else {
					org_id_log.addClass("selecor_active");

					var city_key = $('.reg_country').attr("id");
					var count_key = $('.reg_city').attr("id");
					var post_url = "/countryCatalog/" + city_key + "/city/" + count_key + "/organization"

					ajaxAdapter.getRequestRestApi(post_url, function(data) {
						var key, title;

						$('#organization_ls span').remove();
						for (var i=0; i<data.result.length; i++) {

							key = data.result[i].key;
							title = translationJSON ? translationJSON[data.result[i].title] : data.result[i].title;

							$('#organization_ls').append('<span class="span_list" id="' + key + '">' + title + '</span>');
						}
						//success:
						$('#organization_ls').animate({opacity: "show"}, 300);
						$('#organization_ls span').click(function (){
							var countr_key = $(this).attr("id");
							var countr_val = $(this).html();
							var this_inpt = org_id_log;
							var max = 20;
							if (countr_val.length < max) {
								var value_paste = countr_val.substring(0,max);
							} else {
								var value_paste = countr_val.substring(0,max)+'...';
							}

							clear_third();
							$('#organization_ls').animate({opacity: "hide"}, 100);
							org_id_log.attr("id", countr_key).val(value_paste).removeClass("selecor_active");
							$(".organization_hidden").val(countr_key);
							pos_id_log.removeAttr('title').removeClass("dis_sep_input");
							hide_error(pos_id_log);
							hide_error(this_inpt);
						});
					});

				}
			}

			/* ================================================================== */
			function getPostitionList() {
				if (pos_id_log.hasClass("dis_sep_input")) {
					var this_inpt = pos_id_log;

					this_inpt.attr("title", messagesErrors.selectOrganization);
					show_error(this_inpt);
				} else {
					pos_id_log.addClass("selecor_active");

					var country_key = $('.reg_country').attr("id");
					var city_key = $('.reg_city').attr("id");
					var count_key = $('.reg_organization').attr("id");
					var post_url = "/countryCatalog/" + country_key + "/city/" + city_key + "/organization/" + count_key + "/position"

					ajaxAdapter.getRequestRestApi(post_url, function(data) {
						var key, title;

						$('#position_ls span').remove();
						for (var i=0; i<data.result.length; i++) {

							key = data.result[i].key;
							title = translationJSON ? translationJSON[data.result[i].title] : data.result[i].title;

							$('#position_ls').append('<span class="span_list" id="' + key + '">' + title + '</span>');
						}
						//success:
						$('#position_ls').animate({opacity: "show"}, 300);
						$('#position_ls span').click(function (){
							var countr_key = $(this).attr("id");
							var countr_val = $(this).html();
							var this_inpt = pos_id_log;
							var max = 20;
							if (countr_val.length < max) {
								var value_paste = countr_val.substring(0,max);
							} else {
								var value_paste = countr_val.substring(0,max)+'...';
							}

							$('#position_ls').animate({opacity: "hide"}, 100);
							pos_id_log.attr("id", countr_key).val(value_paste).removeClass("selecor_active");
							$(".position_hidden").val(countr_key);
							hide_error(this_inpt);
						});
					});
				}
			}


			$("#log_in").click(function (){
				var cur_btn = $(this);
				log_in_request(cur_btn);
			});

			$("#register_user").click(function (){
				var cur_btn = $(this);
				register_request(cur_btn);
			});

			$("#restore_password").click(function (){
				var cur_btn = $(this);
				restore_request(cur_btn);
			});

			$("#finish_restore_password").click(function (){
				var cur_btn = $(this);
				finish_restore_request(cur_btn);
			});


			var choseTrig = true;


			$(document).keypress(function(e) {
				if (e.keyCode == 40 || e.keyCode == 39 || e.keyCode == 38 || e.keyCode == 37) {
					choseTrig = false;
				}

				if(e.keyCode == 13) {
					if (choseTrig == true) {
						if ($("#log_in_form").is(":visible")) {
							var cur_btn = $("#log_in");
							log_in_request(cur_btn);
						}
						if ($("#finish_restore_form").is(":visible")) {
							var cur_btn = $("#finish_restore_password");
							finish_restore_request(cur_btn);
						}
						if ($("#register_form").is(":visible")) {
							var cur_btn = $("#register_user");
							register_request(cur_btn);
						}
						if ($("#restore_form").is(":visible")) {
							var cur_btn = $("#restore_password");
							restore_request(cur_btn);
						}
					}
					choseTrig = true;
				}

			});

			function clear_first() {
				city_id_log.val("");
				org_id_log.addClass("dis_sep_input").val("");
				pos_id_log.addClass("dis_sep_input").val("");
				$(".city_hidden").val("");
				$(".organization_hidden").val("");
				$(".position_hidden").val("");
			}

			function clear_second() {
				org_id_log.val("");
				pos_id_log.addClass("dis_sep_input").val("");
				$(".organization_hidden").val("");
				$(".position_hidden").val("");
			}

			function clear_third() {
				pos_id_log.val("");
				$(".position_hidden").val("");
			}

			city_id_log.blur(function (){
				if ($(this).val() == "") {
					org_id_log.addClass("dis_sep_input").val("");
					pos_id_log.addClass("dis_sep_input").val("");
					$('#organization_ls').animate({opacity: "hide"}, 100);
					$('#position_ls').animate({opacity: "hide"}, 100);
				}
			});

			org_id_log.blur(function (){
				if ($(this).val() == "") {
					pos_id_log.addClass("dis_sep_input").val("");
					$('#position_ls').animate({opacity: "hide"}, 100);
				}
			});


			function log_in_request(cur_btn) {
				var data_send = $("#log_in_form").serialize();
				var log_in_email = $('.log_in_email');
				var log_in_pass = $('.password_in_email');

				cur_btn.attr("disabled", true).addClass("send_request disabled_btn");
				$.ajax({
					type: "POST",
					url: "/user/auth/ajax" + "?lang=" + cookieStoreManager.getLanguage(),
					data: data_send,
					success: function(data){

						if (data.status == 'error') {
							cur_btn.attr("disabled", false).removeClass("send_request disabled_btn");
							if (data.fields.email == messagesErrors.invalidLoginOrPass) {
								log_in_email.attr("title", data.fields.email);
								log_in_pass.addClass("error_inpt");
								log_in_pass.next().next(".err_note_img").removeClass("valid").addClass("not_valid").animate({opacity: "show"}, 300);
							} else {
								log_in_email.attr("title", data.fields.email);
								log_in_pass.attr("title", data.fields.password);
							}
							check_errors();
						} else {
							$("#log_in_form").submit();
							nextStep();
						}
					},
					error: function(){
						cur_btn.attr("disabled", false).removeClass("send_request disabled_btn");
					}
				});
			}

			function finish_restore_request(cur_btn) {
				var data_send = $("#finish_restore_form").serialize();
				var finish_btn = $("#finish_restore_password");

				cur_btn.attr("disabled", true).addClass("send_request disabled_btn");
				$.ajax({
					type: "POST",
					url: "/module/user/restorePassword/changePassword/confirm_code/" + code + "/" + "?lang=" + cookieStoreManager.getLanguage(),
					data: data_send,
					success: function(data){
						finish_btn.attr("disabled", false).removeClass("send_request disabled_btn");

						if (data.status == 'error') {
							$('.reg_password').attr("title", data.fields.password);
							$('.reg_confirmPassword').attr("title", data.fields.confirmPassword);
							check_errors();
						} else {
							$(".regiser_step:visible").hide().next().animate({opacity: "show"}, 300);
							var clear_timerFunc;

							clear_timerFunc = setInterval(function timerFunc() {
								var ss = $(".restore_pass_counter").text();

								ss--;
								$('.restore_pass_counter').text(ss);

								if (ss <= 0) {
									clearInterval(clear_timerFunc);
									window.location.replace('/');
								}
							}, 1000);
						}
					},
					error: function(){
						finish_btn.attr("disabled", false).removeClass("send_request disabled_btn");
					}
				});
			}

			function register_request(cur_btn) {
				var data_send = $("#register_form").serialize();
				var user_r_lname = $('.reg_lname').val();
				var user_r_fname = $('.reg_fname').val();
				var user_r_email = $('.reg_email').val();
				var reg_btn = $("#register_user");

				cur_btn.attr("disabled", false).removeClass("send_request disabled_btn");
				$.ajax({
					type: "POST",
					url: "/module/user/register/ajax" + "?lang=" + cookieStoreManager.getLanguage(),
					data: data_send,
					success: function(data){
						reg_btn.attr("disabled", false).removeClass("send_request disabled_btn");

						if (data.status == 'error') {
							$('.reg_fname').attr("title", data.fields.family);
							$('.reg_lname').attr("title", data.fields.name);
							$('.reg_mname').attr("title", data.fields.patronymic);
							$('.reg_country').attr("title", data.fields.country_id);
							$('.reg_city').attr("title", data.fields.city_id);
							$('.reg_organization').attr("title", data.fields.organization_id);
							$('.reg_position').attr("title", data.fields.position);
							$('.reg_email').attr("title", data.fields.email);
							$('.reg_password').attr("title", data.fields.password);
							$('.reg_confirmPassword').attr("title", data.fields.confirmPassword);
							check_errors();
						} else {
							//window.location = '/';
							$(".regiser_step:visible").hide().next().animate({opacity: "show"}, "300");
						}
					},
					error: function(){
						reg_btn.attr("disabled", false).removeClass("send_request disabled_btn");
					}
				});
			}

			function restore_request(cur_btn) {
				var data_send = $("#restore_form").serialize();
				var restore_mail = $('.restore_email');

				var inputV = restore_mail.val();
				var res_btn = $("#restore_password");

				if (restore_mail.val() == "") {
					restore_mail.attr("title", messagesErrors.fieldIsEmpty);
					show_error(restore_mail);
				} else {
					if (filter.test(inputV)) {
						cur_btn.attr("disabled", false).removeClass("send_request disabled_btn");
						$.ajax({
							type: "POST",
							url: "/module/user/restorePassword/resetRequest" + "?lang=" + cookieStoreManager.getLanguage(),
							data: data_send,
							success: function(data){
								res_btn.attr("disabled", false).removeClass("send_request disabled_btn");
								if (data.status == 'error') {
									restore_mail.attr("title", data.fields.email);
									check_errors();
								} else {
									$(".regiser_step:visible").hide().next().animate({opacity: "show"}, 300);
								}
							},
							error: function(){
								res_btn.attr("disabled", false).removeClass("send_request disabled_btn");
							}
						});
					} else {
						restore_mail.attr("title", messagesErrors.invalidEmail);
						show_error(restore_mail);
					}
				}

			}

			function check_errors() {
				$(".regular_input:visible").each(function (){
					var this_inpt = $(this);
					if ($(this).hasAttr("title")) {
						show_error(this_inpt);
					}
				});
			}

			$('.email_inp').blur(function (){
				var inputV = $(this).val();
				var nameLngth = $(this).val().length;
				var this_inpt = $(this);
				if (nameLngth >= 1) {
					if (filter.test(inputV)) {
						hide_error(this_inpt);
					} else {
						$(this).attr("title", messagesErrors.invalidEmail);
						show_error(this_inpt);
					}
				} else {
					hide_error(this_inpt);
					this_inpt.next().next(".err_note_img").hide();
				}

			});

			$('.log_in_request').click(function(){
				var nameLngth = $(".log_pass_in:visible").val();
				var this_pass = $(".log_pass_in:visible");
				if (nameLngth == ""){
					this_pass.attr("title", messagesErrors.fieldIsEmpty);
					show_error(this_pass);
				} else {
					hide_error(this_pass);
				}
			});

			$('.simple_field').keyup(function (){
				var nameLngth = $(this).val().length;
				var this_inpt = $(this);
				if (nameLngth >= 1){
					hide_error(this_inpt);
				} else {
					this_inpt.next().next(".err_note_img").animate({opacity: "hide"}, 100);
				}
			});

			function show_error(this_inpt) {
				var tit_value = this_inpt.attr("title");
				this_inpt.addClass("error_inpt");
				this_inpt.next(".error_field").children("span.error_txt_span").text(tit_value);

				var marg_left_b = this_inpt.next(".error_field").width() / 2 + 11;
				this_inpt.next(".error_field").animate({opacity: "show"}, 300);
				this_inpt.next(".error_field").css("margin-right", -marg_left_b);
				this_inpt.next().next(".err_note_img").addClass("not_valid").animate({opacity: "show"}, 300);
			}

			function hide_error(this_inpt) {
				this_inpt.removeAttr("title");
				this_inpt.removeClass("error_inpt");
				this_inpt.next(".error_field").animate({opacity: "hide"}, 100);
				this_inpt.next().next(".err_note_img").removeClass("not_valid").animate({opacity: "show"}, 300);
			}
		},

		dispose: function(){

		}
	};

	return { viewModel: Component, template: template }
});