import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { api } from "../../lib/api";

export default function ReceiptUpload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [dues, setDues] = useState([]);
  const [selectedDue, setSelectedDue] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [transactionTime, setTransactionTime] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch pending dues
  useEffect(() => {
    const fetchDues = async () => {
      try {
        const response = await api.get("/api/payments/dues/my-dues?status=pending");
        if (response.success) {
          setDues(response.dues || []);
        }
      } catch (err) {
        console.error("Error fetching dues:", err);
      }
    };
    fetchDues();
  }, []);

  const onDrop = (acceptedFiles, fileRejections) => {
    setStatus({ type: null, message: "" });
    if (fileRejections?.length) {
      setStatus({ type: "error", message: "Invalid file. Please upload an image or PDF under 5MB." });
      return;
    }
    setFile(acceptedFiles[0] || null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [], "application/pdf": [] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    onDrop,
  });

  const validateForm = () => {
    if (!selectedDue) return "Please select a charge to pay.";
    if (!amount || parseFloat(amount) <= 0) return "Please enter a valid amount.";
    if (!transactionDate) return "Please enter transaction date.";
    if (!transactionTime) return "Please enter transaction time.";
    if (!file) return "Please upload a receipt image or PDF.";
    return null;
  };

  const uploadReceipt = async () => {
    setStatus({ type: null, message: "" });
    const err = validateForm();
    if (err) {
      setStatus({ type: "error", message: err });
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("receipt", file);
      formData.append("amount", amount);
      formData.append("transactionDate", transactionDate);
      formData.append("transactionTime", transactionTime);
      if (remarks) formData.append("remarks", remarks);

      const response = await api.post(`/api/payments/receipts/upload/${selectedDue}`, formData);
      
      if (response.success) {
        setStatus({ type: "success", message: "Receipt uploaded successfully! Awaiting admin verification." });
        // Reset form
        setFile(null);
        setSelectedDue("");
        setAmount("");
        setTransactionDate("");
        setTransactionTime("");
        setRemarks("");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setStatus({ type: "error", message: err.message || "Failed to upload receipt. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const clearUpload = () => {
    setFile(null);
    setStatus({ type: null, message: "" });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h3 className="text-2xl font-semibold text-[#06164a] mb-4">Upload Payment Receipt</h3>
      
      {/* Select Due */}
      <div className="mb-4">
        <label htmlFor="selectedDue" className="block text-[#06164a] mb-2 font-medium">
          Select Charge/Due *
        </label>
        <select
          id="selectedDue"
          value={selectedDue}
          onChange={(e) => setSelectedDue(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a]"
        >
          <option value="">-- Select a pending due --</option>
          {dues.map(due => (
            <option key={due._id} value={due._id}>
              {due.chargeTitle || `Due ${due._id}`} - PKR {due.amount}
            </option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <label htmlFor="amount" className="block text-[#06164a] mb-2 font-medium">
          Amount Paid (PKR) *
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="0.01"
          className="w-full px-4 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a]"
          placeholder="Enter amount paid"
        />
      </div>

      {/* Transaction Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="transactionDate" className="block text-[#06164a] mb-2 font-medium">
            Transaction Date *
          </label>
          <input
            type="date"
            id="transactionDate"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a]"
          />
        </div>
        <div>
          <label htmlFor="transactionTime" className="block text-[#06164a] mb-2 font-medium">
            Transaction Time *
          </label>
          <input
            type="time"
            id="transactionTime"
            value={transactionTime}
            onChange={(e) => setTransactionTime(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a]"
          />
        </div>
      </div>

      {/* Remarks */}
      <div className="mb-4">
        <label htmlFor="remarks" className="block text-[#06164a] mb-2 font-medium">
          Remarks (Optional)
        </label>
        <textarea
          id="remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows="3"
          className="w-full px-4 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a] resize-none"
          placeholder="Any additional notes..."
        />
      </div>

      {/* File Upload */}
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
        <button 
          className="px-4 py-2 bg-[#06164a] text-white rounded-md hover:bg-[#0f335b] disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={uploadReceipt}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Receipt"}
        </button>
        <button 
          className="px-4 py-2 bg-white text-[#06164a] rounded-md border border-[#06164a]" 
          onClick={clearUpload}
          disabled={loading}
        >
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