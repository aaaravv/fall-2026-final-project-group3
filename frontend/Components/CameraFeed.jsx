import { useEffect, useRef, useState, useCallback } from 'react'
import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from '@mediapipe/tasks-vision'
import './CameraFeed.css'

export default function CameraFeed({ onResults }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const poseLandmarkerRef = useRef(null)
  const animationFrameIdRef = useRef(null)
  const streamRef = useRef(null)

  const [isLoadingModel, setIsLoadingModel] = useState(true)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  // Initialize PoseLandmarker
  useEffect(() => {
    let isCancelled = false

    async function initPoseLandmarker() {
      try {
        setIsLoadingModel(true)
        setErrorMessage(null)

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        )

        if (isCancelled) return

        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        })

        if (isCancelled) {
          poseLandmarker.close()
          return
        }

        poseLandmarkerRef.current = poseLandmarker
        setIsLoadingModel(false)
      } catch (err) {
        console.error('Failed to initialize MediaPipe PoseLandmarker:', err)
        if (!isCancelled) {
          setErrorMessage('Failed to load pose estimation model.')
          setIsLoadingModel(false)
        }
      }
    }

    initPoseLandmarker()

    return () => {
      isCancelled = true
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close()
        poseLandmarkerRef.current = null
      }
    }
  }, [])

  // Predict frame loop
  const predictFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const poseLandmarker = poseLandmarkerRef.current

    if (
      !video ||
      !canvas ||
      !poseLandmarker ||
      video.readyState < 2 ||
      video.paused ||
      video.ended
    ) {
      animationFrameIdRef.current = requestAnimationFrame(predictFrame)
      return
    }

    // Match canvas dimensions to video
    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
    }

    const ctx = canvas.getContext('2d')
    const drawingUtils = new DrawingUtils(ctx)

    const startTimeMs = performance.now()
    const results = poseLandmarker.detectForVideo(video, startTimeMs)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (results.landmarks && results.landmarks.length > 0) {
      for (const landmarks of results.landmarks) {
        drawingUtils.drawLandmarks(landmarks, {
          radius: (data) => DrawingUtils.lerp(data.from?.z || 0, -0.15, 0.1, 5, 1),
          color: '#00FF00',
          fillColor: '#FF0000',
        })
        drawingUtils.drawConnectors(
          landmarks,
          PoseLandmarker.POSE_CONNECTIONS,
          { color: '#00FFFF', lineWidth: 3 }
        )
      }

      if (onResults) {
        onResults(results)
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(predictFrame)
  }, [onResults])

  // Start Camera
  const startCamera = async () => {
    try {
      setErrorMessage(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      })

      // Attempt to set camera zoom to wide/minimum if supported by hardware/browser
      const [videoTrack] = stream.getVideoTracks()
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {}
        if (capabilities.zoom) {
          try {
            await videoTrack.applyConstraints({
              advanced: [{ zoom: capabilities.zoom.min }],
            })
          } catch (e) {
            console.warn('Could not apply hardware zoom constraint:', e)
          }
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsCameraActive(true)
        animationFrameIdRef.current = requestAnimationFrame(predictFrame)
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setErrorMessage(
        'Unable to access camera. Please allow camera permissions.'
      )
    }
  }

  // Stop Camera
  const stopCamera = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current)
      animationFrameIdRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }

    setIsCameraActive(false)
  }

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="camera-container">
      <video
        ref={videoRef}
        className="camera-video"
        playsInline
        muted
        autoPlay
      />
      <canvas ref={canvasRef} className="camera-canvas" />

      {(!isCameraActive || isLoadingModel || errorMessage) && (
        <div className="camera-status-overlay">
          {isLoadingModel && <p>Loading MediaPipe Pose Model...</p>}
          {errorMessage && <p className="camera-error-text">{errorMessage}</p>}
          {!isCameraActive && !isLoadingModel && (
            <p>Camera is currently off. Click below to begin.</p>
          )}
        </div>
      )}

      <div className="camera-controls">
        {!isCameraActive ? (
          <button
            type="button"
            className="camera-btn"
            onClick={startCamera}
            disabled={isLoadingModel}
          >
            {isLoadingModel ? 'Loading...' : 'Start Camera'}
          </button>
        ) : (
          <button
            type="button"
            className="camera-btn stop"
            onClick={stopCamera}
          >
            Stop Camera
          </button>
        )}
      </div>
    </div>
  )
}
