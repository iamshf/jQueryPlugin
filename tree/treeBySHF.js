/*!
* TreeBySHF Library v1.2.0
* http://cnblogs.com/iamshf
* author:盛浩峰
* Date: 2018-08-06
* 新功能：
*        1、修改为左右值级联树
*/
;(function(){
    $(function(){
        setStyle();
        extendObject();
    });
    function extendObject(){
        $.fn.extend(true, {
            bindTreeBySHF: function(opts) {
                return this.each(function() {
                    var defaults = {
                        "data": {}, 
                        "check_type": 0,//选择类型，0-无；1-checkbox;2-radio;
                        "checkbox_cascade": 1,//级连选择类型，0-不级连；1-级连选中所有；2-仅选中操作时级连
                        "root_id": 0, //根结点id
                        "is_expansion": false, //是否展开
                        "event_change": null,//当checkType > 0时，选择框的change事件,
                        "event_click": null,
                        "bgcolor": "inherit",//默认背景色
                        "column": {"NODENAME":"NODENAME","NODEID":"NODEID","PID":"PID", "LV": "LV", "RV": "RV"},
                        "id_suffix": createIdSuffix()
                    };
                    var params =  $.extend({}, defaults, opts);
                    $(this).empty().append(createTreeContent(params));
                    $(this).find("a").each(function(i){
                        $(this).data("item", params["data"][i]);
                    });
                    setEvent($(this), params);
                    $(this).find("img").css({"background": params.bgcolor});
                });
            }
        });
    }
    function createIdSuffix(){
        var id_suffix;
        do{
            id_suffix = (new Date()).getTime() + parseInt(Math.random() * 10000);
        } while($("#treeBySHF_" + id_suffix).length > 0);
        return id_suffix;
    }
    function setStyle(){
        if($("#treeBySHFStyle").length == 0) {
            var url = $("script[src$='treeBySHF.js']").attr("src");
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = url.substr(0, url.lastIndexOf("/")) + "/treeBySHF.css";
            link.id = "treeBySHFStyle";
            document.head.appendChild(link);
        }
    }
    function createTreeContent(params) {
        var url = $("script[src$='treeBySHF.js']").attr("src");
        var img_path = url.substr(0, url.lastIndexOf("/")) + "/images/";
        var html = "<ul id=\"treeBySHF_" + params.id_suffix + "\" class=\"TreeBySHF\">";
        for (var i = 0, l = params.data.length; i < l; i++) {
            var isFirst = (i == 0 ? "Y" : "N");
            var isLast = ((i == l - 1) || (params.data[i + 1][params.column.LV] - params.data[i][params.column.RV] > 1) || i == (l - 1 - (params.data[i][params.column.RV] - params.data[i][params.column.LV] - 1) / 2)) ? "Y" : "N";
            var hasChild = (params.data[i][params.column.RV] - params.data[i][params.column.LV] > 1 ? "Y" : "N");
            var isOpen = hasChild;

            html += "<li>";
            html += "<img src=\"" + img_path + isFirst + isLast + hasChild + isOpen + ".gif\" />";
            if(params["check_type"] == 1) {
                html += "<input type='checkbox' name='cbxTreeBySHF' value='" + params.data[i][params.column.NODEID] + "' />";
            }
            if(params["check_type"] == 2) {
                html += "<input type='radio' name='radTreeBySHF' value='" + params.data[i][params.column.NODEID] + "' />";
            }
            html += "<a>" + params.data[i][params.column.NODENAME] + "</a>";
            if (params["data"][i][params.column.RV] - params.data[i][params.column.LV] == 1) {
                html += "</li>";
            }
            if (i < l - 1 && params.data[i + 1][params.column.LV] -params.data[i][params.column.RV] >= 2) {
                for(var x=0,y=(params.data[i + 1][params.column.LV] - params.data[i][params.column.RV] - 1);x<y;x++){
                    html += "</ul></li>"
                }
            }
            if (params.data[i][params.column.RV] - params.data[i][params.column.LV] > 1) {
                html += "<ul>";
            }
        }
        html += "</ul>"
        return html;
    }
    function setEvent(obj, params) {
        obj.on("click", "img", function(){
            if($(this).parent("li").children("ul").length > 0) {
                var src = $(this).attr("src");
                $(this).attr("src", src.slice(0, -5) + (src.substr(-5, 1) == "Y" ? "N" : "Y") + ".gif");
                $(this).parent("li").children("ul").slideToggle();
            }
        });
        obj.on("click", "a", function(){
            $(this).parent("li").children("img").click();
            if($.isFunction(params.event_click)){
                params.event_click($(this));
            }
        });
        if(params["check_type"] > 0 && $.isFunction(params.event_change)) {
            obj.on("change", "input", function(){
                    params.event_change();
            });
        }
        if(params["check_type"] == 1 && params["checkbox_cascade"] > 0){
            obj.on("change", "input", function(){
                var _this = $(this);
                if(params["checkbox_cascade"] == 1) {
                    _this.parent("li").find("input").prop("checked", _this.prop("checked"));
                    _this.parent("li").parentsUntil("#treeBySHF_" + params.id_suffix).filter("li").each(function(){
                        $(this).children("input").prop("checked", $(this).children("ul").find("input:checked").length > 0);
                    });
                }
                else if(params["checkbox_cascade"] == 2) {
                    if(_this.prop("checked")) {
                        _this.parent("li").parentsUntil("#treeBySHF_" + params.id_suffix).children("input").prop("checked", _this.prop("checked"));
                        _this.parent("li").find("input").prop("checked", _this.prop("checked"));
                    }  
                }
            });
        }
        if(!params.is_expansion) {
            $("#treeBySHF_" + params.id_suffix).find("li").each(function(){
                $(this).children("img").click();
            });
        }
    }
}(jQuery, window));
