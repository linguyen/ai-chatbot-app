import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// theme and icon imports removed (unused)
// QRGenerator moved to ChatPage
import QRScanner from "../../../components/QRScanner";

export const DashboardPage: React.FC = () => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const navigate = useNavigate();

  const handleDetected = (scanned: string) => {
    let codeToUse = scanned;
    try {
      const u = new URL(scanned);
      const match = u.pathname.match(/\/chat\/(.+)/);
      if (match && match[1]) {
        codeToUse = decodeURIComponent(match[1]);
      } else {
        const parts = u.pathname.split("/").filter(Boolean);
        if (parts.length > 0) codeToUse = parts[parts.length - 1];
      }
    } catch (e) {
      codeToUse = scanned.trim();
    }
    if (!codeToUse) return;
    setScannerOpen(false);
    navigate(`/chat/${encodeURIComponent(codeToUse)}`);
  };
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 items-center justify-center">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <div className="text-lg text-base-content/70">
          Scan QR Code to access the Chatbot Application
          <div className="mt-2 flex items-center justify-center">
            <div className="mt-2">
              <button onClick={() => setScannerOpen(true)} className="btn btn-outline">Open Camera</button>
            </div>
            {scannerOpen && (
              <QRScanner onDetected={handleDetected} onClose={() => setScannerOpen(false)} />
            )}
          </div>
        </div>
        <div className="text-lg text-base-content/70 my-4 font-bold">OR</div>
        <ChatAccess />
      </div>
    </div>
  )
};

// Theme toggle removed from this page (unused)

const ChatAccess: React.FC = () => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const onAccess = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    // URL-encode the code portion
    const encoded = encodeURIComponent(trimmed);
    navigate(`/chat/${encoded}`);
  };

  // QR generator moved to ChatPage; no local QR modal here

  return (
    <div className="text-lg font-semibold flex-1">
      <div className="text-lg font-semibold flex-1">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter chat code"
          className="file-input file-input-bordered w-full max-w-xs py-2 px-3 text-base-content/70"
        />
      </div>
      <div className="text-sm text-base-content/50 flex flex-col items-center justify-center gap-2">
        <div className="flex gap-2">
          <button onClick={onAccess} className="btn btn-primary mt-2">
            Access
          </button>
        </div>
      </div>
    </div>
  );
};
