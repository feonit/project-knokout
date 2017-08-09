define([
	'knockout',
	'application'
], function(
	ko,
	application
){
	function TimeModel(currentTime, parent) {
		var self = this;
		this.time = ko.observable(currentTime).extend({
			validate: {
				rules: [
					{
						type: "required",
						message: application.translation.fieldIsEmpty
					}
				]
			}
		});

		this.message = ko.observable('').extend({
			validate: {
				rules: [
					{
						type: "required",
						message: application.translation.fieldIsEmpty
					}
				]
			}
		});
		this.formattedTime = ko.computed({
			read: function () {
				return parent.convertCountOfMinutesToHHMMFn(self.time());
			},
			write: function (value) {
				this.time(parent.convertHHMMtoCountOfMinutesFn(value));
			},
			owner: this
		});
	}
	return TimeModel;
});