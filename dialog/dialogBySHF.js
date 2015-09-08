/**
* DialogBySHF Library v1.0.1
* http://cnblogs.com/iamshf
*
* author:盛浩峰
* Date: 2014-12-01
* 修复与播放器插件不兼容的Bug
* 使用前需先引用拖动插件：../drag/dragBySHF.min.js
*/

/*添加样式，在IE9.0一下版本中需要单独引用，此处引用无效*/
;
(function ($) {
    var STYLEPATH = "dialogBySHF.css";
    $("<link>")
        .attr({ rel: "stylesheet",
            type: "text/css",
            href: STYLEPATH
        }).appendTo("head");
    //默认参数
    var PARAMS;
    var DEFAULTPARAMS = {
        Title: "Windows弹出消息",
        Content: "",
        Width: 400,
        Height: 300,
        URL: "",
        ConfirmText: "确定",
        ConfirmFun: new Object,
        CancelText: "取消",
        CancelFun: new Object,
        CloseFun: new Object
    };
    var ContentWidth = 0;
    var ContentHeight = 0;
    $.DialogBySHF = {
        //弹出提示框
        Alert: function (params) { Show(params, "Alert"); },
        //弹出确认框
        Confirm: function (params) { Show(params, "Confirm"); },
        //弹出引用其他URL框
        Dialog: function (params) { Show(params, "Dialog"); },
        //仅显示提示，不所有显示按钮
        ShowTip: function (params) { Show(params, "ShowTip"); },
        //关闭弹出框
        Close: function () {
            if ($.isFunction(PARAMS.CloseFun)) {
                PARAMS.CloseFun();
            }
            $("#DialogBySHFLayer,#DialogBySHF").remove();
        }
    };
    //初始化参数
    function Init(params) {
        if (params != undefined && params != null) {
            PARAMS = $.extend({}, DEFAULTPARAMS, params);
        }
        ContentWidth = PARAMS.Width - 10;
        ContentHeight = PARAMS.Height - 45;
    };

    function SetStyle() {
        var screenWidth = $(window).width();
        var screenHeight = $(window).height();
        var positionLeft = (screenWidth - PARAMS.Width) / 2 + $(document).scrollLeft();
        var positionTop = (screenHeight - PARAMS.Height) / 2 + $(document).scrollTop();
        positionLeft = positionLeft < 0 ? 0 : positionLeft;
        positionTop = positionTop < 0 ? 0 : positionTop;

        $("#DialogBySHFLayer").css({ width: screenWidth, height: screenHeight, top: $(window).scrollTop() });
        $("#DialogBySHF").css({ left: positionLeft, top: positionTop });
    };

    //显示弹出框
    function Show(params, caller) {
        Init(params);
        var Content = [];
        Content.push("<div id=\"DialogBySHFLayer\"></div>");
        Content.push("<div id=\"DialogBySHF\" style=\"width:" + PARAMS.Width + "px;height:" + PARAMS.Height + "px;\">");
        Content.push("    <div id=\"Title\"><span>" + PARAMS.Title + "</span><span id=\"Close\">&#10005;</span></div>");
        Content.push("    <div id=\"Container\" style=\"width:" + ContentWidth + "px;height:" + ContentHeight + "px;\">");
        if (caller == "Dialog") {
            Content.push("        <iframe src=\"" + PARAMS.URL + "\"></iframe>");
        }
        else {
            var TipLineHeight = ContentHeight - 60;
            Content.push("        <table>");
            Content.push("            <tr><td id=\"TipLine\" style=\"height:" + TipLineHeight + "px;\">" + PARAMS.Content + "</td></tr>");
            Content.push("            <tr>");
            Content.push("                <td id=\"BtnLine\">");
            if (caller != "ShowTip") {
                Content.push("                    <input type=\"button\" id=\"btnDialogBySHFConfirm\" value=\"" + PARAMS.ConfirmText + "\" />");
            }
            if (caller == "Confirm") {
                Content.push("                    <input type=\"button\" id=\"btnDialogBySHFCancel\" value=\"" + PARAMS.CancelText + "\" />");
            }
            Content.push("                </td>");
            Content.push("            </tr>");
            Content.push("        </table>");
        }
        Content.push("    </div>");
        Content.push("</div>");
        $("body").append(Content.join("\n"));

        SetStyle();

        SetDialogEvent(caller);
    }
    //设置弹窗事件
    function SetDialogEvent(caller) {
        $(window).resize(function () {
            SetStyle();
        }).scroll(function () {
            SetStyle();
        });

        $("#DialogBySHF #Close").click(function () { $.DialogBySHF.Close(); });
        $("#DialogBySHF #Title").dragBySHF({ objDrag: $("#DialogBySHF") });
        if (caller != "Dialog") {
            $("#DialogBySHF #btnDialogBySHFConfirm").click(function () {
                if ($.isFunction(PARAMS.ConfirmFun)) {
                    $("#DialogBySHFLayer,#DialogBySHF").hide();
                    PARAMS.ConfirmFun();
                }
                $.DialogBySHF.Close();
            });
        }
        if (caller == "Confirm") {
            $("#DialogBySHF #btnDialogBySHFCancel").click(function () {
                if ($.isFunction(PARAMS.CancelFun)) {
                    $("#DialogBySHFLayer,#DialogBySHF").hide();
                    PARAMS.CancelFun();
                }
                $.DialogBySHF.Close();
            });
        }
    }
})(jQuery);