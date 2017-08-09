/**
 * Created by Feonit on 13.07.15.
 */

define(['knockout'], function(ko){

    /**
     * This provides methods used for event handling. It's not meant to
     * be used directly.
     * @class DragAndDropModel
     * @constructs DragAndDropModel
     * */
    function DragAndDropModel(){
        /**
         * Элемент в состоянии перемещения
         * */
        this.isMoving = ko.observable(false);
        /**
         * Элемент завершил перемещение
         * */
        this.isMoved = ko.observable(false);
        /**
         * Элемент выбран пользователем
         * */
        this.isSelected = ko.observable(false);
        /**
         * Элемент источник
         * */
        this.isDraggable = ko.observable(false);
        /**
         * Позволяет отключить DnD когда форма переименования открыта
         * */
        this.isAllowedDnD = ko.observable(true);
    }

    // proxy
    var API = {
        dropMovingItemsToFolder : function (selected, data, folder){
            return API_VirtualFileSystem.updateRequest(data, folder, function (){
                API_VirtualFileSystem.moveSelectedToFolder(selected, folder);
                API_VirtualFileSystem.setIsMovedAllSelectedItemsState(selected, true);
                API_VirtualFileSystem.setIsMovingAllSelectedItemsState(selected, false);
            });
        },
        getSelectedTotalItemsLength : function(){
            return API_VirtualFileSystem.getSelectedTotalItemsLength();
        },
        setStateProcess : function(state){
            return API_VirtualFileSystem.isEnabledProcessTransfer(state);
        },
        setIsMovingAllSelectedItemsState : function(items, boolean){
            return API_VirtualFileSystem.setIsMovingAllSelectedItemsState(items, boolean);
        },
        unselectAll : function(){
            return API_VirtualFileSystem.unselectAll();
        },
        getDataOfMovingItems: function(){
            return API_VirtualFileSystem.getDataOfMovingItems();
        },
        getSelectedTotalItems : function(){
            return API_VirtualFileSystem.getSelectedTotalItems();
        }
    };

    var mouseMoveMaster = {
        /**
         * состояние пройден ли путь
         * */
        isPassed: false,
        /**
         * оценка пройденного пути в процентах
         * */
        percent: 0,
        /**
         * начальная координата x
         * */
        firstX : undefined,
        /**
         * начальная координата y
         * */
        firstY : undefined,
        /**
         * текущая координата y
         * */
        clientY : undefined,
        /**
         * текущая координата x
         * */
        currentX : undefined,

        /**
         * @param {Event} event
         * @param {Function} successCallback — После прохождения порога
         * @param {Function} notYeatSuccessCallback — Еще не пройден порог
         * */
        init : function(event, successCallback, notYeatSuccessCallback){
            this._resetData();

            this.firstX = event.clientX;
            this.firstY = event.clientY;

            /**
             * Отслеживает движения мыши по документу, сохраняет текущее положение, и проверяет
             * превышен ли порог при меремещении, если превышен, вызывает обработчик после прохождения порога
             * @param {Event} event — Событие с текущеми координатами
             * */
             function documentHandler(event){
                if ( !this.isPassed ){
                    var testing = this._getStateMovement(event);

                    this.isPassed = testing.isPassed;

                    if ( testing.isPassed ){
                        successCallback()
                    } else {
                        notYeatSuccessCallback(testing.percent)
                    }
                }
            }

            this.documentHandler = documentHandler.bind(this);

            document.addEventListener('dragover', this.documentHandler, false);
        },
        destroy: function(){
            this._resetData();
            document.removeEventListener('dragover', this.documentHandler, false);
        },
        /**
         * Проверяем, превышен ли порог при меремещении
         * @param {Event} event — Событие с текущеми координатами
         * @returns {percent: Number, isPassed: Boolean}
         * */
        _getStateMovement : function (event){
            var firstX = this.firstX,
                firstY = this.firstY,
                currentX = event.clientX,
                currentY = event.clientY,
                STEP_PX = 200,
                shiftX,
                shiftY,
                passed,
                percent;

            if (!firstX || !firstY || !currentX || !currentY)
                return false;

            shiftX = Math.abs(firstX - currentX);
            shiftY = Math.abs(firstY - currentY);
            passed = Math.floor(Math.sqrt(shiftY*shiftY + shiftX*shiftX));
            percent = Math.floor((passed / STEP_PX) * 100);

            return {
                isPassed: STEP_PX < passed,
                percent: percent > 100 ? 100 : percent
            }
        },
        /**
         * Сбрасываем значения
         * */
        _resetData: function(){
            this.firstX = 0;
            this.firstY = 0;
            this.currentX = 0;
            this.currentY = 0;
            this.isPassed = false;
            this.percent = 0;
        }
    };

    DragAndDropModel.prototype =
    /** @lends DragAndDropModel.prototype */
    {
        constructor: DragAndDropModel,
        /**
         * Handler
         * @public
         * @param {Object} model
         * @param {Event} event
         * */
        ondragstart : function(model, event){  if (event.originalEvent) event = event.originalEvent;
            var that = this;

            // прячем файлы оставляя только папки при прохождении порога
            mouseMoveMaster.init(event, function successCallback(){
                DragAndDropModel._effectOnBodyScroll.start();
                if(that.mode() === 'NORMAL_STUFFING'){
                    that._saveTopScrollPosition();
                    setTimeout(function(){
                        API.setStateProcess(true);
                    }, 10);
                }
            }, function notYeatSuccess(percent){

            });

            var count = API.getSelectedTotalItemsLength();

            // ставим режим обычного переноса
            this.mode('NORMAL_STUFFING');

            if (count === 0){
                // case: перетаскиваем всегда хотябы один элемент
                model.isSelected(true);

                // режим быстрого переноса
                this.mode('QUICK_STUFFING');
            }

            API.setIsMovingAllSelectedItemsState(API.getSelectedTotalItems(), true);

            event.dataTransfer.effectAllowed = "move";

            // без установки фейковых данных FF не работает DnD
            event.dataTransfer.setData(DragAndDropModel._MIME_TYPE, "fake data");

            this._createDragabbleElemView(event);

            return true;
        },
        /**
         * Handler
         * @public
         * @param {Object} model
         * @param {Event} event
         * */
        ondragenter : function(model, event){  if (event.originalEvent) event = event.originalEvent;
            event.dataTransfer.dropEffect  = 'copy';
            this.isTaken(false); // для рестарта эффекта
            if (this.mayTake()){
                this.isTaking(true);
            }
        },
        /**
         * Handler
         * @public
         * @param {Object} model
         * @param {Event} event
         * */
        ondragover : function(model, event){  if (event.originalEvent) event = event.originalEvent;
            this.isTaking(true);
            // Чтобы до элемента дошло событие drop, нужно запретить передачу по цепочке события dragover
            if (event.preventDefault) event.preventDefault();
            return false;
        },
        /**
         * Handler
         * @public
         * @param {Object} model
         * @param {Event} event
         * */
        ondragleave : function(model, event){
            this.isTaking(false);
        },
        /**
         * Handler
         * @public
         * @param {Object} folder
         * @param {Event} event
         * */
        ondrop : function(folder, event){
            // reset state
            this.isTaking(false);

            // if available for taking
            if (this.mayTake()) {
                // запоминаем все что нужно
                var data = API.getDataOfMovingItems();
                var selected = API.getSelectedTotalItems();

                // отключаем
                API.unselectAll();

                this.open({
                    callback: function(){
                        this.isTaken(true);
                        API.dropMovingItemsToFolder(selected, data, folder);
                    }.bind(this)
                });
            } else {
                return false;
            }
        },
        /**
         * Handler
         * @public
         * @param {Object} model
         * @param {Event} event
         * */
        ondragend : function(model, event){  if (event.originalEvent) event = event.originalEvent;

            API.setIsMovingAllSelectedItemsState(API.getSelectedTotalItems(), false);

            if(this.mode() === 'QUICK_STUFFING'){
                // сбрасываем селекты только в этом режиме
                API.unselectAll();
            }

            if(this.mode() === 'NORMAL_STUFFING'){
                API.setStateProcess(false);

                var TIME_CSS = 200;

                setTimeout(function(){
                    this._restoreTopScrollPosition();
                }.bind(this), TIME_CSS);
            }

            // выключить скролл эффект
            DragAndDropModel._effectOnBodyScroll.stop();

            // выключить отслеживание курсора
            mouseMoveMaster.destroy();

            this.isDraggable(false);
        },
        /**
         * Создает перетаскиваемый элемент
         * */
        _createDragabbleElemView : function (event){
            var count = API.getSelectedTotalItemsLength();

            var image = document.getElementById('js_drag_item');
            var body = document.body;

            image = image.cloneNode(true);
            image.innerHTML = '<span>' + count + '</span>';
            image.classList.remove('none');

            // Добавляем image на страницу
            body.appendChild(image);

            // Устанавливаем image в качестве картинки для перетаскивания
            event.dataTransfer.setDragImage(
                image,
                image.offsetWidth,
                image.offsetHeight
            );

            // Удаляем image через 1 милисекунду. Если удалить срзау,
            // то вызов setDragImage произойдет до того как отрендерится image
            window.setTimeout(function() {
                image.parentNode.removeChild(image);
            }, 0);

            return image;
        },

        topScrollPosition: undefined,

        _saveTopScrollPosition: function(){
            var content = document.querySelector('.middle_main_content');
            this.topScrollPosition = content.scrollTop;
        },

        _restoreTopScrollPosition: function(){
            var content = document.querySelector('.middle_main_content'),
                currentScrollTop = content.scrollTop,
                savedScrollTop = this.topScrollPosition,
                dirrect = currentScrollTop > savedScrollTop;

            function nextStepScrollTop(){
                currentScrollTop += (dirrect ? -10 : 10);
                content.scrollTop = currentScrollTop;
            }

            var id = setInterval(function(){
                Math.abs(currentScrollTop - savedScrollTop) > 11
                    ? nextStepScrollTop()
                    : clearInterval(id);
            }, 10);
        },

        /**
         * Handler
         * @public
         * @param {Object} model
         * @param {Event} event
         * */
        onToggleSelectStateClick : function(model, event){  if (event.originalEvent) event = event.originalEvent;
            if (!this.isDisabledCheckBox()){
                this.isSelected(!this.isSelected());
            }
            event.stopImmediatePropagation();
        },
        /**
         * Режим вбрасывания файлов, при котором файлы либо скручиваются либо нет
         * @value {String} NORMAL_STUFFING | QUICK_STUFFING
         * */
        mode: ko.observable(),

        onmousedown: function(){
            if (this.isAllowedDnD()){
                this.isDraggable(true);
            }
            return true;
        },
        onmouseup: function(){
            if (this.isAllowedDnD()){
                this.isDraggable(false);
            }
            return true;
        }
    };

    DragAndDropModel._effectOnBodyScroll = (function(){

        function destroy(){
            document.body.removeAttribute('draggable');
            document.removeEventListener('dragover', _scrolling);
        }

        function _scrolling(event){
            var CONST_OFFSET = 5;

            var a = document.querySelector('.middle_main_content');
            var height = window.innerHeight;
            var FrameTop = Math.round(height/CONST_OFFSET);

            if (event.pageY < FrameTop){
                a.scrollTop =  a.scrollTop - 2;
            }

            if (event.pageY > (CONST_OFFSET-1)*FrameTop){
                a.scrollTop =  a.scrollTop + 2;
            }
        }

        function bindEventHandler(){
            document.body.setAttribute('draggable', true);
            document.addEventListener('dragover', _scrolling);
        }

        return {
            start: bindEventHandler,
            stop: destroy
        }
    })();

    DragAndDropModel._MIME_TYPE = 'text/plain';//https://msdn.microsoft.com/en-us/library/ms536352(v=vs.85).aspx

    return DragAndDropModel;
});
