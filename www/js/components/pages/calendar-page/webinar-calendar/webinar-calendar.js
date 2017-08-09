define([
	'knockout',
	'application',
	'text!components/pages/calendar-page/webinar-calendar/webinar-calendar.html'
], function(
	ko,
	application,
	template
){

	var firstArrayItem;
	var checkLenght;
	var startPosition;
	var drawStep;
	var prevEnd;
	var saveMaxElement = "line_0";
	var findLastOverflow = false;
	var savedOverflowStartTime;
	var savedOverflowItem;
	var curentMaxConflict;

	//todo calendar
	function destroy(){
		firstArrayItem = undefined;
		checkLenght = undefined;
		startPosition = undefined;
		drawStep = undefined;
		prevEnd = undefined;
		saveMaxElement = undefined;
		findLastOverflow = false;
		savedOverflowStartTime = undefined;
		savedOverflowItem = undefined;
		curentMaxConflict = undefined;
	}

	function CalendarWebinarComponent(params) {

		window.API_calendarWebinarComponent = this;

		this.destroy = destroy;

		if (firstArrayItem === undefined){
			firstArrayItem = application.root().calendar().items()[0];
			checkLenght = firstArrayItem.startTime()>firstArrayItem.endTime()?1440:(1440-firstArrayItem.startTime());
			startPosition = firstArrayItem.startTime()>firstArrayItem.endTime()?0:firstArrayItem.startTime();

			drawStep = 860 / checkLenght;
			curentMaxConflict = firstArrayItem.endTime();
			saveMaxElement = "line_0";
//					prevEnd;
//					findLastOverflow = false;
//					savedOverflowStartTime;
//					savedOverflowItem;
		}
//common
		var arrayData = params.value,
			i = params.index();

		var checkLastItem = arrayData.startTime()>arrayData.endTime()?1440-arrayData.startTime():0;
		var firstPosition = Math.round((arrayData.startTime() - startPosition) * drawStep);
		var webinarTime = Math.round(checkLastItem==0?arrayData.duration() * drawStep:checkLastItem * drawStep);
//				this.getHigherDiference = arrayData.endTime() > curentMaxConflict
//					? curentMaxConflict-arrayData.startTime() * drawStep
//					: 0;
		var getHigherDiference = arrayData.endTime()>curentMaxConflict?(curentMaxConflict-arrayData.startTime())*drawStep:0;

		if (getHigherDiference !== 0) {
			$("#" + saveMaxElement).append(
				"<div class='overtime_line right_over' style='width:" + getHigherDiference + "px;'></div>"
			);
		}

		saveMaxElement = checkLastItem==0?(arrayData.endTime()>curentMaxConflict?"line_"+i:saveMaxElement):"line_"+i;
		curentMaxConflict = checkLastItem==0?(arrayData.endTime()>curentMaxConflict?arrayData.endTime():curentMaxConflict):1440;
		if (findLastOverflow == false && curentMaxConflict==1440) {
			findLastOverflow = true;
			savedOverflowItem = "line_"+i;
			savedOverflowStartTime = arrayData.startTime();
		}

		var n = i + 1;
		var leftOvertime = 0;
		var rightOvertime = 0;
		var checkDiference = arrayData.endTime()<curentMaxConflict?(curentMaxConflict-arrayData.endTime())*drawStep:0;
		var getCurentWidth = checkDiference==0?0:((curentMaxConflict-arrayData.startTime())*drawStep) - checkDiference;
		var getOverPosition = curentMaxConflict==1440?(arrayData.startTime()-savedOverflowStartTime)*drawStep:0;
		var lineClass = arrayData.status()=="CLOSED"?"web_success":(arrayData.status() == "PLANNED"?"web_wait":"web_online");

		if (typeof(prevEnd) != 'undefined') {
			leftOvertime = (prevEnd - arrayData.startTime()) * drawStep;
		}
		if (n < application.root().calendar().items().length) {
			rightOvertime = (arrayData.endTime() - application.root().calendar().items()[n].startTime()) * drawStep;
		}

		this.firstPosition = firstPosition;
		this.webinarTime = webinarTime;
		this.getHigherDiference = getHigherDiference;
		this.leftOvertime = leftOvertime;
		this.rightOvertime = rightOvertime;
		this.index = i;
		this.checkDiference = checkDiference;
		this.getCurentWidth = getCurentWidth;
		this.getOverPosition = getOverPosition;

		this.leftOvertime = this.leftOvertime + 'px';
		this.rightOvertime = this.rightOvertime + 'px';
		this.firstPosition = this.firstPosition + 'px';
		this.webinarTime = this.webinarTime + 'px';

		this.getId = function(){
			return 'line_' + this.index
		};


		(function(getHigherDiference, checkDiference, saveMaxElement, getCurentWidth, savedOverflowItem, getOverPosition, drawStep, arrayData){
			setTimeout(function(){
				if (getHigherDiference != 0 || getHigherDiference < 0 ) {
					$("#line_" + i).children("div.left_over").css({width: getHigherDiference + "px"});
				}
				if (checkDiference!=0) {
					$("#" + saveMaxElement).children().eq(1).css({width: getCurentWidth + "px", right: checkDiference + "px"});
					$("#line_" + i).append(
						"<div class='overtime_line right_over' style='width:" + getCurentWidth + "px;'></div>"
					);
					$("#" + saveMaxElement).append(
						"<div class='overtime_line right_over' style='width:" + getCurentWidth + "px; right:" + checkDiference + "px'></div>"
					);
				}
				if (savedOverflowItem && getOverPosition!=0) {
					$("#" + savedOverflowItem).append(
						"<div class='overtime_line left_over' style='width:" + arrayData.duration() * drawStep + "px; left:" + getOverPosition +"px;'></div>"
					);
					$("#line_" + i).append(
						"<div class='overtime_line left_over' style='width:" + arrayData.duration() * drawStep + "px;'></div>"
					);
				}
			}, 100);
		}(getHigherDiference, checkDiference, saveMaxElement, getCurentWidth, savedOverflowItem, getOverPosition, drawStep, arrayData));


		prevEnd = arrayData.endTime();

	}

	return { viewModel: CalendarWebinarComponent, template: template }

});