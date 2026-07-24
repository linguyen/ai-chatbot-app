import React, { useEffect, useRef, useState } from 'react'
// jsQR will be dynamically imported for fallback scanning

type QRScannerProps = {
  onDetected: (code: string) => void
  onClose?: () => void
}

const QRScanner: React.FC<QRScannerProps> = ({ onDetected, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    let mounted = true

    if (!('mediaDevices' in navigator)) {
      setError('Camera not supported')
      return
    }

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (!mounted) return
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        // Prefer BarcodeDetector if available
        const Detector = (window as any).BarcodeDetector
        if (Detector) {
          const formats = Detector.getSupportedFormats ? Detector.getSupportedFormats() : ['qr_code']
          const detector = new Detector({ formats: ['qr_code'] })

          const scanWithDetector = async () => {
            try {
              if (!videoRef.current) return
              const detections = await detector.detect(videoRef.current)
              if (detections && detections.length > 0) {
                const raw = detections[0].rawValue || detections[0].raw || ''
                if (raw) {
                  onDetected(raw)
                  stop()
                  return
                }
              }
            } catch (err) {
              // fall through to retry
            }
            rafRef.current = requestAnimationFrame(scanWithDetector)
          }

          rafRef.current = requestAnimationFrame(scanWithDetector)
          return
        }

        // Fallback: use canvas + jsQR if available
        try {
          const jsqrModule = await import('jsqr')
          const jsQR = (jsqrModule as any).default || (jsqrModule as any)

          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          const scanWithCanvas = async () => {
            try {
              if (!videoRef.current || !ctx) return
              const video = videoRef.current
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight
              if (canvas.width === 0 || canvas.height === 0) {
                rafRef.current = requestAnimationFrame(scanWithCanvas)
                return
              }
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
              const code = jsQR(imageData.data, canvas.width, canvas.height)
              if (code && code.data) {
                const raw = code.data
                onDetected(raw)
                // stop stream
                if (rafRef.current) cancelAnimationFrame(rafRef.current)
                if (streamRef.current) {
                  streamRef.current.getTracks().forEach((t) => t.stop())
                  streamRef.current = null
                }
                return
              }
            } catch (err) {
              // ignore and retry
            }
            rafRef.current = requestAnimationFrame(scanWithCanvas)
          }

          rafRef.current = requestAnimationFrame(scanWithCanvas)
          return
        } catch (err) {
          setError('BarcodeDetector API not available and jsQR import failed')
        }
      } catch (err: any) {
        setError(err?.message || String(err))
      }
    }

    start()

    const stop = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      if (videoRef.current) {
        try {
          videoRef.current.pause()
          // @ts-ignore
          videoRef.current.srcObject = null
        } catch {}
      }
    }

    return () => {
      mounted = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [onDetected])

  const stop = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="rounded-lg bg-base-100 p-4 shadow-lg">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <button className="btn btn-sm btn-ghost" onClick={stop}>Close</button>
        </div>
        {error ? (
          <div className="p-4 text-sm text-red-500">{error}</div>
        ) : (
          <video ref={videoRef} className="w-[320px] h-[240px] bg-black" />
        )}
        <div className="mt-2 text-sm text-base-content/70">Point the camera at a QR code.</div>
      </div>
    </div>
  )
}

export default QRScanner
