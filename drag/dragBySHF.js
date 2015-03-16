/*!
 *DragBySHF v1.1.1
 *Author:盛浩峰
 *Date:2014-05-12
 *http://www.cnblogs.com/iamshf
 *http://wonder-world.appspot.com
 *修复bug
*/
;
(function ($, window, document, undefined) {
    //#region 拖动公共方法
    function onDragStart(e) {
        ///<summary>
        ///开始拖动
        ///</summary>
        ///<param name="e" type="Event">事件对象</param>
        var iClientX = e.clientX;
        var iClientY = e.clientY;
        $(document).bind("mousemove",{
            iInitLeft:e.data.iInitLeft,
            iInitTop:e.data.iInitTop,
            iStartPosX: iClientX,
            iStartPosY: iClientY,
            iInitPosX: parseInt(e.data.objOptions.objDrag.css("left").replace("px", "")),
            iInitPosY: parseInt(e.data.objOptions.objDrag.css("top").replace("px", "")),
            objOptions:e.data.objOptions
        }, onDraging).bind("mouseup",{objOptions:e.data.objOptions} ,onDragStop);
        e.data.objOptions.funStart(e.data.objOptions);
    }
    function onDraging(e) {
        ///<summary>
        ///正在拖动
        ///</summary>
        ///<param name="e" type="object">事件对象</param>
        var iOffsetX = parseInt(e.clientX) - parseInt(e.data.iStartPosX) + e.data.iInitPosX;
        var iOffsetY = parseInt(e.clientY) - parseInt(e.data.iStartPosY) + e.data.iInitPosY;
        if (e.data.objOptions.isLimit) {
            if (!e.data.objOptions.isLockX) {
                var iTotalOffsetX = iOffsetX - e.data.iInitLeft;
                if (iTotalOffsetX <= e.data.objOptions.minLeft) {
                    iOffsetX=e.data.iInitLeft+e.data.objOptions.minLeft;
                }
                else if (iTotalOffsetX >= e.data.objOptions.maxLeft) {
                    iOffsetX=e.data.iInitLeft + e.data.objOptions.maxLeft;
                }
                setPositionX(e.data.objOptions,iOffsetX);
            }
            if (!e.data.objOptions.isLockY) {
                var iTotalOffsetY = iOffsetY - e.data.iInitTop;
                if (iTotalOffsetY <= e.data.objOptions.minTop) {
                    iOffsetY=e.data.iInitTop+e.data.objOptions.minTop;
                }
                else if (iTotalOffsetY >= e.data.objOptions.maxTop) {
                    iOffsetY=e.data.iInitTop + e.data.objOptions.maxTop;
                }
                setPositionY(e.data.objOptions,iOffsetY);
            }
        }
        else {
            setPositionX(e.data.objOptions,iOffsetX);
            setPositionY(e.data.objOptions,iOffsetY);
        }
        e.data.objOptions.funDraging(iOffsetX,iOffsetY,e.data.objOptions);
    }
    function setPositionX(objOptions,iPosX) {
        if (!objOptions.isLockX) { objOptions.objDrag.css("left", iPosX + "px"); }
    }
    function setPositionY(objOptions,iPosY) {
        if (!objOptions.isLockY) { objOptions.objDrag.css("top", iPosY + "px"); }
    }
    function onDragStop(e) {
        ///<summary>
        ///停止拖动
        ///</summary>
        $(document).unbind("mousemove", onDraging).unbind("mouseup", onDragStop);
        e.data.objOptions.funStop(e.data.objOptions);
    }
    //#endregion
    //#region 扩展JQuery插件
    $.fn.extend({
        dragBySHF: function (objSettings) {
            var objSettingsDefault = {
                objDrag: null, //要拖动的对象
                isLockX: false, //是否锁定横向拖动
                isLockY: false, //是否锁定纵向拖动
                isLimit: false, //是否限制，如果为True时，则下面四个参数起效
                minLeft: 0,
                maxLeft: 9999,
                minTop: 0,
                maxTop: 9999,
                funStart: function () { }, //开始拖动时执行的方法
                funDraging: function () { }, //拖动时执行的方法
                funStop: function () { } //停止拖动时的方法
            };
            return this.each(function () {
                var objOptions = $.extend({},objSettingsDefault, objSettings);
                objOptions.objDrag = objOptions.objDrag == null ? $(this) : objOptions.objDrag;
                if (!objOptions.objDrag.css("position") || objOptions.objDrag.css("position") == "static") {
                    objOptions.objDrag.css({
                        "position": "relative",
                        "left": "0px",
                        "top": "0px"
                    });
                }
                var iInitLeft = objOptions.objDrag.css("left")?parseInt(objOptions.objDrag.css("left")):0;
                var iInitTop = objOptions.objDrag.css("top")?parseInt(objOptions.objDrag.css("top")):0;
                $(this).bind("mousedown",{
                    objOptions:objOptions,
                    iInitLeft:iInitLeft,
                    iInitTop:iInitTop
                },onDragStart).bind("mouseup",{objOptions:objOptions},onDragStop);
            });
        }
    });
    //#endregion
}(jQuery, window, document,undefined));