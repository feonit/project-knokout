var curtainOn = false;
var delayTimer = false;


function popUpScrollFix(element) {
  var scrollSpace = parseInt($(".scroll_catcher").css("padding-left"));

  element.css({"padding-left": scrollSpace});
}

function popUpWindowResize() {
  if (delayTimer) {
		return '';
	} else {
		delayTimer = true;
		setTimeout(function(){
      var popUp = $(".popUp_Window:visible");
      var popUp_Height = popUp.children("div:first").outerHeight();
      var window_size = $(window).height();

      if (popUp_Height > window_size) {
        popUp.addClass("popUp_scroll_mode");
      } else if (popUp_Height < window_size) {
        popUp.removeClass("popUp_scroll_mode");
      }
      delayTimer = false;
    }, 200);
    return true;

	}
}


function positionTop() {
  var halfWidth = (($(window).outerWidth() - 960) / 2) + 1002;
  $(".go_topbtn").css({"left": halfWidth});
  $(".report_bug").css({"right": halfWidth});
}


function nextStep() {
  $(".regiser_step:visible").hide().next().animate({opacity: "show"}, "300");
}

$(document).ready(function(){
    $.fn.hasAttr = function(name) {
      return this.attr(name) !== undefined;
    };

    $(".next_view").click(function(){
      nextStep();
    });
    positionTop();

    $(window).resize(function() {
      positionTop();
      popUpWindowResize();
    });

	$("body").on("click", "#switch_collapse", function() {
		$(this).toggleClass("minimize_response");
		$(this).parents(".grouped_items").next().slideToggle("fast");
	});




	//*********************** SWIPE SCRIPT ***********************//

	function link_move(this_obj) {
	  var swipe_link = this_obj.next(".menu_switcher").children(".menu_step_blck:visible").index();
	  var swipe_pos = this_obj.children().eq(swipe_link).position();
	  var swipe_width = this_obj.children().eq(swipe_link).width();
	  var swipe_margin = parseInt(this_obj.children().eq(swipe_link).css("margin-left"));

	  this_obj.children(".slide_border").animate({left: swipe_pos.left + swipe_margin, width: swipe_width}, "fast");
	}

	function check_link(this_obj) {
	  var vis_blck = this_obj.next(".menu_switcher");

	  if (vis_blck.find(".slide_border:visible").width() == 0 ) {
	    var hidden_w = vis_blck.children(".menu_step_blck:visible").children(".main_menu").children("div:first").width();

	    vis_blck.find(".slide_border:visible").css("width", hidden_w);
	  }
	}

	function link_all(this_obj) {
	  var swipe_link = this_obj.children(".menu_step_blck:visible").index();
	  var swipe_pos = this_obj.prev(".main_menu").children().eq(swipe_link).position();
	  var swipe_width = this_obj.prev(".main_menu").children().eq(swipe_link).width();
	  var swipe_margin = parseInt(this_obj.prev(".main_menu").children().eq(swipe_link).css("margin-left"));

	  this_obj.prev(".main_menu").children(".slide_border").animate({left: swipe_pos.left + swipe_margin, width: swipe_width}, "fast");
	}

	$(".profile_block").hover(function() {
	    $(".add_down_field").css("opacity", "0");
	}, function() {
	    $(".add_down_field").removeAttr("style");
	});

});



//todo
function closeAllCurtain() {
  curtainOn = false;
  var curtain = $(".up_curtain");
  var header_line = $(".header_line");

  $(".curtain_controller a").removeClass("delete_btn btns_red");
  curtain.children("div:visible").animate({opacity: "hide"}, 300, function() {
    curtain.slideUp("medium");
  });

}