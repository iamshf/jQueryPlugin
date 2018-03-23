/**
* DialogBySHF Library v1.2.0
* http://cnblogs.com/iamshf
*
* author:盛浩峰
* Date: 2018-03-22
* 修复与播放器插件不兼容的Bug
* 使用前需先引用拖动插件：../drag/dragBySHF.min.js  
*
*
* v1.2.0 修复无法在同一个页面多个弹窗的问题;
* 增加destroy方法；
* 增加hide方法；
* 增加show方法；
*/
;(function($, window, document){
    if($("link[href$='dialogBySHF.css']").length == 0) {
        $("head").append("<link rel=\"Stylesheet\" type=\"text/css\" href=\"dialogBySHF.css\" />");
    }
    var zindex = 666;
    $.extend(true, {
        dialogBySHF: function(opts) {
            return new DialogBySHF(opts);
        }
    });
    var DialogBySHF = function(opts){
        var id_suffix;
        do{
            id_suffix = (new Date()).getTime() + parseInt(Math.random() * 10000);
        }while($("#dialogBySHFLayer_" + id_suffix).length > 0);
        
        var defaults = {"width": 400, "height": 300, "title": "系统提示", "content": "", "confirmText": "确定", "cancelText": "取消","zindex": ++zindex,"id_suffix": id_suffix};
        this.options = $.extend({}, defaults, opts);
        initContent(this);
    }
    DialogBySHF.prototype.alert = function(){
        addShowContent(this);
        addFootContent(this);
        addConfirmBtn(this);
        showContent(this);
    };
    DialogBySHF.prototype.confirm = function(){
        addShowContent(this);
        addFootContent(this);
        addConfirmBtn(this);
        addCancleBtn(this);
        showContent(this);
    };
    DialogBySHF.prototype.dialog = function(){
        addFrameContent(this);
        showContent(this);
    };
    DialogBySHF.prototype.prompt = function(){
        addShowContent(this);
        showContent(this);
    };
    DialogBySHF.prototype.close = function(){
        $.isFunction(this.options.closeFun) && this.options.closeFun()
        $("#dialogBySHFLayer_" + this.options.id_suffix + ",#dialogBySHFWrapper_" + this.options.id_suffix + "").remove();
    };
    DialogBySHF.prototype.destroy = function() {
        $("#dialogBySHFLayer_" + this.options.id_suffix + ",#dialogBySHFWrapper_" + this.options.id_suffix + "").remove();
    }
    DialogBySHF.prototype.show = function() {
        $("#dialogBySHFLayer_" + this.options.id_suffix + ",#dialogBySHFWrapper_" + this.options.id_suffix + "").show();
    }
    DialogBySHF.prototype.hide = function() {
        $("#dialogBySHFLayer_" + this.options.id_suffix + ",#dialogBySHFWrapper_" + this.options.id_suffix + "").hide();
    }

    function showContent(obj) {
        if($("#dialogBySHFLayer_" + obj.options.id_suffix).is(":hidden")){
            setStyle(obj);
            setEvent(obj);
            $("#dialogBySHFLayer_" + obj.options.id_suffix + ",#dialogBySHFWrapper_" + obj.options.id_suffix + "").show();
        }
    }

    function initContent(obj){
        var dialog = "<div class=\"dialogBySHFLayer\" id=\"dialogBySHFLayer_" + obj.options.id_suffix + "\" style=\"z-index:" + obj.options.zindex + ";\"></div>";
        dialog += "<div class=\"dialogBySHFWrapper\" id=\"dialogBySHFWrapper_" + obj.options.id_suffix + "\" style=\"z-index:" + obj.options.zindex + ";\">";
        dialog += "<table class=\"dialogBySHFContainer\" id=\"dialogBySHFContainer_" + obj.options.id_suffix + "\">";
        dialog += "<caption class=\"title\" id=\"title_" + obj.options.id_suffix + "\"><span>" + obj.options.title + "</span><span class=\"close\" id=\"close_" + obj.options.id_suffix + "\">✕</span></caption>";
        dialog += "<tbody><tr><td id=\"dialogBySHF_tbody_" + obj.options.id_suffix + "\" class=\"dialogBySHF_tbody\">";
        dialog += "</td></tr></tbody>";
        dialog += "</table>";
        dialog += "</div>";
        $("body").append(dialog);
        obj.hide();
    }
    function addFootContent(obj){
        $("#tfoot_" + obj.options.id_suffix).length == 0 && $("#dialogBySHFContainer_" + obj.options.id_suffix).append("<tfoot><tr><td id=\"dialogBySHF_tfoot_" + obj.options.id_suffix + "\" class=\"dialogBySHF_tfoot\"></td></tfoot>");
    }
    function addConfirmBtn(obj){
        $("#btnDialogBySHFConfirm_" + obj.options.id_suffix).length == 0 && $("#dialogBySHF_tfoot_" + obj.options.id_suffix).append("<input type=\"button\" id=\"btnDialogBySHFConfirm_" + obj.options.id_suffix + "\" class=\"btnDialogBySHF\" value=\"" + obj.options.confirmText + "\" />");
    }
    function addCancleBtn(obj){
        $("#btnDialogBySHFCancel_" + obj.options.id_suffix).length == 0 && $("#dialogBySHF_tfoot_" + obj.options.id_suffix).append("<input type=\"button\" id=\"btnDialogBySHFCancel_" + obj.options.id_suffix + "\" class=\"btnDialogBySHF\" value=\"" + obj.options.cancelText + "\" />");
    }
    function addShowContent(obj){
        $("#dialogBySHFMain_" + obj.options.id_suffix).length == 0 && $("#dialogBySHF_tbody_" + obj.options.id_suffix).append("<div id=\"dialogBySHFMain_" + obj.options.id_suffix + "\" class=\"dialogBySHFMain\">" + obj.options.content + "</div>");
    }
    function addFrameContent(obj){
        $("#dialogBySHFFrame_"+ obj.options.id_suffix).length == 0 && $("#dialogBySHF_tbody_" + obj.options.id_suffix).append("<iframe id=\"dialogBySHFFrame_" + obj.options.id_suffix + "\" class=\"dialogBySHFFrame\" src=\"" + obj.options.content + "\"></iframe>");
    }
    function setStyle(obj) {
        var window_width = $(window).width();
        var window_height = $(window).height();
        var max_width = 0.8 * window_width;
        var max_height = 0.8 * window_height;

        var _width = obj.options.width;
        var _height = obj.options.height;
        var _left = (window_width - _width) / 2;
        var _top = (window_height - _height) / 2;

        if(_width > max_width) {
            _left = 0.1 * window_width;
            _width = max_width;
        }
        if(_height > max_height){
            _top = 0.1 * window_height;
            _height = max_height;
        }

        $("#dialogBySHFLayer_" + obj.options.id_suffix).css({"width": window_width, "height": window_height});
        $("#dialogBySHFWrapper_" + obj.options.id_suffix).css({"left": _left, "top": _top, "width": _width, "height": _height });
        if(document.documentMode || +(navigator.userAgent.match(/MSIE (\d+)/) && RegExp.$1)) {
            setTimeout(function(){
                $("#dialogBySHFFrame_" + obj.options.id_suffix + ",#dialogBySHFMain_" + obj.options.id_suffix).css({"height": _height - $("#title_" + obj.options.id_suffix).height() - $("#dialogBySHF_tfoot_" + obj.options.id_suffix).height() - 10});
            });
        }
        //$("#dialogBySHFContainer_" + obj.options.id_suffix).css({"width": _width, "height": _height});
    }

    function setEvent(obj){
        $(window).on("resize", function(){setStyle(obj);});
        $("#dialogBySHFWrapper_" + obj.options.id_suffix).on("click", "#close_" + obj.options.id_suffix, function(){ obj.close();});
        $("#dialogBySHFWrapper_" + obj.options.id_suffix).on("click", "#btnDialogBySHFConfirm_" + obj.options.id_suffix, function(){ 
            $.isFunction(obj.options.confirmFun) ? obj.options.confirmFun() : obj.close();
        });
        $("#dialogBySHFWrapper_" + obj.options.id_suffix).on("click", "#btnDialogBySHFCancel_" + obj.options.id_suffix, function(){ 
            $.isFunction(obj.options.cancelFun) ? obj.options.cancelFun() : obj.close();
        });
        setTimeout(function(){
            $("#title_" + obj.options.id_suffix).dragBySHF({ "objDrag": $("#dialogBySHFWrapper_" + obj.options.id_suffix) });
        },0);
    }
}(jQuery, window, document));
