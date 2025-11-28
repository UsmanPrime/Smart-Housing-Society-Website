import React, { useEffect } from "react";

export default function ReceiptPreviewModal({ isOpen, fileUrl, filename, onClose }) {
  if (!isOpen) return null;

  const isImage = (url = "") => /\.(png|jpe?g|webp|gif)$/i.test(url);
  const isPdf = (url = "") => /\.pdf$/i.test(url);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const downloadReceipt = () => {
    if (!fileUrl) return;
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = filename || "receipt";
    a.target = "_blank";
    a.rel = "noopener";
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative bg-white max-w-4xl w-[94vw] max-h-[90vh] rounded-lg shadow-xl flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold text-[#06164a]">Receipt Preview</h3>
          <button
            onClick={onClose}
            className="text-[#06164a] hover:opacity-70 px-2 py-1 rounded"
          >
            Close
          </button>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <div className="h-[65vh] bg-[#f5f6fa] rounded-md overflow-auto flex items-center justify-center">
            {!fileUrl && <div className="text-[#06164a]">No file to preview.</div>}
            {fileUrl && isImage(fileUrl) && (
              <img
                src={fileUrl}
                alt="Receipt"
                className="max-h-[62vh] object-contain"
                loading="lazy"
              />
            )}
            {fileUrl && isPdf(fileUrl) && (
              <iframe
                title="Receipt PDF"
                src={fileUrl}
                className="w-full h-[62vh] rounded-md"
              />
            )}
            {fileUrl && !isImage(fileUrl) && !isPdf(fileUrl) && (
              <div className="text-[#06164a] text-sm px-4">
                Unsupported format. Download to view.
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              className="px-4 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a] text-sm"
              onClick={downloadReceipt}
            >
              Download
            </button>
            <button
              className="px-4 py-2 rounded-md bg-[#06164a] text-white text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}