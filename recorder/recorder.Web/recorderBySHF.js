/*
 * 录音插件
 * version 1.0.0
 * author: 盛浩锋
 * date:2018-10-11
*/
; (function () {
    var _global;
    var _instance;
    var default_opts = {
        "numberOfChannels": 2, //声道数
        "sampleRate": 44100, //采样率
        "ready": function () { } //成功时执行的方法
    };

    //定义H5录音
    var recorder_h5 = function (opts) {
        var _this = this;
        var params = extend(true, default_opts, opts);
        var buffer_size = 4096;
        var trunks;
        var audioCtx;
        var source;
        var script;
        var media_stream;
        var player;

        _this.state = "initializing";
        _this.ready = function (fn) {
            isFunction(fn) && fn();
            _this.state = "initialized";
        }
        _this.start = function () {
            _this.stopplay();
            navigator.mediaDevices.getUserMedia({ "audio": true }).then(function (ms) {
                navigator.permissions && navigator.permissions.query && navigator.permissions.query({ "name": "microphone" }).then(function (result) {
                    if (result.state == "prompt" || result.state == "denied") {
                        alert("请允许系统调用麦克风权限");
                    }
                    result.addEventListener("change", function () {
                        if (result.state == "prompt" || result.state == "denied") {
                            alert("请允许系统调用麦克风权限");
                        }
                    });
                }, function (err) {
                    alert("请确认已经打开系统麦克风权限，如已允许，请忽略！");
                });
                media_stream = ms;
                if (_global.AudioContext) {
                    audioCtx = new _global.AudioContext({ "smaple": params.sampleRate });
                }
                else {
                    audioCtx = new _global.webkitAudioContext({ "smaple": params.sampleRate });
                }
                source = audioCtx.createMediaStreamSource(ms);
                script = audioCtx.createScriptProcessor(buffer_size, params.numberOfChannels, params.numberOfChannels);
                trunks = initTrunks(params);
                script.addEventListener("audioprocess", function (e) {
                    for (var i = 0, l = e.inputBuffer.numberOfChannels; i < l; i++) {
                        var tmp = trunks[i];
                        var tmp_length = tmp.length;
                        trunks[i] = new Float32Array(tmp_length + buffer_size);
                        trunks[i].set(tmp);
                        trunks[i].set(e.inputBuffer.getChannelData(i), tmp_length);
                    }
                });
                source.connect(script);
                script.connect(audioCtx.destination);
                _this.state = "recording";
            }, function (err) {
                alert(err.name + ":" + err.message);
            });
        }
        _this.stop = function () {
            if (_this.state == "recording") {
                source.disconnect();
                script.disconnect();
                for (var i = 0, l = media_stream.getTracks().length; i < l; i++) {
                    media_stream.getTracks()[i].stop();
                }
            }
            _this.state == "stoping";
        }
        _this.play = function (trunk_data) {
            _this.stop();
            var buffer_data = trunk_data ? trunk_data : trunks;
            //var wav = createWav(trunks);
            //document.getElementById("au").setAttribute("src", URL.createObjectURL(new Blob([wav], { "type": "audio/wav" })));
            player = audioCtx.createBufferSource();
            var buffer = audioCtx.createBuffer(params.numberOfChannels, buffer_data[0].length, params.sampleRate);

            for (var i = 0, l = buffer_data.length; i < l; i++) {
                if (buffer.copyToChannel) {
                    buffer.copyToChannel(buffer_data[i], i, 0);
                }
                else {
                    var tmp_channelbuffer = buffer.getChannelData(i);
                    tmp_channelbuffer.set(buffer_data[i]);
                }
            }
            player.buffer = buffer;
            player.connect(audioCtx.destination);
            player.start();
            _this.state == "playing";
        }
        _this.stopplay = function () {
            _this.state == "playing" && player.stop();
        }
        _this.get = function (type) {
            return type && type == "wav" ? createWav(trunks, params) : trunks;
        }
    }

    function initTrunks(params) {
        var trunks = [];
        for (var i = 0; i < params.numberOfChannels; i++) {
            trunks[i] = new Float32Array();
        }
        return trunks;
    }
    function createWav(trunks, params) {
        var buffer = new ArrayBuffer(44 + (trunks.length * trunks[0].length * 2));
        var view = new DataView(buffer);

        writeUTFBytes(view, 0, 'RIFF');//RIFF
        view.setUint32(4, 36 + (trunks.length * trunks[0].length * 2), true);//Length
        writeUTFBytes(view, 8, 'WAVE');
        writeUTFBytes(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, params.numberOfChannels, true);
        view.setUint32(24, params.sampleRate, true);
        view.setUint32(28, params.sampleRate * params.numberOfChannels * 2 , true);//samplerate * numchannels * bitspersample /8
        view.setUint16(32, params.numberOfChannels * 2, true);//numchannels * bitspersample / 8
        view.setUint16(34, 16, true);
        writeUTFBytes(view, 36, "data");
        view.setUint32(40, trunks.length * trunks[0].length * 2, true);
        for (var i = 0, l = trunks.length; i < l; i++) {
            for (var x = 0, xl = trunks[i].length; x < xl; x++) {
                view.setInt16(44 + (((params.numberOfChannels * x) + i) * 2), (trunks[i][x] < 0 ? trunks[i][x] * 0x8000 : trunks[i][x] * 0x7fff), true);
            }
        }
        return buffer;
    }
    function writeUTFBytes(view, offset, string) {
        for (var i = 0, l = string.length; i < l; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }





    //定义silverlight录音
    var recorder_silverlight = function (opts) {
        var _this = this;
        var params = extend(true, default_opts, opts);
        var sl_plugin;
        var id;

        _this.state = "initializing";
        _this.ready = function (fn) {
            //document.getElementById("MediaPlayerContainer" + options.playerId).innerHTML += Silverlight.createObjectEx({
            document.body.innerHTML += Silverlight.createObjectEx({
                source: params.path + "ClientBin/recorderBySHF.xap",
                id: "slMedia" + Math.round(Math.random() * 100000000000),
                properties: {
                    width: "1px",
                    height: "1px",
                    version: "5.0.61118.0",
                    background: "transparent",
                    autoUpgrade: "true",
                    windowless: "true",
                    enableHtmlAccess: "true",
                    allowHtmlPopupWindow:"true",
                    alert: "您的电脑未安装Silverlight或者版本过低，请安装最新版本！"
                },
                events: {
                    onError: onSilverlightError,
                    onLoad: function (plugIn, userContext, sender) {
                        //注1：使用Microsoft Ajax Minifier生成min文件时会忽略后两个参数，需手动添加
                        //注2：跨域引用时无法访问到sender
                        //sl_plugin = sender.getHost().Content.HtmlPage;
                        if (plugIn) {
                            _this.state = "initialized";
                            sl_plugin = document.getElementById(plugIn.id).Content.SL_RecorderBySHF;
                            id = plugIn.id;
                            isFunction(fn) && fn();
                        }
                    }
                },
                context: ""
            });
        }
        _this.start = function () {
            _this.stopplay();
            if (!sl_plugin.querypermission()) {
                var width = document.documentElement.clientWidth;
                var height = document.documentElement.clientHeight;
                document.getElementById(id).setAttribute("style", "width:" + width + "px;height:" + height + "px;left:0;top:0;position:absolute;z-index:1000;background:rgba(204,204,204,0.6);");
                sl_plugin.requestpermission();
            }
            else {
                sl_plugin.start();
                _this.state = "recording";
            }
        }
        _this.stop = function () {
            _this.state == "recording" && sl_plugin.stop();
            _this.state == "stoping";
        }
        _this.play = function (v) {
            _this.stop();

            v ? sl_plugin.play(v) : sl_plugin.play();
            _this.state = "playing";
        }
        _this.get = function () {
            return sl_plugin.get();
        }
        _this.stopplay = function () {
            _this.state == "playing" && sl_plugin.stopplay();
        }
    }
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

        var errMsg = "Unhandled Error in Silverlight Application " + appSource + "\n";

        errMsg += "Code: " + iErrorCode + "    \n";
        errMsg += "Category: " + errorType + "       \n";
        errMsg += "Message: " + args.ErrorMessage + "     \n";

        if (errorType == "ParserError") {
            errMsg += "File: " + args.xamlFile + "     \n";
            errMsg += "Line: " + args.lineNumber + "     \n";
            errMsg += "Position: " + args.charPosition + "     \n";
        }
        else if (errorType == "RuntimeError") {
            if (args.lineNumber != 0) {
                errMsg += "Line: " + args.lineNumber + "     \n";
                errMsg += "Position: " + args.charPosition + "     \n";
            }
            errMsg += "MethodName: " + args.methodName + "     \n";
        }

        throw new Error(errMsg);
    }




    function getRecorder(opts) {
        if (navigator.getUserMedia || (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            if (navigator.mediaDevices === undefined) {
                navigator.mediaDevices = {};
            }
            if (navigator.mediaDevices.getUserMedia == undefined) {
                navigator.mediaDevices.getUserMedia = function (constraints) {
                    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                    if (!getUserMedia) {
                        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                    }
                    return new Promise(function (resolve, reject) {
                        getUserMedia.call(navigator, constraints, resolve, reject);
                    });
                }
            }
            _instance = new recorder_h5();
            //return new recorder_h5(opts);
        }
        else {
            if (!_global.Silverlight) {
                var sl_script = document.createElement("script");
                sl_script.src = opts.path + "Silverlight.js";
                document.body.appendChild(sl_script);

                if (sl_script.readyState) {
                    sl_script.addEventListener("readystatechange", function () {
                        if (script.readyState == "loaded" || script.readyState == "complete") {
                            checkSilverlight(opts);
                        }
                    });
                }
                else {
                    sl_script.addEventListener("load", function () {
                        checkSilverlight(opts);
                    });
                }
            }
        }
    }
    function checkSilverlight(opts) {
            if (Silverlight.isInstalled()) {
                _instance = new recorder_silverlight(opts);
                //return new recorder_silverlight(opts);
            }
            isFunction(opts.notSupport) ? opts.notSupport() : alert("如果您使用的是IE浏览器，请安装先安装微软Silverlight插件或者使用Chrome或Firefox浏览器以支持录音功能");
    }

    function recorderBySHF() { }
    recorderBySHF.prototype = {
        "ready": function ( opts) {
            //recorder = this;
            //getRecorder(opts);
            alert("a");
        },
        "create": function () {
            return _instance;
        }
    }


    //暴漏插件对象给全局对象
    _global = (function () { return this || (0, eval)('this'); }());
    if (!("recorderBySHF" in _global)) {
        //_global.recorderBySHF = function (opts) {
        //    return getRecorder(opts);
        //}        
        _global.recorderBySHF = new recorderBySHF();;
    }

    /*公共方法*/
    function isObjFunc(name) {
        var toString = Object.prototype.toString
        return function () {
            return toString.call(arguments[0]) === '[object ' + name + ']'
        }
    }

    function isFunction(obj) {
        return Object.prototype.toString.call(obj) === "[object Function]";
    }
    function extend() {
        var isObject = isObjFunc('Object'),
            isArray = isObjFunc('Array'),
            isBoolean = isObjFunc('Boolean');
        var index = 0, isDeep = false, obj, copy, destination, source, i
        if (isBoolean(arguments[0])) {
            index = 1
            isDeep = arguments[0]
        }
        for (i = arguments.length - 1; i > index; i--) {
            destination = arguments[i - 1]
            source = arguments[i]
            if (isObject(source) || isArray(source)) {
                for (var property in source) {
                    obj = source[property]
                    if (isDeep && (isObject(obj) || isArray(obj))) {
                        copy = isObject(obj) ? {} : []
                        var extended = extend(isDeep, copy, obj)
                        destination[property] = extended
                    } else {
                        destination[property] = source[property]
                    }
                }
            } else {
                destination = source
            }
        }
        return destination
    }
}());