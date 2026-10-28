import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { X, Download, Copy, Check, Save } from "lucide-react";

const StoreQrModal = React.memo(({
  isOpen,
  store,
  qrUrl,
  onUrlChange,
  onSave,
  onClose,
  isSaving = false,
  saveMsg = ""
}) => {
  const qrCanvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !store) return null;

  const handleCopy = () => {
    if (!qrUrl) return;
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownload = () => {
    const canvas = qrCanvasRef.current ? qrCanvasRef.current.querySelector("canvas") : null;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    const safeName = (store.name || "store").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.download = `${safeName}-qr-pass.png`;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 bg-[#121416]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] w-full max-w-md p-6 sm:p-7 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95 duration-200 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 text-left">
          <div>
            <h3 className="text-base font-bold text-gray-900 m-0">{store.name} QR Pass</h3>
            <p className="text-xs text-gray-500 m-0 mt-0.5">Customer queue pass & standee QR</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* QR Canvas Display */}
        <div className="bg-[#fafbfb] p-5 rounded-2xl border border-gray-200 inline-block my-2 shadow-2xs">
          <div ref={qrCanvasRef} className="flex justify-center items-center">
            <QRCodeCanvas
              value={qrUrl || "https://redcarpet.com"}
              size={200}
              level="H"
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>
        </div>

        {saveMsg && (
          <div className="my-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
            {saveMsg}
          </div>
        )}

        {/* Target URL Input */}
        <div className="text-left mt-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Pass Destination URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={qrUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-black outline-none font-mono transition-colors"
            />
            <button
              type="button"
              onClick={handleCopy}
              title="Copy URL"
              className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download size={14} />
            Download PNG
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-full text-xs font-semibold bg-[#111215] hover:bg-gray-800 text-white flex items-center gap-1.5 cursor-pointer shadow-md transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {isSaving ? "Saving..." : "Save Link"}
          </button>
        </div>
      </div>
    </div>
  );
});

export default StoreQrModal;
