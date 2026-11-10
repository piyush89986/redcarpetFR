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
    const qrCanvas = qrCanvasRef.current ? qrCanvasRef.current.querySelector("canvas") : null;
    if (!qrCanvas) return;

    // Create an offscreen high-res canvas (760 x 940 at crisp quality)
    const exportCanvas = document.createElement("canvas");
    const width = 760;
    const height = 940;
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext("2d");

    // 1. Crisp White Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // 2. Rounded Outer Card Border
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 4;
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(18, 18, width - 36, height - 36, 24);
      ctx.stroke();
    } else {
      ctx.strokeRect(18, 18, width - 36, height - 36);
    }

    // 3. Top Branding Pill
    const pillText = "REDCARPET • DIGITAL QUEUE PASS";
    ctx.font = "bold 14px 'Plus Jakarta Sans', system-ui, sans-serif";
    const pillWidth = ctx.measureText(pillText).width + 36;
    const pillX = (width - pillWidth) / 2;
    const pillY = 50;
    ctx.fillStyle = "#FEF2F2";
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillWidth, 34, 17);
      ctx.fill();
    } else {
      ctx.fillRect(pillX, pillY, pillWidth, 34);
    }
    ctx.strokeStyle = "#FECDD3";
    ctx.lineWidth = 1.5;
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillWidth, 34, 17);
      ctx.stroke();
    }

    // Pill text
    ctx.fillStyle = "#DC2626";
    ctx.textAlign = "center";
    ctx.fillText(pillText, width / 2, pillY + 22);

    // 4. Store Name
    ctx.fillStyle = "#111827";
    ctx.font = "bold 34px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.textAlign = "center";
    const storeName = store.name || "Store Pass";
    ctx.fillText(storeName, width / 2, 136);

    // 5. Store Description / Subtitle
    ctx.fillStyle = "#6B7280";
    ctx.font = "500 17px 'Plus Jakarta Sans', system-ui, sans-serif";
    const subtitle = store.description || "Counter & Standee VIP Pass";
    const displaySubtitle = subtitle.length > 55 ? subtitle.slice(0, 52) + "..." : subtitle;
    ctx.fillText(displaySubtitle, width / 2, 168);

    // 6. QR Code Frame / Quiet Zone Box
    const qrBoxSize = 480;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = 200;
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 3;
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 24);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
      ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
    }

    // Draw QR image in center with ample quiet zone padding
    const qrInnerSize = 400;
    const qrInnerX = (width - qrInnerSize) / 2;
    const qrInnerY = qrBoxY + (qrBoxSize - qrInnerSize) / 2;
    ctx.drawImage(qrCanvas, qrInnerX, qrInnerY, qrInnerSize, qrInnerSize);

    // 7. Instructions below QR
    ctx.fillStyle = "#111827";
    ctx.font = "bold 20px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText("SCAN WITH CAMERA TO ENTER QUEUE", width / 2, 730);

    ctx.fillStyle = "#4B5563";
    ctx.font = "500 15px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText("Point your phone camera to get a live VIP digital token", width / 2, 762);

    // 8. 3-Step Guide
    ctx.fillStyle = "#6B7280";
    ctx.font = "600 13px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText("1. SCAN QR   •   2. TRACK LIVE TOKEN   •   3. ENTER ON CALL", width / 2, 810);

    // 9. Footer Watermark
    ctx.fillStyle = "#DC2626";
    ctx.font = "bold 13px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText("REDCARPET VIRTUAL QUEUE SYSTEM", width / 2, 885);

    // Export PNG
    const url = exportCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    const safeName = (store.name || "store").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.download = `${safeName}-qr-pass.png`;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 bg-[#121416]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div
        className="bg-white rounded-[28px] w-full max-w-md p-6 sm:p-7 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95 duration-200 text-center"
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
              includeMargin={true}
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
