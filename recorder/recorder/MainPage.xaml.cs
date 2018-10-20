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
using System.IO;
using System.Windows.Automation.Peers;
using System.Windows.Automation.Provider;

namespace recorderBySHF
{
    public partial class MainPage : UserControl
    {
        private MemoryStreamAudioSink audioSink;
        private CaptureSource capture;
        private IDictionary<string, MemoryStream> _dicAudioSink = new Dictionary<string, MemoryStream>();
        public MainPage()
        {
            InitializeComponent();
            HtmlPage.RegisterScriptableObject("SL_RecorderBySHF", this);
        }
        //新代码
        [ScriptableMember]
        public void start() {
            if (CaptureDeviceConfiguration.AllowedDeviceAccess)
            {
                if (audioSink == null)
                {
                    capture = new CaptureSource();
                    capture.AudioCaptureDevice = CaptureDeviceConfiguration.GetDefaultAudioCaptureDevice();
                    audioSink = new MemoryStreamAudioSink();
                    audioSink.CaptureSource = capture;
                }
                else
                {
                    audioSink.CaptureSource.Stop();
                }
                audioSink.CaptureSource.Start();
            }
        }
        [ScriptableMember]
        public void stop() {
            audioSink.CaptureSource.Stop();
        }
        [ScriptableMember]
        public void play(WaveMSS.WaveMediaStreamSource wavMss)
        {
            if (!object.Equals(wavMss, null))
            {
                myPlayer.SetSource(object.Equals(wavMss, null) ? new WaveMSS.WaveMediaStreamSource(audioSink.AudioData) : wavMss);
                myPlayer.Play();
            }
        }
        [ScriptableMember]
        public void play()
        {
            if (!object.Equals(audioSink, null) && !object.Equals(audioSink.AudioData, null))
            {
                myPlayer.SetSource(new WaveMSS.WaveMediaStreamSource(audioSink.AudioData));
                myPlayer.Play();
            }
        }
        [ScriptableMember]
        public void stopplay() {
            myPlayer.Stop();
        }
        [ScriptableMember]
        public bool querypermission() {
            return CaptureDeviceConfiguration.AllowedDeviceAccess || CaptureDeviceConfiguration.RequestDeviceAccess();
        }
        [ScriptableMember]
        public void requestpermission() {
            PermissionRequest permissionrequest = new PermissionRequest();
            permissionrequest.Closed += (object sender, EventArgs e) =>
            {
                if (!(bool)permissionrequest.DialogResult)
                {
                    MessageBox.Show("请允许系统调用麦克风权限");
                }
                else {
                    MessageBox.Show("已授权，请点击录音按钮重新开始录音");
                }
                HtmlPage.Window.Eval("document.getElementById('" + HtmlPage.Plugin.Id + "').removeAttribute('style')");
            };
            permissionrequest.Show();
        }



        [ScriptableMember]
        public WaveMSS.WaveMediaStreamSource get() {
            return object.Equals(audioSink, null) || object.Equals(audioSink.AudioData, null) ? null : new WaveMSS.WaveMediaStreamSource(audioSink.AudioData);
        }





        #region 公共变量
        /// <summary>
        /// 开始录音
        /// </summary>
        [ScriptableMember]
        public event EventHandler StartRecord;
        /// <summary>
        /// 停止录音
        /// </summary>
        [ScriptableMember]
        public event EventHandler StopRecord;
        /// <summary>
        /// 播放录音
        /// </summary>
        [ScriptableMember]
        public event EventHandler PlayRecord;
        /// <summary>
        /// 暂停播放录音
        /// </summary>
        [ScriptableMember]
        public event EventHandler PausePlayRecord;
        #endregion 

