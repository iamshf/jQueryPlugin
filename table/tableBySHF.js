/*!
*tableBySHF v1.0.1
*Author:盛浩峰
*Date:2015-03-24
*http://www.cnblogs.com/iamshf
*http://wonder-world.appspot.com
*增加版本号信息
*/
;
(function ($, window, undefined) {
    $.fn.extend({
        fixHead: function (params) {
            var defaultParams = { Height: 400, BorderWidth: 1 };
            if (params != undefined && params != null) {
                defaultParams = $.extend({}, defaultParams, params);
            }
            return this.each(function () {
                var objTableHead = $(this).children("thead");
                var objTableBody = $(this).children("tbody");
                $(this).wrap("<div style=\"width:" + $(this).width() + "px; position:relative;padding-top:" + $(this).children("thead").height() + "px;margin:" + $(this).css("margin-top") + " " + $(this).css("margin-right") + " " + $(this).css("margin-bottom") + " " + $(this).css("margin-left") + ";\"><div style=\"height:" + (defaultParams.Height - objTableHead.height()) + "px;overflow:auto;\"></div></div>")
                $(this).css({ "width": ($(this).parent("div")[0].clientWidth - 2) + "px", "margin": "0" });
                objTableHead.children("tr").each(function (i) {
                    $(this).children("th").each(function (j) {
                        var CurrentWidth = $(this).width();
                        objTableBody.find("tr td:nth-child(" + (j + 1) + ")").css("width", CurrentWidth);
                        $(this).css({ "width": CurrentWidth + defaultParams.BorderWidth });
                    })
                })
                objTableHead.css({ "position": "absolute", "left": "0", "top": "0px", "z-index": "10" });
            })
        },
        sort: function (options) {
            //<summary>
            ///设定按照表头排列
            ///</summary>
            ///<params type="json" name="options">
            ///参数，例：{ "isSortAll": 1, "sortSetting": [{"index"0,"type":1},{"index"1,"type":2}] }
            ///isSortAll取值为0时为不全部排序，需提供排序的字段
            ///isSortAll取值为1时为全部排序，可提供排序的字段和类型，默认全为字符串
            ///sortSetting字段中其中index表述要排序的列索引，从0开始
            ///type表示列的类型:1——数字，2——字符串
            ///</params>
            var defaultParams = { "isSortAll": 1, "sortSettings": [] };
            var params = $.extend({}, defaultParams, options);
            return this.each(function () {
                initSort($(this), params);
            });
        }
    });
    function initSort(objTable, params) {
        var objHeaders = objTable.find("tr th");
        for (var i = 0, l = params.sortSettings.length; i < l; i++) {
            bindSortEvent(objTable, objHeaders.eq(params.sortSettings[i].index), params.sortSettings[i], params);
        }
        if (params.isSortAll == 1) {
            objHeaders.filter(function () {
                return $(".sortDirection", this).length == 0;
            }).each(function () {
                bindSortEvent(objTable, $(this), { "index": $(this).index(), "type": 2 }, params);
            });
        }
    }
    function bindSortEvent(objTable, objHeader, sortSetting, params) {
        objHeader.unbind("click", sortLine).css("cursor", "pointer").bind("click",
            {
                objTable: objTable,
                objHeader: objHeader,
                sortSetting: sortSetting,
                params: params
            }, sortLine).append("<span class=\"sortDirection\"></span>");
    }
    function sortLine(e) {
        var currentDirection = e.data.objHeader.children(".sortDirection").html();
        var direction = 1;
        var directionTag = "↑";
        if (currentDirection == "↑") {
            direction = 0;
            directionTag = "↓";
        }
        var arrTemp = new Array();
        e.data.objTable.find("tbody tr td:nth-child(" + (e.data.sortSetting.index + 1) + ")").each(function (j) {
            arrTemp.push([j, $(this).text()]);
        });
        arrTemp.sort(function (a, b) {
            return compare(a, b, e.data.sortSetting, direction);
        });

        var temp = document.createDocumentFragment();
        for (var i = 0, l = arrTemp.length; i < l; i++) {
            temp.appendChild(e.data.objTable.find("tbody tr").eq(arrTemp[i][0]).clone()[0]);
        }
        e.data.objTable.find("tbody tr").remove();
        e.data.objTable.find("tbody").append(temp);

        e.data.objTable.find(".sortDirection").html("");
        e.data.objHeader.children(".sortDirection").html(directionTag);
        $(e.data.objTable).parent("div").parent("div").css("padding-top",$(e.data.objTable).children("thead").height());
    }
    function compare(a, b, sortSetting, direction) {
        var result;
        if (sortSetting.type == 1) {
            result = a[1] - b[1];
        }
        else {
            result = a[1].localeCompare(b[1]);
        }
        return direction == 1 ? result : -result;
    }
})(jQuery, window, undefined);