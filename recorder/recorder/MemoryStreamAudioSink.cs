using System;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;

using System.IO;

namespace recorderBySHF
{
    public class MemoryStreamAudioSink : AudioSink
    {
        private MemoryStream stream;
        public MemoryStream AudioData
        {
            get
            {
                return stream;
            }
        }
        private AudioFormat audioFormat;
        public AudioFormat AudioFormat
        {
            get
            {
                return audioFormat;
            }
        }
        protected override void OnFormatChange(AudioFormat audioFormat)
        {
            if (this.audioFormat == null)
            {
                this.audioFormat = audioFormat;
            }
            else
            {
                throw new InvalidOperationException();
            }
            //throw new NotImplementedException();
        }
        protected override void OnCaptureStarted()
        {
            stream = new MemoryStream();
            //throw new NotImplementedException();
        }
        protected override void OnSamples(long sampleTimeInHundredNanoseconds, long sampleDurationInHundredNanoseconds, byte[] sampleData)
        {
            stream.Write(sampleData, 0, sampleData.Length);
            //throw new NotImplementedException();
        }
        protected override void OnCaptureStopped()
        {
            byte[] wavFileHeader = WavFileHelper.GetWavFileHeader(AudioData.Length, AudioFormat);

            MemoryStream wavStream = new MemoryStream();
            wavStream.Write(wavFileHeader, 0, wavFileHeader.Length);
            //throw new NotImplementedException();

            byte[] buffer = new byte[4096];
            int read = 0;
            stream.Seek(0, SeekOrigin.Begin);
            while ((read = stream.Read(buffer, 0, buffer.Length)) > 0)
            {
                wavStream.Write(buffer, 0, read);
            }
            stream = wavStream;
            stream.Seek(0, SeekOrigin.Begin);
        }
    }
}
