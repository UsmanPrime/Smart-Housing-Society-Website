import React, { useState } from "react";
import { useDropzone } from "react-dropzone";

export default function ReceiptUpload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: null, message: "" });

  const onDrop = (acceptedFiles, fileRejections) => {
    setStatus({ type: null, message: "" });
    if (fileRejections?.length) {
      setStatus({ type: "error", message: "Invalid file. Please upload an image under 5MB." });
      return;
    }
    setFile(acceptedFiles[0] || null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    onDrop,
  });

  const validateFile = () => {
    if (!file) return "Please choose a receipt image.";
    return null;
  };

  const uploadReceipt = async () => {
    setStatus({ type: null, message: "" });
    const err = validateFile();
    if (err) {
      setStatus({ type: "error", message: err });
      return;
    }
    // TODO: replace with API call
    await new Promise(r => setTimeout(r, 600));
    setStatus({ type: "success", message: "Receipt uploaded successfully!" });
    setFile(null);
  };

  const clearUpload = () => {
    setFile(null);
    setStatus({ type: null, message: "" });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h3 className="text-2xl font-semibold text-[#06164a] mb-4">Upload Payment Receipt</h3>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition
          ${isDragActive ? "bg-white" : "bg-white/60"} 
          border-[#06164a] text-[#06164a]`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here…</p>
        ) : (
          <p>Drag & drop an image here, or click to select</p>
        )}
      </div>

      {file && (
        <div className="mt-4 flex items-center justify-between bg-white rounded-md p-3 border border-[#06164a]/20">
          <div className="text-[#06164a]">
            <div className="font-medium">{file.name}</div>
            <div className="text-sm">{Math.round(file.size / 1024)} KB</div>
          </div>
          <button className="px-3 py-2 bg-[#06164a] text-white rounded-md hover:bg-[#0f335b]" onClick={clearUpload}>
            Remove
          </button>
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <button className="px-4 py-2 bg-[#06164a] text-white rounded-md hover:bg-[#0f335b]" onClick={uploadReceipt}>
          Upload
        </button>
        <button className="px-4 py-2 bg-white text-[#06164a] rounded-md border border-[#06164a]" onClick={clearUpload}>
          Clear
        </button>
      </div>

      {status.type && (
        <div
          className={
            status.type === "success"
              ? "mt-4 rounded-md border border-green-400 bg-green-100 text-green-800 px-4 py-3"
              : "mt-4 rounded-md border border-red-400 bg-red-100 text-red-800 px-4 py-3"
          }
        >
          {status.message}
        </div>
      )}
    </div>
  );
}