        #region 暴露的公共方法
        /// <summary>
        /// 添加录音到指定的集合
        /// </summary>
        /// <param name="strName"></param>
        [ScriptableMember]
        public void AddMediaStream(string strName)
        {
            if (_dicAudioSink.ContainsKey(strName))
            {
                _dicAudioSink[strName] = audioSink.AudioData;
            }
            else
            {
                _dicAudioSink.Add(strName, audioSink.AudioData);
            }
        }
        [ScriptableMember]
        public void SetMedia(string strName)
        {
            if (_dicAudioSink.ContainsKey(strName))
            {
                if (myPlayer.CurrentState != MediaElementState.Paused)
                {
                    SetMediaSource(strName);
                }
                else
                {
                    if (myPlayer.Position.TotalSeconds == myPlayer.NaturalDuration.TimeSpan.TotalSeconds)
                    {
                        SetMediaSource(strName);
                    }
                }
            }
        }
        [ScriptableMember]
        public double GetCurrentPosition()
        {
            return myPlayer.Position.TotalSeconds;
        }
        [ScriptableMember]
        public double GetTotal()
        {
            return myPlayer.NaturalDuration.TimeSpan.TotalSeconds;
        }
        [ScriptableMember]
        public void MediaPause()
        {
            if (myPlayer.CurrentState == MediaElementState.Playing)
            {
                myPlayer.Pause();
            }
        }
        [ScriptableMember]
        public void StopRecordAction()
        {
            if (imgPausePlayRecord.Visibility == Visibility.Visible)
            {
                RecordPlayPause();
            }
            if (imgStopRecord.Visibility == Visibility.Visible)
            {
                RecordStop();
            }
        }
        [ScriptableMember]
        public string GetMediaState()
        {
            return myPlayer.CurrentState.ToString();
        }
        #endregion

        #region 私有方法
        /// <summary>
        /// 设置MediaElement的播放源
        /// </summary>
        /// <param name="strName"></param>
        private void SetMediaSource(string strName)
        {
            WaveMSS.WaveMediaStreamSource wavMss = new WaveMSS.WaveMediaStreamSource(_dicAudioSink[strName]);
            myPlayer.SetSource(wavMss);
        }
        /// <summary>
        /// 开始录音
        /// </summary>
        private void RecordStart()
        {
            if (myPlayer.CurrentState != MediaElementState.Paused && myPlayer.CurrentState != MediaElementState.Closed && myPlayer.CurrentState != MediaElementState.Stopped)
            {
                RecordPlayPause();
            }
            if (CaptureDeviceConfiguration.AllowedDeviceAccess || CaptureDeviceConfiguration.RequestDeviceAccess())
            {
                if (StartRecord != null)
                {
                    StartRecord(this, EventArgs.Empty);
                }
                imgStartRecord.Visibility = Visibility.Collapsed;
                imgStopRecord.Visibility = Visibility.Visible;
                if (audioSink == null)
                {
                    capture = new CaptureSource();
                    capture.AudioCaptureDevice = CaptureDeviceConfiguration.GetDefaultAudioCaptureDevice();
                    audioSink = new MemoryStreamAudioSink();
                    audioSink.CaptureSource = capture;
                }
                else
                {
                    audioSink.CaptureSource.Stop();
                }
                audioSink.CaptureSource.Start();
            }
        }
        /// <summary>
        /// 停止录音
        /// </summary>
        private void RecordStop()
        {
            audioSink.CaptureSource.Stop();
            imgStartRecord.Visibility = Visibility.Visible;
            imgStopRecord.Visibility = Visibility.Collapsed;
            if (StopRecord != null)
            {
                StopRecord(this, EventArgs.Empty);
            }
        }

        /// <summary>
        /// 播放录音
        /// </summary>
        private void RecordPlay()
        {
            if (audioSink.CaptureSource.State == CaptureState.Started)
            {
                RecordStop();
            }
            if (PlayRecord != null)
            {
                PlayRecord(this, EventArgs.Empty);
            }
            myPlayer.Play();
            imgPlayRecord.Visibility = Visibility.Collapsed;
            imgPausePlayRecord.Visibility = Visibility.Visible;
        }
        /// <summary>
        /// 暂停播放录音
        /// </summary>
        private void RecordPlayPause()
        {
            if (PausePlayRecord != null)
            {
                PausePlayRecord(this, EventArgs.Empty);
            }
            myPlayer.Pause();
            imgPlayRecord.Visibility = Visibility.Visible;
            imgPausePlayRecord.Visibility = Visibility.Collapsed;
        }
        #endregion

        #region 录音事件
        /// <summary>
        /// 开始录音
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void imgStartRecord_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            RecordStart();
        }

        /// <summary>
        /// 停止录音
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void imgStopRecord_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            RecordStop();
        }
        #endregion

        #region 播放录音事件
        /// <summary>
        /// 开始播放录音
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void imgPlayRecord_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            RecordPlay();
        }
        /// <summary>
        /// 暂停播放录音
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void imgPausePlayRecord_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            RecordPlayPause();
        }
        #endregion

        private void myPlayer_MediaEnded(object sender, RoutedEventArgs e)
        {
            imgPlayRecord.Visibility = Visibility.Visible;
            imgPausePlayRecord.Visibility = Visibility.Collapsed;
        }

        private void Button_BindingValidationError(object sender, ValidationErrorEventArgs e)
        {

        }
    }
}
