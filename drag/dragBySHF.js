/*!
*dragBySHF v1.0.0
*Author:盛浩锋
*Date:2014-04-15
*http://www.cnblogs.com/iamshf
*/
; (function ($, window, document, undefined) {
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
            var objDrag; //拖动的对象
            var iInitLeft = null; //滑动对象的初始位置
            var iInitTop = null; //滑动对象的初始位置
            return this.each(function () {
                $.extend(objSettingsDefault, objSettings);
                objDrag = objSettingsDefault.objDrag == null ? $(this) : objSettingsDefault.objDrag;
                $(this).mousedown(function (e) {
                    if (!objDrag.css("position") || objDrag.css("position") == "static") {
                        objDrag.css({
                            "position": "relative",
                            "left": "0px",
                            "top": "0px"
                        });
                    }
                    OnDragStart(e);
                }).mouseup(function () {
                    OnDragStop();
                })
            });
            function OnDragStart(e) {
                ///<summary>
                ///开始拖动
                ///</summary>
                ///<param name="e" type="object">事件对象</param>
                var iClientX = e.clientX;
                var iClientY = e.clientY;
                if (iInitLeft == null) {
                    iInitLeft = parseInt(objDrag.css("left").replace("px", ""));
                    iInitLeft = isNaN(iInitLeft) ? 0 : iInitLeft;
                }
                if (iInitTop == null) {
                    iInitTop = parseInt(objDrag.css("top").replace("px", ""));
                    iInitTop = isNaN(iInitTop) ? 0 : iInitTop;
                }

                $(document).bind("mousemove",
                    {
                        iStartPosX: iClientX,
                        iStartPosY: iClientY,
                        iInitPosX: parseInt(objDrag.css("left").replace("px", "")),
                        iInitPosY: parseInt(objDrag.css("top").replace("px", ""))
                    }, OnDraging).bind("mouseup", OnDragStop);

                objSettingsDefault.funStart();
            }
            function OnDraging(e) {
                ///<summary>
                ///正在拖动
                ///</summary>
                ///<param name="e" type="object">事件对象</param>
                var iOffsetX = parseInt(e.clientX) - parseInt(e.data.iStartPosX) + e.data.iInitPosX;
                var iOffsetY = parseInt(e.clientY) - parseInt(e.data.iStartPosY) + e.data.iInitPosY;
                if (objSettingsDefault.isLimit) {
                    var iTotalOffsetY = iOffsetY - iInitTop;
                    if (!objSettingsDefault.isLockX) {
                        var iTotalOffsetX = iOffsetX - iInitLeft;
                        if (iTotalOffsetX <= objSettingsDefault.minLeft) {
                            SetPositionX(iInitLeft + objSettingsDefault.minLeft);
                        }
                        else if (iTotalOffsetX >= objSettingsDefault.maxLeft) {
                            SetPositionX(iInitLeft + objSettingsDefault.maxLeft);
                        }
                        else {
                            SetPositionX(iOffsetX);
                        }
                    }
                    if (!objSettingsDefault.isLockY) {
                        if (iTotalOffsetY <= objSettingsDefault.minTop) {
                            SetPositionY(iInitTop + objSettingsDefault.minTop);
                        }
                        else if (iTotalOffsetY >= objSettingsDefault.maxTop) {
                            SetPositionY(iInitTop + objSettingsDefault.maxTop);
                        }
                        else {
                            SetPositionY(iOffsetY);
                        }
                    }
                }
                else {
                    SetPositionX(iOffsetX);
                    SetPositionY(iOffsetY);
                }
                objSettingsDefault.funDraging();
            }
            function SetPositionX(iPosX) {
                if (!objSettingsDefault.isLockX) { objDrag.css("left", iPosX + "px"); }
            }
            function SetPositionY(iPosY) {
                if (!objSettingsDefault.isLockY) { objDrag.css("top", iPosY + "px"); }
            }
            function OnDragStop() {
                ///<summary>
                ///停止拖动
                ///</summary>
                $(document).unbind("mousemove", OnDraging).unbind("mouseup", OnDragStop);
                objSettingsDefault.funStop();
            }
        }
    });
})(jQuery, window, document);