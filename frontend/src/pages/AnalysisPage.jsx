// frontend/src/pages/AnalysisPage.jsx (Final Corrected Version)
import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PulseLoader } from 'react-spinners';

const AnalysisPage = () => {
  const { user } = useContext(AuthContext); // Removed logout to simplify Header's job
  const videoRef = useRef(null);
  const capturedImageRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [displayedImage, setDisplayedImage] = useState(null);

  useEffect(() => {
    if (!isCameraOpen) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      return;
    }

    async function enableCamera() {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(streamData);
        if (videoRef.current) {
          videoRef.current.srcObject = streamData;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("Could not access the camera. Please check permissions.");
      }
    }
    enableCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen]);


  const analyzeOutfit = async () => {
    if (!videoRef.current || !stream) return;

    setAnalyzing(true);
    setSuggestions([]);
    setError('');
    
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    capturedImageRef.current = canvas.toDataURL('image/jpeg');

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError("Failed to capture image from video stream.");
        setAnalyzing(false);
        return;
      }
      
      const formData = new FormData();
      formData.append("image", blob, "interview-look.jpg");

      try {
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user.token}`,
          },
        };
        
        const { data } = await axios.post("http://localhost:5000/api/analyze", formData, config);
        setSuggestions(data.suggestions || []);
        setDisplayedImage(capturedImageRef.current);
        
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }

      } catch (err) {
        console.error("Analysis error:", err);
        setError("Sorry, an error occurred during analysis. Please try again.");
      } finally {
        setAnalyzing(false);
      }
    }, "image/jpeg");
  };

  // --- THIS IS THE CORRECTED FUNCTION ---
  const handleTryAgain = () => {
    setDisplayedImage(null);
    capturedImageRef.current = null;
    setSuggestions([]);
    setError('');
    // Set camera to false, which resets the component to its initial state
    setIsCameraOpen(false); 
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-3xl md:text-4xl font-bold my-8 text-white text-center">
        🎯 AI Interview Readiness Assistant
      </h1>

      {/* Show the main "Analyze" button when the process is reset */}
      {!isCameraOpen && !displayedImage ? (
        <button
          onClick={() => setIsCameraOpen(true)}
          className="px-6 py-3 rounded-xl shadow-md font-semibold bg-blue-500 hover:bg-blue-600 transition-colors duration-300"
        >
          Analyze My Look
        </button>
      ) : (
        <>
          <div className="relative w-full md:w-2/3 lg:w-1/2 bg-black rounded-2xl overflow-hidden shadow-lg">
            {displayedImage ? (
              <img src={displayedImage} alt="Analysis result" className="w-full h-80 object-cover" />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-80 object-cover"
              />
            )}
            {analyzing && <div className="scanner-line"></div>}
          </div>

          <div className="mt-6 h-[48px] flex items-center justify-center">
            {!analyzing && !displayedImage && (
              <button
                onClick={analyzeOutfit}
                disabled={!stream}
                className="px-6 py-3 rounded-xl shadow-md font-semibold bg-blue-500 hover:bg-blue-600 transition-colors duration-300"
              >
                Get Feedback
              </button>
            )}
          </div>
        </>
      )}

      {error && <p className="text-red-400 mt-4">{error}</p>}
      
      {analyzing && (
        <div className="text-center mt-8">
          <PulseLoader color="#3498db" size={15} />
          <p className="text-gray-400 mt-2 text-sm">AI is thinking...</p>
        </div>
      )}

      {suggestions.length > 0 && !analyzing && (
        <div className="mt-8 w-full md:w-2/3 lg:w-1/2 flex flex-col items-center">
            <div className="w-full bg-gray-800 p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-white">Suggestions:</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                    {suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                    ))}
                </ul>
            </div>
            <button
                onClick={handleTryAgain}
                className="mt-6 px-6 py-3 rounded-xl shadow-md font-semibold bg-gray-600 hover:bg-gray-700 transition-colors duration-300"
            >
                Analyze New Look
            </button>
        </div>
      )}
    </div>
  );
}

export default AnalysisPage;