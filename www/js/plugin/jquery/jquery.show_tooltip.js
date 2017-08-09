define(['jquery'], function($){

    "use strict";

    $.fn.showError = function(text) {
        if (text != "") {
            this.addClass('error_inpt');
            this.parent(".input_field").append(
                "<div class='error_field'>" +
                "<span class='arrow_err'></span>" +
                "<span class='error_txt_span'>" + text + "</span>" +
                "</div>"
            );
            this.parent(".input_field").append(
                "<div class='err_note_img not_valid'></div>"
            );

            var marg_left_b = this.parent(".input_field").children(".error_field").width() / 2 + 11;

            this.parent(".input_field").children(".error_field").animate({opacity: "show"}, "300");
            this.parent(".input_field").children(".error_field").css("margin-right", -marg_left_b);
            this.parent(".input_field").children(".err_note_img").animate({opacity: "show"}, "300");
        } else {
            this.removeClass('error_inpt');
            this.parent(".input_field").children("div.error_field").remove();
            this.parent(".input_field").children("div.err_note_img").remove();
        }
    };
});