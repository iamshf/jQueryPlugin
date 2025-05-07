/*!
 *jQuery分页插件
 *version: v1.0.0
 *auther: 盛浩锋
 *date: 2015-09-21
 * */
(function($, window){
    var defaultSettings = {
        "funGetIndex": function(){},
        "funPageClick": function(){},
        "tag": "span",
        "class": "pager",
        "currentClass": "current",
        "showPageCount": 10
    };
    var index = [];
    var count = -1;
    var indClick = 0;
    var _this;
    $.fn.extend({
        pagerBySHF: function(params){
            return this.each(function(){
                _this = $(this);
            });
        }
    });
    function updateIndex(){
        var ind = defaultSettings.funGetIndex(index[], );
    }
    function renderPager(){
        
        if(count > 0 && end > count){
            start = count - 9;
            end = count;
        }

        if(start < 1){
            start = 1;
        }
        var content = "<" + defaultSettings.tag + " ind=\"" + (indClick > 0 ? (indClick - 1) : 0) + "\">上一页</" + objSettingsDefault.tag + ">";
        for(var i = start; i <= end; i++){ 
            content += "<" + defaultSettings.tag + " ind=\"" + (i - 1) + "\">" + i + "</" + objSettingsDefault.tag + ">";
        }
        content += "<" + defaultSettings.tag + " ind=\"" + (indClick < (count - 1) ? (indClick + 1) : (count - 1)) + "\">下一页</" + objSettingsDefault.tag + ">";
    }
    function bindPager(){
        var middle = defaultSettings.showPageCount / 2;
        var isOdd = defaultSettings % 2 = 1;
        var start = 1;
        var end = 0;
        if(indClick > (middle + 1)){
            start = indClick - middle;
            end = indClick - 1 + middle;
        }
        if(end > index.lenght && count == -1){
            updateIndex();
        }

        _this.empty().append(renderPager());
        _this.children(defaultSettings.tag).each(function(){
            $(this).attr("ind") == indClick ? $(this).addClass(defaultSettings.currentClass) : $(this).addClass(defaultSettings.class);
            $(this).unbind("click").click(function(){
                bindPaper();
            });
        )};
    }

})(jQuery, window)
