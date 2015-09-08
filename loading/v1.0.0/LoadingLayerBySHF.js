(function ($) {
    function SetBodyLoading() {
        $("#LoadingContainer").css({ width: $(window).width(), height: $(window).height(), top: $(window).scrollTop() });
    }
    $.fn.extend({
        ShowLoading: function (msg, ResourcePath) {
            return $(this).each(function () {
                if (msg == null || msg == undefined) {
                    msg = "数据正在加载中，请您稍等……"
                }
                if (ResourcePath == null || ResourcePath == undefined) {
                    ResourcePath = "http://resource.en100.com.cn/Javascript/LoadingLayerBySHF/"
                }
                $("head").append("<style type=\"text/css\">.ShowLoadingBySHF{position:relative;}</style>")
                var iWidth = $(this).width();
                var iHeight = $(this).height();

                var positionName = $(this).css("position");
                if (positionName != "absolute" && positionName != "relative") {
                    $(this).addClass("ShowLoadingBySHF");
                }
                $(this).append("<div id=\"LoadingContainer\" style=\"width:" + iWidth + "px;height:" + iHeight + "px;text-align:center;background-color:#CCCCCC;position:absolute;left:0px;top:0px;filter:alpha(opacity=80);-moz-opacity:0.80;opacity:0.80;z-index:500;\"><table style=\"width:100%;height:100%;\"><tr><td style=\"text-align:right;width:50%;\"><img src=\"" + ResourcePath + "Images/Loading.gif\" /></td><td style=\"text-align:left;\">" + msg + "</td></tr></table></div>");
                if ($(this)[0].tagName.toLowerCase() == "body") {
                    SetBodyLoading();
                    $(window).resize(function () {
                        SetBodyLoading();
                    }).scroll(function () {
                        SetBodyLoading();
                    })
                }
            })
        }
    })
    $.extend({
        closeLoading: function () {
            if ($(".ShowLoadingBySHF").length > 0) {
                $(".ShowLoadingBySHF").removeClass("ShowLoadingBySHF");
            }
            $("#LoadingContainer").remove();
        }
    })
})(jQuery)