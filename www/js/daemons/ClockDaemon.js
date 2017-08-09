// define forEach method
define(['knockout'], function(ko){
	return ( function(){

		function ClockDaemon(){
			var that = this,
				SYSTEM_SYNC = 1000 * 60 * 60,  // every hour may be
				timerUpdateInternalTime, timerSyncWithSystemTime, startPoint;

			this.date = ko.observable();
			this.minutesPerHour = ko.observable();
			this.minutesPerDay = ko.observable();
			this.dayOfMonth = ko.observable();

			function setSystemTime(){
				that.date = ko.observable(new Date());
				that.minutesPerHour(that.date().getMinutes());
				that.minutesPerDay(that.date().getHours() * 60 + that.date().getMinutes());
				that.dayOfMonth(that.date().getDate());
			}

			function runAutoUpdateClock(){
				if (timerUpdateInternalTime){
					clearInterval(timerUpdateInternalTime);
				}

				timerUpdateInternalTime = setInterval(function(){
					setSystemTime();
				}, 1000 * 60)
			}

			function restartClock(){
				setSystemTime();
				runAutoUpdateClock();
			}

			setSystemTime();

			// removal the difference in seconds
			// and periodic synchronization with the system time
			var differenceInSeconds = 60 - this.date().getSeconds();

			startPoint = setTimeout(function(){
				restartClock();
				timerSyncWithSystemTime = setInterval(restartClock, SYSTEM_SYNC)
			}, differenceInSeconds * 1000);

			window.clockDaemon = this;

			this.destroy = function(){
				var property;

				clearTimeout(startPoint);
				clearInterval(timerSyncWithSystemTime);
				clearInterval(timerUpdateInternalTime);

				for (property in this){
					var param = this[property]._subscriptions;

					if (param && param['change']) {
						param['change'].forEach(function(sub){
							sub.dispose();
						});
					}
				}

				//window.clockDaemon = null;
			}
		}

		return ClockDaemon;
	})()
});