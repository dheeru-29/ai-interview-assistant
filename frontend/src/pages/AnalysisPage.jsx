import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import SuggestionCard from '../components/SuggestionCard';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Check, Mic, MicOff, Video, RefreshCw } from 'lucide-react';
import { PulseLoader } from 'react-spinners';

const readingPassages = [
  "Describe a challenging project you've worked on and how you overcame the obstacles.",
  "Tell me about a time you had to learn a new technology quickly. How did you approach it?",
  "Explain a complex technical concept to a non-technical audience, for example, how an API works."
];

const RECORDING_DURATION = 15;

const AnalysisPage = () => {
  const { user } = useContext(AuthContext);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const passageRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const [readingPassage, setReadingPassage] = useState('');
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(RECORDING_DURATION);
  
  const [imageBlob, setImageBlob] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  
  const [visualFeedback, setVisualFeedback] = useState(null);
  const [voiceFeedback, setVoiceFeedback] = useState(null);
  const [displayedImage, setDisplayedImage] = useState(null);

  useEffect(() => {
    setReadingPassage(readingPassages[Math.floor(Math.random() * readingPassages.length)]);
    return () => {
      clearInterval(scrollIntervalRef.current);
      clearInterval(countdownIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startCamera = async () => {
     try {
        const streamData = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(streamData);
      } catch (err) {
        setError("Could not access camera/mic. Please check permissions.");
      }
  };

  const handleCaptureImage = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => setImageBlob(blob), "image/jpeg");
  };

  const handleStartRecording = () => {
    if (!stream) return;
    setIsRecording(true);
    setAudioBlob(null);
    if (passageRef.current) passageRef.current.scrollTop = 0;
    setCountdown(RECORDING_DURATION);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    scrollIntervalRef.current = setInterval(() => {
      if (passageRef.current) {
        passageRef.current.scrollTop += 1;
        if (passageRef.current.scrollTop >= passageRef.current.scrollHeight - passageRef.current.clientHeight) {
          clearInterval(scrollIntervalRef.current);
        }
      }
    }, 50);

    const audioChunks = [];
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = event => audioChunks.push(event.data);
    mediaRecorderRef.current.onstop = () => {
      const newAudioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      setAudioBlob(newAudioBlob);
    };
    mediaRecorderRef.current.start();

    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        handleStopRecording();
      }
    }, RECORDING_DURATION * 1000);
  };
  
  const handleStopRecording = () => {
    setIsRecording(false);
    clearInterval(scrollIntervalRef.current);
    clearInterval(countdownIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleAnalyze = async () => {
    if (!imageBlob || !audioBlob) {
      setError("Please capture your image and record your audio before analyzing.");
      return;
    }
    
    setAnalyzing(true);
    setError('');
    setVisualFeedback(null);
    setVoiceFeedback(null);
    setDisplayedImage(URL.createObjectURL(imageBlob));

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    const formData = new FormData();
    formData.append("image", imageBlob, "interview-look.jpg");
    formData.append("audio", audioBlob, "interview-audio.webm");

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/analyze/all`, formData, config);
      setVisualFeedback(data.visualFeedback);
      setVoiceFeedback(data.voiceFeedback);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred during analysis. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };
  
  const handleTryAgain = () => window.location.reload();

  if (analyzing) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-[calc(100vh-120px)]">
         <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <PulseLoader color="hsl(var(--foreground))" size={20} />
         </motion.div>
         <motion.p className="text-lg text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          Analyzing your performance...
         </motion.p>
      </div>
    );
  }

  if (visualFeedback && voiceFeedback) {
    return (
      <motion.div className="text-amber-400 container mx-auto p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className=" text-3xl font-bold text-center mb-8">Your Feedback Report</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
           <div className="flex flex-col items-center gap-4">
              <img src={displayedImage} alt="Analysis snapshot" className="rounded-lg shadow-lg" />
              <Button onClick={handleTryAgain} className="w-full max-w-xs">
                 <RefreshCw className="mr-2 h-4 w-4"/> Analyze Again
              </Button>
           </div>
           <div className="flex flex-col gap-6">
              <SuggestionCard title="Visual Presentation" suggestions={visualFeedback} />
              <SuggestionCard title="Verbal Presentation" suggestions={voiceFeedback} />
           </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="text-amber-300 container mx-auto p-6">
       <h1 className="text-gold-1000 text-3xl font-bold text-center mb-2">Interview Simulator</h1>
       <p className="text-center text-muted-foreground mb-8">Capture your image and record yourself reading the passage below.</p>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Camera /> Visual Check</CardTitle>
              <CardDescription>Position yourself for a professional headshot.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center p-4">
                 {error ? <p className="text-destructive text-center">{error}</p> : 
                    stream ? <video ref={videoRef} autoPlay playsInline muted className="w-full h-full rounded-md" /> : <p className="text-sm text-muted-foreground">Press "Start Camera" to begin</p>
                 }
              </div>
              <div className="mt-auto">
                {!stream && <Button onClick={startCamera} className="w-full border-4 border-slate-700 hover:border-amber-400 py-2 px-4 rounded"><Video className="mr-2 h-4 w-4"/>Start Camera</Button>}
                {stream && !imageBlob && <Button onClick={handleCaptureImage} className="w-full border-4 border-slate-700 hover:border-amber-400 py-2 px-4 rounded"><Camera className="mr-2 h-4 w-4"/>Capture Image</Button>}
                {imageBlob && <p className="text-center text-green-500 font-semibold flex items-center justify-center gap-2"><Check /> Image Captured!</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Mic /> Verbal Check</CardTitle>
              <CardDescription>Read the passage. Recording will stop after {RECORDING_DURATION} seconds.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
               <div ref={passageRef} className="p-4 bg-muted rounded-md mb-4 flex-grow overflow-y-scroll" style={{maxHeight: '140px'}}>
                  <p className="italic text-muted-foreground">{readingPassage}</p>
               </div>
               <div className="mt-auto">
                 {!isRecording && !audioBlob && <Button onClick={handleStartRecording} disabled={!stream} className="w-full border-4 border-slate-700 hover:border-amber-400 py-2 px-4 rounded"><Mic className="mr-2 h-4 w-4"/>Start Recording</Button>}
                 
                 {isRecording && (
                    <Button onClick={handleStopRecording} variant="destructive" className="w-full border-4 border-slate-700 hover:border-amber-400 py-2 px-4 rounded">
                      <MicOff className="mr-2 h-4 w-4"/> Stop Recording ({countdown}s)
                    </Button>
                 )}

                 {audioBlob && !isRecording && <p className="text-center text-green-500 font-semibold mt-4 flex items-center justify-center gap-2"><Check /> Audio Recorded!</p>}
               </div>
            </CardContent>
          </Card>
       </div>

       <div className=" text-amber-50 text-center mt-8">
           <Button onClick={handleAnalyze} className="border-4 border-slate-700 hover:border-amber-400 py-2 px-4 rounded" disabled={!imageBlob || !audioBlob || analyzing} size="lg">
              {analyzing ? "Analyzing..." : "Analyze Both"}
           </Button>
           {error && <p className="text-destructive mt-4">{error}</p>}
       </div>
    </div>
  );
};

export default AnalysisPage;