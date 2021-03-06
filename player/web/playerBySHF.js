﻿/*!
 *PlayerBySHF v1.1.3
 *Author:盛浩峰
 *Date:2014-05-12
 *http://www.cnblogs.com/iamshf
 *http://wonder-world.appspot.com
 *增加为播放器添加canplaythrough事件
*/
;
(function ($, window, document, undefined) {
    var isProcessBarDraging = false;

    function onSilverlightError(sender, args) {
        var appSource = "";
        if (sender != null && sender != 0) {
            appSource = sender.getHost().Source;
        }

        var errorType = args.ErrorType;
        var iErrorCode = args.ErrorCode;

        if (errorType == "ImageError" || errorType == "MediaError") {
            return;
        }

        var errMsg = "Silverlight 应用程序中未处理的错误 " + appSource + "\n";

        errMsg += "代码: " + iErrorCode + "    \n";
        errMsg += "类别: " + errorType + "       \n";
        errMsg += "消息: " + args.ErrorMessage + "     \n";

        if (errorType == "ParserError") {
            errMsg += "文件: " + args.xamlFile + "     \n";
            errMsg += "行: " + args.lineNumber + "     \n";
            errMsg += "位置: " + args.charPosition + "     \n";
        }
        else if (errorType == "RuntimeError") {
            if (args.lineNumber != 0) {
                errMsg += "行: " + args.lineNumber + "     \n";
                errMsg += "位置: " + args.charPosition + "     \n";
            }
            errMsg += "方法名称: " + args.methodName + "     \n";
        }

        throw new Error(errMsg);
    }


    function initPlayer(options) {
        loadPlayerContent(options);
        $("#MediaBySHFContainer" + options.playerId).css({
            "width": options.width + "px", "height": options.height + $("#MediaControllerContainer" + options.playerId).height() + 10 + "px"
        });
        $("#MediaPlayerContainer" + options.playerId).css({ "width": options.width + "px", "height": options.height + "px", "margin": "0 auto" });

        $("#ProcessBar" + options.playerId).css({
            "width": (options.width * 0.8) - $("#MediaControllerLeft" + options.playerId).width() - $("#MediaControllerRight" + options.playerId).width() - $("#ProcessBarContainer" + options.playerId).width()
        });
        $("#ProcessBarSliderContainer" + options.playerId).css({
            "width": $("#ProcessBarContainer" + options.playerId).width() - (parseFloat($("#ProcessBarSliderContainer" + options.playerId).css("left")) * 2) - $("#ProcessSlider" + options.playerId).width()
        });
    }

    function loadPlayerContent(options) {
        var htmlMedia = "<div class=\"MediaBySHFContainer\" id=\"MediaBySHFContainer" + options.playerId + "\">";
        //播放器组件(Silverlight Or Html5(audio,video))容器
        htmlMedia += "<div class=\"MediaPlayerContainer\" id=\"MediaPlayerContainer" + options.playerId + "\"></div>";

        //播放器控制部分
        htmlMedia += "<div class=\"MediaControllerContainer\" id=\"MediaControllerContainer" + options.playerId + "\">";

        //控制器左边部分，暂停、播放、停止按钮部分
        htmlMedia += "<div class=\"MediaControllerLeft\" id=\"MediaControllerLeft" + options.playerId + "\">";
        htmlMedia += "<input type=\"button\" class=\"btnControl btnControlPauseing\" id=\"btnControlPlay" + options.playerId + "\" />";
        htmlMedia += "<input type=\"button\" class=\"btnControl btnControlStop\" id=\"btnControlStop" + options.playerId + "\" />";
        htmlMedia += "</div>";
        //控制器左边部分，暂停、播放、停止按钮部分

        //进度条部分
        htmlMedia += "<div class=\"ProcessBarContainer\" id=\"ProcessBarContainer" + options.playerId + "\">";
        htmlMedia += "<div class=\"ProcessBarCommon ProcessBarLeft\" id=\"ProcessBarLeft" + options.playerId + "\"></div>";
        htmlMedia += "<div class=\"ProcessBar\" id=\"ProcessBar" + options.playerId + "\"></div>";
        htmlMedia += "<div class=\"ProcessBarCommon ProcessBarRight\" id=\"ProcessBarRight" + options.playerId + "\"></div>";
        htmlMedia += "<div class=\"ProcessBarSliderContainer\" id=\"ProcessBarSliderContainer" + options.playerId + "\"><div class=\"ProcessSlider\" id=\"ProcessSlider" + options.playerId + "\"></div></div>";
        htmlMedia += "</div>";
        //进度条部分

        //控制器右边部分，音量和播放状态
        htmlMedia += "<div class=\"MediaControllerRight\" id=\"MediaControllerRight" + options.playerId + "\">";
        //音量控制部分
        htmlMedia += "<div class=\"VolumeControlContainer\" id=\"VolumeControlContainer" + options.playerId + "\">";
        htmlMedia += "<input type=\"button\" class=\"btnControl btnControlVolume\" id=\"btnControlVolume" + options.playerId + "\" />";

        htmlMedia += "<div class=\"VolumeBarContainer\" id=\"VolumeBarContainer" + options.playerId + "\">"
        htmlMedia += "<div class=\"VolumeBar\" id=\"VolumeBar" + options.playerId + "\"></div>";
        htmlMedia += "<div class=\"VolumeSliderContainer\" id=\"VolumeSliderContainer" + options.playerId + "\"><div class=\"VolumeSlider\" id=\"VolumeSlider" + options.playerId + "\"></div></div>";
        htmlMedia += "</div>";

        htmlMedia += "</div>";
        //状态栏
        htmlMedia += "<div class=\"MediaStatus\" id=\"MediaStatus" + options.playerId + "\"></div>";
        htmlMedia += "</div>";
        //控制器右边部分，音量和播放状态

        htmlMedia += "</div>";
        //播放器控制部分
        htmlMedia += "</div>";

        options.parentElement.innerHTML += htmlMedia;
    }

    function addControlEvent(objPlayer) {
        $("#btnControlPlay" + objPlayer.options.playerId).click(function () {
            if ($(this).hasClass("btnControlPauseing")) {
                objPlayer.play();
            }
            else if ($(this).hasClass("btnControlPlaying")) {
                objPlayer.pause();
            }
        });
        $("#btnControlStop" + objPlayer.options.playerId).click(function () {
            objPlayer.stop();
        });
        setControlsVisibility(objPlayer);

        //$("#VolumeBar" + objPlayer.options.playerId + "").hide();
        $("#btnControlVolume" + objPlayer.options.playerId).hover(
            function () {
                $("#VolumeBarContainer" + objPlayer.options.playerId + "").css({ "z-index": "10", "visibility": "visible" });
                $("#VolumeBarContainer" + objPlayer.options.playerId).hover(
                    function () { },
                    function () {
                        $("#VolumeBarContainer" + objPlayer.options.playerId + "").css({ "z-index": -10, "visibility": "hidden" });
                    }
                );
            },
            function () {
            }
        );
        $("#VolumeSlider" + objPlayer.options.playerId).dragBySHF({
            isLockX: true,
            isLimit: true,
            minTop: parseFloat($("#VolumeSlider" + objPlayer.options.playerId).css("top")) - parseFloat($("#VolumeSliderContainer" + objPlayer.options.playerId).height()),
            maxTop: parseFloat($("#VolumeSliderContainer" + objPlayer.options.playerId).height()) - parseFloat($("#VolumeSlider" + objPlayer.options.playerId).css("top")),
            funDraging: function () {
                objPlayer.volume(1 - (parseFloat($("#VolumeSlider" + objPlayer.options.playerId).css("top")) / parseFloat($("#VolumeSliderContainer" + objPlayer.options.playerId).height())));
            }
        });
        $("#ProcessSlider" + objPlayer.options.playerId).dragBySHF({
            isLockY: true,
            isLimit: true,
            minLeft: 0,
            maxLeft: function () { return parseFloat($("#ProcessBarSliderContainer" + objPlayer.options.playerId).width()); },
            funStart: function () { isProcessBarDraging = true; },
            funStop: function () {
                objPlayer.currentTime(parseFloat($("#ProcessSlider" + objPlayer.options.playerId).css("left")) / parseFloat($("#ProcessBarSliderContainer" + objPlayer.options.playerId).width()) * objPlayer.duration());
                isProcessBarDraging = false;
            }
        });
    }

    function setControlsVisibility(objPlayer) {
        ///<summary>
        ///设置是否显示播放器的控制按钮
        ///如果不显示则移除默认的一些事件，以节约资源
        ///</summary>
        ///<param name="objPlayer" type="object">播放器对象</param>
        ///<param name="isShow" type="bool">是否显示</param>
        if (objPlayer.options.isShowControls) {
            objPlayer.addEvent(objPlayer.eventHandler.TimeUpdate, "MediaTimeUpdate" + objPlayer.options.playerId, "");
            objPlayer.addEvent(objPlayer.eventHandler.Ended, "MediaEnded" + objPlayer.options.playerId, "");
            if (objPlayer.eventHandler.CurrentStateChanged) {
                objPlayer.addEvent(objPlayer.eventHandler.CurrentStateChanged, "MediaCurrentStateChanged" + objPlayer.options.playerId, "");
            }
        }
        else {
            objPlayer.removeEvent(objPlayer.eventHandler.TimeUpdate, "MediaTimeUpdate" + objPlayer.options.playerId);
            objPlayer.removeEvent(objPlayer.eventHandler.CurrentStateChanged, "MediaCurrentStateChanged" + objPlayer.options.playerId);
        }
    }

    function createEvent(objPlayer) {
        if (!window["MediaTimeUpdate" + objPlayer.options.playerId]) {
            window["MediaTimeUpdate" + objPlayer.options.playerId] = function () {
                (!isProcessBarDraging) && $("#ProcessSlider" + objPlayer.options.playerId).css("left", (objPlayer.currentTime() / objPlayer.duration() * 100) + "%");
            }
        }
        if (!window["MediaEnded" + objPlayer.options.playerId]) {
            window["MediaEnded" + objPlayer.options.playerId] = function () {
                objPlayer.stop();
            }
        }
        if (!window["MediaCurrentStateChanged" + objPlayer.options.playerId]) {
            window["MediaCurrentStateChanged" + objPlayer.options.playerId] = function () {
                $("#MediaStatus" + objPlayer.options.playerId).text(objPlayer.getMediaElement().getCurrentState);
            }
        }
    }


    function configControls(objPlayer) {
        addControlEvent(objPlayer);


    }

    function playerLoaded(objPlayer, funReady) {
        $.isFunction(funReady) && funReady();
        createEvent(objPlayer);
        configControls(objPlayer);
    }


    var playerHtml5 = function (options, elePlayer) {
        var _this = this;
        initPlayer(options);

        this.getMediaElement = function () {
            return elePlayer;
        };
        this.ready = function (funReady) {
            document.getElementById("MediaPlayerContainer" + options.playerId).appendChild(elePlayer);
            elePlayer.setAttribute("width", "100%");
            elePlayer.setAttribute("height", "100%");
            playerLoaded(_this, funReady);
        };
    };
    var playerSilverlight = function (options) {
        var _this = this;
        var eleMedia;
        initPlayer(options);

        this.getMediaElement = function () {
            return eleMedia;
        };
        this.ready = function (funReady) {
            document.getElementById("MediaPlayerContainer" + options.playerId).innerHTML += Silverlight.createObjectEx({
                //document.body.innerHTML += Silverlight.createObjectEx({
                source: "ClientBin/SLPlayerPlugin.xap",
                id: "slMedia" + options.playerId,
                properties: {
                    width: "100%",
                    height: "100%",
                    version: "5.0.61118.0",
                    background: "transparent",
                    autoUpgrade: "true",
                    windowless: "true",
                    enableHtmlAccess: "true",
                    //allowHtmlPopupWindow:"true",
                    alert: "您的电脑未安装Silverlight或者版本过低，请安装最新版本！"
                },
                events: {
                    onError: onSilverlightError,
                    onLoad: function (plugIn, userContext, sender) {
                        //注1：使用Microsoft Ajax Minifier生成min文件时会忽略后两个参数，需手动添加
                        //注2：跨域引用时无法访问到sender
                        //objMediaElement = sender.getHost().Content.HtmlPage;
                        if (plugIn) {
                            eleMedia = document.getElementById(plugIn.id).Content.SLPlayerPluginPage;
                            //ConfigMediaPlayer(_this);
                            playerLoaded(_this, funReady);
                        }
                    }
                },
                context: ""
            });
        };
    };

    var playerPrototype = {
        options: {},
        eventHandler: {
            "Ended": "ended",
            "TimeUpdate": "timeupdate"
        },
        eventList: [],
        play: function () {
            this.getMediaElement().play();
            $("#btnControlPlay" + this.options.playerId).removeClass("btnControlPauseing").addClass("btnControlPlaying");
        },
        pause: function () {
            this.getMediaElement().pause();
            $("#btnControlPlay" + this.options.playerId).removeClass("btnControlPlaying").addClass("btnControlPauseing");
        },
        stop: function () {
            var elePlayer = this.getMediaElement();
            if (this.options.eleTagName === "object") {
                elePlayer.stop();
            }
            else {
                elePlayer.pause();
                elePlayer.currentTime = 0;
            }
            $("#btnControlPlay" + this.options.playerId).removeClass("btnControlPlaying").addClass("btnControlPauseing");
        },
        setMedia: function (url) {
            this.getMediaElement().src = url;
            this.getMediaElement().load();
        },
        autoplay: function (isAutoplay) {
            (isAutoplay != null) && (isAutoplay != undefined) && (this.getMediaElement().autoplay = isAutoplay);
            this.getMediaElement().load();
            return this.getMediaElement().autoplay;
        },
        volume: function (volume) {
            (volume != null) && (volume != undefined) && (this.getMediaElement().volume = volume);
            return this.getMediaElement().volume;
        },
        reload: function () {
            this.getMediaElement().load();
        },
        currentTime: function (second) {
            /*(this.getMediaElement().readyState > 0) && */(second != undefined) && (second != null) && (this.getMediaElement().currentTime = second);
            return this.getMediaElement().currentTime;
        },
        duration: function () {
            return this.getMediaElement().duration;
        },
        addEvent: function (eventType, funName, params) {
            if (!this.eventList[funName]) {
                this.eventList[funName] = function () { window[funName](params); }
                if (this.options.eleTagName === "object") {
                    this.getMediaElement().addEvent(eventType, funName, params);
                }
                else {
                    this.getMediaElement().addEventListener(eventType, this.eventList[funName]);
                }
            }
        },
        removeEvent: function (eventType, funName) {
            if (this.eventList[funName]) {
                if (this.options.eleTagName === "object") {
                    this.getMediaElement().removeEvent(eventType, funName);
                }
                else {
                    this.getMediaElement().removeEventListener(eventType, this.eventList[funName]);
                }
                delete this.eventList[funName];
            }
        },
        showControls: function (isShow) {
            this.options.isShowControls = isShow;
            setControlsVisibility(this);
        }
    };


    function getPlayer(options) {
        var objPlayer;
        var elePlayer = document.createElement(options.mediaType);
        if (elePlayer != null && elePlayer.canPlayType && elePlayer.canPlayType(options.mediaCodeType)) {
            options.eleTagName = options.mediaType;

            playerHtml5.prototype = playerPrototype;
            objPlayer = new playerHtml5(options, elePlayer);

            objPlayer.options = options;
        }
        else if (Silverlight.isInstalled("5.0")) {
            options.eleTagName = "object";
            playerSilverlight.prototype = playerPrototype;
            objPlayer = new playerSilverlight(options);

            objPlayer.options = options;
            objPlayer.eventHandler.CurrentStateChanged = "currentStateChanged";
        }
        else {
            options.failed();
        }
        return objPlayer;
    }
    $.extend({
        PlayerBySHF: {
            create: function (options) {
                ///<summary>
                ///创建多媒体对象
                ///</summary>
                ///<params type="json" name="settings">初始化设置参数</params>
                ///<return>多媒体对象</return>
                var objPlayer;
                var defaults = {
                    parentElement: document.body, //包含多媒体的父级对象
                    playerId: new Date().getTime(),
                    mediaType: "audio",//媒体类型(video|audio)
                    mediaCodeType: "audio/mpeg",
                    isShowControls: true,//是否显示播放器控制按钮
                    width: 320,//视频的宽（不包含控制栏）
                    height: 176,//视频的高（不包含控制栏）
                    failed: function () {
                        alert("您的浏览器不支持播放此多媒体，请使用IE9.0以上浏览器或者安装最新版Microsoft Silverlight插件");
                    }//创建失败时的方法
                };
                if ($("#MediaBySHFContainer" + defaults.playerId).length > 0) {
                    defaults.playerId = new Date().getTime();
                }
                var settings = $.extend({}, defaults, options);

                return getPlayer(settings);
            }
        }
    });
}(jQuery, window, document, undefined));
