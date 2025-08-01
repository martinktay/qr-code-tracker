import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RotateCcw, Smartphone, QrCode } from 'lucide-react';
import jsQR from 'jsqr';

const QRScanner = ({ onScan, onClose, isOpen }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    };
    setIsMobile(checkMobile());

    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async () => {
    try {
      setError(null);
      setScanning(true);

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: isMobile ? 1280 : 640 },
          height: { ideal: isMobile ? 720 : 480 },
          aspectRatio: { ideal: 1.0 }
        }
      });

      streamRef.current = stream;
      setCameraPermission('granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        // Start QR detection after video is ready
        videoRef.current.onloadedmetadata = () => {
          detectQRCode();
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraPermission('denied');
      
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions to scan QR codes.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else if (err.name === 'NotSupportedError') {
        setError('Camera not supported on this device.');
      } else {
        setError('Unable to access camera. Please check permissions and try again.');
      }
      setScanning(false);
    }
  };

  const stopScanning = () => {
    setScanning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const detectQRCode = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for QR detection
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Use jsQR to detect QR codes
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code) {
      // QR code detected!
      console.log('QR Code detected:', code.data);
      onScan(code.data);
      stopScanning();
      return;
    }

    // Continue scanning if no QR code found
    if (scanning) {
      animationFrameRef.current = requestAnimationFrame(detectQRCode);
    }
  };

  const handleManualInput = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const manualCode = formData.get('manualCode');
    if (manualCode.trim()) {
      onScan(manualCode.trim());
    }
  };

  const switchCamera = async () => {
    if (streamRef.current) {
      stopScanning();
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
      startScanning();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-sm w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Mobile-specific instructions */}
        {isMobile && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center mb-2">
              <Smartphone className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Mobile Scanner</span>
            </div>
            <p className="text-xs text-blue-700">
              Point your phone's camera at a QR code. The scanner will automatically detect and read the code.
            </p>
          </div>
        )}

        <div className="relative mb-4">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-64 object-cover"
              playsInline
              muted
              autoPlay
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 opacity-0"
            />
            
            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-blue-500 rounded-lg p-6 relative">
                <div className="w-40 h-40 border-2 border-blue-500 rounded-lg relative">
                  {/* Corner indicators */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-l-4 border-t-4 border-blue-500"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-r-4 border-t-4 border-blue-500"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-l-4 border-b-4 border-blue-500"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-r-4 border-b-4 border-blue-500"></div>
                  
                  {/* Scanning line animation */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500 animate-pulse"></div>
                </div>
              </div>
            </div>

            {scanning && (
              <div className="absolute top-2 right-2">
                <div className="animate-pulse bg-green-500 text-white px-2 py-1 rounded text-xs">
                  Scanning...
                </div>
              </div>
            )}

            {/* Camera switch button (mobile only) */}
            {isMobile && scanning && (
              <button
                onClick={switchCamera}
                className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-2 rounded-full"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {!scanning ? (
            <button
              onClick={startScanning}
              disabled={cameraPermission === 'denied'}
              className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center"
            >
              <Camera className="w-5 h-5 mr-2" />
              {cameraPermission === 'denied' ? 'Camera Access Denied' : 'Start Scanning'}
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center"
            >
              Stop Scanning
            </button>
          )}

          <div className="text-center text-gray-500 text-sm">
            or
          </div>

          <form onSubmit={handleManualInput} className="space-y-3">
            <input
              type="text"
              name="manualCode"
              placeholder="Enter tracking number manually"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="submit"
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 flex items-center justify-center"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Track Parcel
            </button>
          </form>
        </div>

        <div className="mt-4 text-center text-xs text-gray-600 space-y-1">
          <p>Point your camera at a QR code to scan</p>
          <p>Or enter the tracking number manually</p>
          {isMobile && (
            <p className="text-blue-600">Optimized for mobile scanning</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner; 