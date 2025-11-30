import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { api } from "../../lib/api";
import { useNavigate } from "react-router-dom";

export default function CreateCharge() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    chargeMonth: "",
    dueDate: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.title || !formData.amount || !formData.chargeMonth) {
      setError("Please fill in all required fields.");
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/payments/charges/create", formData);
      
      if (response.success) {
        setSuccess(`Charge created successfully! Assigned to ${response.assignedCount || 0} residents.`);
        // Reset form
        setFormData({
          title: "",
          description: "",
          amount: "",
          chargeMonth: "",
          dueDate: ""
        });
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 2000);
      }
    } catch (err) {
      console.error("Error creating charge:", err);
      setError(err.message || "Failed to create charge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#c3c5ce]">
      <Navbar />
      <main className="flex-grow pt-40 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h1
            className="text-4xl font-normal text-[#06164a] mb-8 text-center"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Create Monthly Charge
          </h1>

          {error && (
            <div className="rounded-md border border-red-400 bg-red-100 text-red-800 px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md border border-green-400 bg-green-100 text-green-800 px-4 py-3 mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-[#06164a] font-medium mb-2">
                Charge Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a] focus:outline-none focus:ring-2 focus:ring-[#06164a]"
                placeholder="e.g., December 2024 Maintenance"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-[#06164a] font-medium mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a] focus:outline-none focus:ring-2 focus:ring-[#06164a] resize-none"
                placeholder="Enter charge description..."
              />
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-[#06164a] font-medium mb-2">
                Amount (PKR) *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a] focus:outline-none focus:ring-2 focus:ring-[#06164a]"
                placeholder="Enter amount"
              />
            </div>

            {/* Charge Month */}
            <div>
              <label htmlFor="chargeMonth" className="block text-[#06164a] font-medium mb-2">
                Charge Month (YYYY-MM) *
              </label>
              <input
                type="month"
                id="chargeMonth"
                name="chargeMonth"
                value={formData.chargeMonth}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a] focus:outline-none focus:ring-2 focus:ring-[#06164a]"
              />
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-[#06164a] font-medium mb-2">
                Due Date (Optional)
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a] focus:outline-none focus:ring-2 focus:ring-[#06164a]"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#06164a] text-white font-semibold rounded-md hover:bg-[#0f335b] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Charge"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-white text-[#06164a] font-semibold rounded-md border border-[#06164a] hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
