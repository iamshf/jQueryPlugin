/*!
* TreeBySHF Library v1.1.0
* http://cnblogs.com/iamshf
* author:盛浩峰
* Date: 2014-03-06
* 新功能：
*        1、修订了级联选中的Bug
*        2、增加了Radio和Checxbox改变时自定义方法
*        3、修订了方法名称以及相关作用域
*        4、增加了设置默认颜色的选项
*/
var IMAGEPATH = "http://resource.en100.com.cn/Javascript/TreeBySHF/V1.1.0/Images/";
var STYLEPATH = "http://resource.en100.com.cn/Javascript/TreeBySHF/V1.1.0/TreeBySHF1.1.0.min.css";
$("<link>")
    .attr({ rel: "stylesheet",
        type: "text/css",
        href: STYLEPATH
    }).appendTo("head");
(function ($) {
    $.fn.extend({
        BindTreeBySHF: function (objSetting) {
            ///<summary>
            ///绑定树形菜单
            ///<summary>
            ///<param type="object" name="params">树形菜单设置</param>
            return this.each(function () {
                Init(objSetting, $(this));
                BindNode($(this), objDefaultSetting.iRootPID);
                SetTree($(this));
            })
        }
    })
    var objDefaultSetting = {
        objTreeData: new Object, //树形菜单数据，支持JSON格式，字段分别为NODEID,NODENAME,PID
        iCheckType: 0, //选择框类型，0—不显示；1—checkbox；2—radio
        iRootPID: "0", //根节点的父级
        isExpansion: false,
        objClickFunName: new Object(), //点击节点时的方法
        objCheckBoxSwitchFunName: new Object(), //节点CheckBox值改变时的方法
        objRadioSwitchFunName: new Object(), //节点Radio值改变时的方法
        isChangeColorOnClick: true, //点击节点时是否改变节点颜色
        strBackgroundColor: "#FFFFFF",//树形菜单容器的背景色
        column:{"NODENAME":"NODENAME","NODEID":"NODEID","PID":"PID"}
    };
    var iTreeDataLength = 0; //节点总个数
    var objTempTreeData;
    function Init(objSetting, objContainer) {
        ///<summary>
        ///初始化
        ///<summary>
        ///<param type="object" name="params">树形菜单设置</param>
        $.extend(objDefaultSetting, objSetting);
        objContainer.attr("nodeID", objDefaultSetting.iRootPID);
        iTreeDataLength = objDefaultSetting.objTreeData.length;
    }
    function SetTree(objContainer) {
        ///<summary>
        ///设置树形菜单
        ///</summary>
        ///<param name="objContainer" type="object">树形菜单容器</param>
        $("#TreeBySHF_ul_" + objDefaultSetting.iRootPID).addClass("TreeBySHF").children("li").last().css("background-repeat", "no-repeat");
        $(objContainer).removeAttr("nodeID");
        SetCheckType(objDefaultSetting.iCheckType);
        SetIsExpansionNode(objDefaultSetting.isExpansion);
    }
    function BindNode(objContainer, iPID) {
        ///<summary>
        ///绑定节点
        ///</summary>
        ///<param name="objContainer" type="object">属于iPID的节点列表</param>
        ///<param name="iPID" type="int">父节点ID</param>
        var objTemp = new Array();
        $.extend(true, objTemp, objTempTreeData);
        var objContainerLength = objContainer.length;
        objContainer.each(function (i) {
            var iNodeID = $(this).attr("nodeID");
            var htmlNodeContent = GetChildrenContent(iNodeID);
            var isRootFirst = iPID == objDefaultSetting.iRootPID && i == 0 ? "Y" : "N";
            var isLast = i == objContainerLength - 1 ? "Y" : "N";
            var isHasChild = "N";
            var isOpen = "N";
            var objImg = $("#TreeBySHF_img_" + iNodeID);

            SetNodeClick(iNodeID, objTemp[i]);
            SetNodeCheckBoxChange(iNodeID, objTemp[i]);
            SetNodeRadioBoxChange(iNodeID, objTemp[i]);
            if (htmlNodeContent.length > 0) {
                isHasChild = "Y";
                isOpen = "Y";

                SetNodeExpandClose(objImg, iNodeID);
                $(this).append("<ul id=\"TreeBySHF_ul_" + iNodeID + "\">" + htmlNodeContent + "</ul>");
                BindNode($("#TreeBySHF_ul_" + iNodeID + " li"), iNodeID);
            }
            objImg.attr("src", IMAGEPATH + isRootFirst + isLast + isHasChild + isOpen + ".gif");
        })
    }
    function GetChildrenContent(iPID) {
        ///<summary>
        ///根据父节点ID获得节点内容
        ///</summary>
        ///<param name="iPID" type="int">父节点ID</param>
        var htmlNodeContent = "";
        objTempTreeData = new Array();
        for (var i = 0; i < iTreeDataLength; i++) {
            if (objDefaultSetting.objTreeData[i][objDefaultSetting.column.PID] == iPID) {
                htmlNodeContent += "<li id=\"TreeBySHF_li_" + objDefaultSetting.objTreeData[i][objDefaultSetting.column.NODEID] + "\" nodeID=\"" + objDefaultSetting.objTreeData[i][objDefaultSetting.column.NODEID] + "\">";
                htmlNodeContent += "<div class=\"TreeBySHFNodeContainer\">";
                htmlNodeContent += "<img style=\"background-color:" + objDefaultSetting.strBackgroundColor + "\" id=\"TreeBySHF_img_" + objDefaultSetting.objTreeData[i][objDefaultSetting.column.NODEID] + "\" src=\"" + IMAGEPATH + "YNNN.gif\" class=\"TreeBySHFIco\" />";
                htmlNodeContent += "<input type=\"checkbox\" id=\"TreeBySHF_checkbox_" + objDefaultSetting.objTreeData[i][objDefaultSetting.column.NODEID] + "\" class=\"TreeBySHFCheckBox\" name=\"SelectedTreeCheckbox\" value=\"" + objDefaultSetting.objTreeData[i][objDefaultSetting.column.NODEID] + "\" />";
                htmlNodeContent += "<input type=\"radio\" id=\"TreeBySHF_radiobox_" + objDefaultSetting.objTreeData[i][objDefaultSetting.column.NODEID] + "\" class=\"TreeBySHFRadio\" name=\"SelectedTreeRadio\" value=\"" + objDefaultSetting.objTreeData[i][objDefaultSetting.column.NODEID] + "\" />";
                htmlNodeContent += "<a id=\"TreeBySHF_a_" + objDefaultSetting.objTreeData[i][objDefaultSetting.column.NODEID] + "\">" + objDefaultSetting.objTreeData[i][objDefaultSetting.column.NODENAME] + "</a>";
                htmlNodeContent += "</div>";
                htmlNodeContent += "</li>";

                objTempTreeData.push(objDefaultSetting.objTreeData[i]);
                objDefaultSetting.objTreeData.splice(i, 1);
                i--;
                iTreeDataLength--;
            }
        }
        return htmlNodeContent;
    }

    function SetNodeRadioBoxChange(iNodeID, objNode) {
        ///<summay>
        ///设置单选框选中事件
        ///</summary>
        ///<param name="iNodeID" type="int">节点ID</param>
        ///<param name="objNode" type="object">节点JSON对象</param>
        $("#TreeBySHF_radiobox_" + iNodeID).change(function () {
            if ($.isFunction(objDefaultSetting.objRadioSwitchFunName)) {
                objDefaultSetting.objRadioSwitchFunName($(this), objNode);
            }
        })
    }

    /********************************/
    /*------复选框级联相关---------*/
    /********************************/
    function SetNodeCheckBoxChange(iNodeID, objNode) {
        ///<summay>
        ///设置复选框选中事件
        ///</summary>
        ///<param name="iNodeID" type="int">节点ID</param>
        ///<param name="objNode" type="object">节点JSON对象</param>
        $("#TreeBySHF_checkbox_" + iNodeID).change(function (e, CascadeType) {
            if ($.isFunction(objDefaultSetting.objCheckBoxSwitchFunName)) {
                objDefaultSetting.objCheckBoxSwitchFunName($(this), objNode);
            }
            var isChecked = $(this).prop("checked")
            if (CascadeType == 1) {
                SetNodeCheckBoxChangeUp(objNode[objDefaultSetting.column.PID]);
            }
            else if (CascadeType == 2) {
                SetNodeCheckBoxChangeDown(iNodeID, isChecked);
            }
            else {
                SetNodeCheckBoxChangeDown(iNodeID, isChecked);
                SetNodeCheckBoxChangeUp(objNode[objDefaultSetting.column.PID]);
            }
        })
    }
    function SetNodeCheckBoxChangeUp(iNodeID) {
        ///<summay>
        ///复选框向上级联
        ///</summary>
        ///<param name="iNodeID" type="int">跟随级联的节点ID</param>
        var isChecked = $("#TreeBySHF_ul_" + iNodeID + " .TreeBySHFCheckBox:checked").length > 0;
        $("#TreeBySHF_checkbox_" + iNodeID).prop("checked", isChecked).trigger("change", [1]);
    }
    function SetNodeCheckBoxChangeDown(iNodeID, isChecked) {
        ///<summay>
        ///复选框向下级联
        ///</summary>
        ///<param name="iNodeID" type="int">当前操作的节点ID</param>
        ///<param name="isChecked" type="bool">当前操作的节点的选中状态</param>
        $("#TreeBySHF_ul_" + iNodeID + " .TreeBySHFCheckBox").each(function () {
            $(this).prop("checked", isChecked).trigger("change", [2]);
        })
    }
    /********************************/
    /*------复选框级联相关---------*/
    /********************************/


    function SetNodeClick(iNodeID, objNode) {
        ///<summary>
        ///设置节点的点击事件
        ///</summary>
        ///<param name="iNodeID" type="int">节点的NodeID</param>
        ///<param name="objNode" type="object">节点JSON对象</param>
        $("#TreeBySHF_a_" + iNodeID).click(function () {
            $("#TreeBySHF_img_" + iNodeID).click();
            //alert(objNode[objDefaultSetting.column.NODENAME]);
            if (objDefaultSetting.isChangeColorOnClick) {
                $("#TreeBySHF_ul_" + objDefaultSetting.iRootPID + " a.Selected").removeClass("Selected");
                $(this).addClass("Selected");
            }
            if ($.isFunction(objDefaultSetting.objClickFunName)) {
                objDefaultSetting.objClickFunName($(this), objNode);
            }
        })
    }
    function SetNodeExpandClose(objImg, iNodeID) {
        ///<summary>
        ///设置节点的点击展开关闭事件，如果有子节点则设置，没有则节点不设置
        ///</summary>
        ///<param name="objImg" type="object">节点的图标</param>
        ///<param name="iNodeID" type="int">节点的ID</param>

        objImg.addClass("hasChildren");
        objImg.click(function () {
            var iIMAGEPATHLength = IMAGEPATH.length;
            var strAttrSrc = $(this).attr("src");
            var strImageName = strAttrSrc.substr(iIMAGEPATHLength, 3);
            var strNodeStatus = strAttrSrc.substr(iIMAGEPATHLength + 3, 1);
            if (strNodeStatus == "Y") {
                $("#TreeBySHF_ul_" + iNodeID).hide();
                $(this).attr("src", IMAGEPATH + strImageName + "N.gif");
            }
            else {
                $("#TreeBySHF_ul_" + iNodeID).show();
                $(this).attr("src", IMAGEPATH + strImageName + "Y.gif");
            }
        })
    }
    function SetCheckType(iCheckType) {
        ///<summary>
        ///设置树的选中按钮显示方式
        ///如果是0，则不显示
        ///如果是1，显示CheckBox
        ///如果是2，显示Radio
        ///</summary>
        ///<param name="iCheckType" type="int">状态标识</param>
        switch (iCheckType) {
            case 1:
                $(".TreeBySHFRadio").hide();
                $(".TreeBySHFCheckBox").show();
                break;
            case 2:
                $(".TreeBySHFCheckBox").hide();
                $(".TreeBySHFRadio").show();
                break;
            default:
                $(".TreeBySHFCheckBox,.TreeBySHFRadio").hide();
                break;
        }
    }
    function SetIsExpansionNode(isExpansion) {
        ///<summary>
        ///设置树的初始展开状态
        ///</summary>
        ///<param name="iExpandStatus" value="bool">true表示全部展开,false表示全部关闭</param>
        if (!isExpansion) {
            $(".hasChildren").click();
        }
    }
})(jQuery);
