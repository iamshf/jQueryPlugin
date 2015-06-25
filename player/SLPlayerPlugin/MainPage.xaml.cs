using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;

using System.Windows.Browser;

namespace SLPlayerPlugin
{
    public partial class MainPage : UserControl
    {

        private Dictionary<string, RoutedEventHandler> dicRoutedEventHandler;
        private Dictionary<string, EventHandler> dicEventHandler;

        public MainPage()
        {
            InitializeComponent();
            HtmlPage.RegisterScriptableObject("SLPlayerPluginPage", this);

            dicRoutedEventHandler = new Dictionary<string, RoutedEventHandler>();
            dicEventHandler = new Dictionary<string, EventHandler>();
        }

        /// <summary>
        /// 播放器的引用地址
        /// </summary>
        [ScriptableMember]
        public string src
        {
            set { myPlayer.Source = new Uri(value, UriKind.RelativeOrAbsolute); }
            get { return myPlayer.Source.AbsoluteUri; }
        }
        /// <summary>
        /// 设置或者获取播放器的是否自动播放属性
        /// </summary>
        [ScriptableMember]
        public bool autoplay
        {
            set { myPlayer.AutoPlay = value; }
            get { return myPlayer.AutoPlay; }
        }
        /// <summary>
        /// 开始播放
        /// </summary>
        [ScriptableMember]
        public void play() {
            myPlayer.Play();
        }
        /// <summary>
        /// 暂停播放
        /// </summary>
        [ScriptableMember]
        public void pause() {
            myPlayer.Pause();
        }
        [ScriptableMember]
        public void stop()
        {
            myPlayer.Stop();
        }
        /// <summary>
        /// 载入配置，主要是兼容Html5的load方法
        /// </summary>
        [ScriptableMember]
        public void load() { 
        }
        [ScriptableMember]
        public double volume
        {
            set { myPlayer.Volume = value; }
            get { return myPlayer.Volume; }
        }
        /// <summary>
        /// 当前视频的总时长，以秒计
        /// </summary>
        [ScriptableMember]
        public double duration
        {
            get { return myPlayer.NaturalDuration.TimeSpan.TotalSeconds; }
        }
        /// <summary>
        /// 获取或设置当前媒体的播放位置
        /// </summary>
        [ScriptableMember]
        public double currentTime
        {
            set { if (myPlayer.CanSeek) { myPlayer.Position = TimeSpan.FromSeconds(value); } }
            get { return myPlayer.Position.TotalSeconds; }
        }

        public int readyState
        {
            get { return myPlayer.CanSeek ? 1 : 0; }
        }

        [ScriptableMember]
        public string getCurrentState
        {
            get
            {
                string currentState;
                switch (myPlayer.CurrentState)
                {
                    case MediaElementState.Buffering:
                        currentState = "缓冲中……";
                        break;
                    case MediaElementState.Opening:
                        currentState = "加载中……";
                        break;
                    case MediaElementState.Playing:
                        currentState = "播放中……";
                        break;
                    case MediaElementState.Paused:
                        currentState = "已暂停";
                        break;
                    case MediaElementState.Stopped:
                        currentState = "已停止";
                        break;
                    case MediaElementState.Closed:
                        currentState = "已关闭";
                        break;
                    default:
                        currentState = "";
                        break;
                }
                return currentState;
            }
        }

        #region 播放器事件相关
        private void addDicRoutedEventHandler(string funName, string parameters) 
        {
            dicRoutedEventHandler.Add(funName, (object sender, RoutedEventArgs e) =>
            {
                HtmlPage.Window.Invoke(funName, parameters);
            });
        }

        [ScriptableMember]
        public void addEvent(string eventType,string funName, string parameters)
        {
            switch (eventType)
            { 
                case "ended":
                    addDicRoutedEventHandler(funName, parameters);
                    myPlayer.MediaEnded += dicRoutedEventHandler[funName];
                    break;
                case "currentStateChanged":
                    addDicRoutedEventHandler(funName, parameters);
                    myPlayer.CurrentStateChanged += dicRoutedEventHandler[funName];
                    break;
                case "timeupdate":
                    dicEventHandler.Add(funName, (object sender, EventArgs e) => {
                        HtmlPage.Window.Invoke(funName, parameters);
                    });
                    CompositionTarget.Rendering += dicEventHandler[funName];
                    break;
            }
        }
        [ScriptableMember]
        public void removeEvent(string eventType, string funName)
        {
            switch (eventType)
            {
                case "ended":
                    myPlayer.MediaEnded -= dicRoutedEventHandler[funName];
                    dicRoutedEventHandler.Remove(funName);
                    break;
                case "currentStateChanged":
                    myPlayer.CurrentStateChanged -= dicRoutedEventHandler[funName];
                    dicRoutedEventHandler.Remove(funName);
                    break;
                case "timeupdate":
                    CompositionTarget.Rendering -= dicEventHandler[funName];
                    dicEventHandler.Remove(funName);
                    break;
            }
        }

        #endregion
    }
}