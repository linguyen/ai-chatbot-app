import React, { useEffect, useMemo, useState } from 'react'

type Props = {
  initialCode?: string
  onClose?: () => void
}

const detectLocalIPs = async (): Promise<string[]> => {
  const ips: Set<string> = new Set()
  // Attempt WebRTC candidate trick (may be restricted by browser)
  try {
    // @ts-ignore
    const pc = new RTCPeerConnection({ iceServers: [] })
    pc.createDataChannel('')
    pc.onicecandidate = (e: any) => {
      if (!e.candidate) return
      const parts = e.candidate.candidate.split(' ')
      for (const p of parts) {
        // rudimentary IP detection
        if (/^[0-9]{1,3}(\.[0-9]{1,3}){3}$/.test(p)) ips.add(p)
      }
    }
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    // give ICE some time
    await new Promise((r) => setTimeout(r, 500))
    pc.close()
  } catch (err) {
    // ignore
  }
  return Array.from(ips)
}

const QRGenerator: React.FC<Props> = ({ initialCode = '', onClose }) => {
  const [code, setCode] = useState(initialCode)
  const [host, setHost] = useState(window.location.hostname)
  const [port, setPort] = useState(window.location.port)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fullUrl = useMemo(() => {
    const p = port ? `:${port}` : ''
    return `${window.location.protocol}//${host}${p}/chat/${encodeURIComponent(code)}`
  }, [host, port, code])

  useEffect(() => {
    let cancelled = false
    const gen = async () => {
      try {
        const QRCode = (await import('qrcode')).default || (await import('qrcode'))
        const dataUrl = await QRCode.toDataURL(fullUrl, { margin: 1 })
        if (!cancelled) setQrDataUrl(dataUrl)
      } catch (err: any) {
        setError(err?.message || String(err))
      }
    }
    if (code) gen()
    else setQrDataUrl(null)
    return () => {
      cancelled = true
    }
  }, [fullUrl, code])

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      setError('Copy failed')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="rounded-lg bg-base-100 p-4 shadow-lg w-[360px]">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-lg font-semibold">Generate QR for Chat</h3>
          <button className="btn btn-sm btn-ghost" onClick={onClose}>Close</button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm">Chat code</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} className="input input-bordered" placeholder="abc123" />

          <label className="text-sm">Host (replace with your LAN IP for phone scanning)</label>
          <div className="flex gap-2">
            <input value={host} onChange={(e) => setHost(e.target.value)} className="input input-bordered flex-1" />
            <input value={port} onChange={(e) => setPort(e.target.value)} className="input input-bordered w-20" placeholder="5173" />
          </div>

          <div className="flex items-center gap-2">
            <button className="btn btn-sm" onClick={async () => {
              const ips = await detectLocalIPs()
              if (ips.length > 0) setHost(ips[0])
              else setError('Could not detect local IP')
            }}>Detect LAN IP</button>
            <button className="btn btn-sm" onClick={() => copy(fullUrl)}>Copy URL</button>
            <button className="btn btn-sm" onClick={() => copy(code)}>Copy Code</button>
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}

          <div className="flex items-center justify-center py-2">
            {qrDataUrl ? <img src={qrDataUrl} alt="QR code" className="w-48 h-48" /> : <div className="text-sm text-muted">Enter a code to generate QR</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRGenerator
