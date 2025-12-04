import React, { useEffect, useState } from "react";
import CategorySelectorModal from "../../components/Analyst/CategorySelectorModal";
import IncidentSuccessModal from "../../components/Analyst/IncidentSuccessModal"
import {
  createEndUserIncident,
} from "../../services/endUserIncidentService"; // Ensure this function returns incident details

// ----------------------------------------------
// INITIAL FORM STATE
// ----------------------------------------------
const initialFormState = (email = "", name = "", username = "") => ({
  callerName: name,
  callerEmail: email,
  username: username,
  shortDescription: "",
  detailedDescription: "",
  categoryPath: "",
  categoryId: null,
});


const LogIncidentEndUser = ({ userEmail, userName, username, onIncidentSubmitted }) => {
  // -------------------------------
  // FORM STATE
  // -------------------------------
  const [formData, setFormData] = useState(
    initialFormState(userEmail, userName, username)
  );

  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // -------------------------------
  // MODAL STATE <-- NEW
  // -------------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittedIncidentDetails, setSubmittedIncidentDetails] = useState(null);

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setSubmittedIncidentDetails(null); 
  };
  
  // Update form data if userEmail prop changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      callerEmail: userEmail,
      callerName: userName,
      username: username,
    }));
  }, [userEmail, userName, username]);

  // -------------------------------
  // CATEGORY HANDLING
  // -------------------------------
  const [categories, setCategories] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // -------------------------------
  // LOAD CATEGORY TREE (Only runs once on mount)
  // -------------------------------
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("incidentmanagementsystem-backend.railway.internal/api/categories/tree", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Unable to load categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();
  }, []);

  // -------------------------------
  // INPUT HANDLER
  // -------------------------------
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setAttachments(Array.from(files));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // -------------------------------
  // CATEGORY SELECT HANDLER
  // -------------------------------
  const handleCategorySelect = (selectedNode) => {
    setFormData((prev) => ({
      ...prev,
      categoryPath: selectedNode.path,
      categoryId: selectedNode.id,
    }));

    setIsCategoryModalOpen(false);
  };
  
  // -------------------------------
  // SUBMIT HANDLER <-- UPDATED
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.categoryId) {
      alert("Please select a category.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Capture the incident details returned by the API
      const incidentDetails = await createEndUserIncident(formData, attachments);

      // 2. Set details and open the success modal
      setSubmittedIncidentDetails(incidentDetails);
      setIsModalOpen(true); 

      // Reset the form
      setFormData(initialFormState(userEmail, userName, username));
      setAttachments([]);

      // Trigger dashboard refresh
      if (onIncidentSubmitted) onIncidentSubmitted();

    } catch (error) {
      console.error("Incident submission failed:", error);
      alert("Failed to submit incident");
    } finally {
      setIsSubmitting(false);
    }
  };


  // ==========================================================
  // UI
  // ==========================================================
  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Caller Name */}
        <input
          name="callerName"
          placeholder="Your Name"
          className="border p-2 rounded bg-gray-100"
          value={formData.callerName}
          onChange={handleChange}
          readOnly 
          required
        />

        {/* Caller Email */}
        <input
          name="callerEmail"
          placeholder="Email"
          className="border p-2 bg-gray-100 rounded"
          value={formData.callerEmail}
          readOnly
        />

        {/* Short Description */}
        <input
          name="shortDescription"
          placeholder="Short Description"
          className="border p-2 rounded"
          value={formData.shortDescription}
          onChange={handleChange}
          required
        />

        {/* Detailed Description */}
        <textarea
          name="detailedDescription"
          placeholder="Detailed Description"
          className="border p-2 rounded"
          rows={4}
          value={formData.detailedDescription}
          onChange={handleChange}
          required
        />

        {/* CATEGORY PICKER */}
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <div className="flex">
            <input
              type="text"
              value={formData.categoryPath}
              readOnly
              placeholder="Click Select to choose category..."
              className="flex-1 border p-2 bg-gray-100 cursor-pointer rounded"
              onClick={() => setIsCategoryModalOpen(true)}
              required
            />

            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="ml-2 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Select
            </button>
          </div>
        </div>

        {/* ATTACHMENTS */}
        <input
          name="attachments"
          type="file"
          multiple
          onChange={handleChange}
          className="border p-2 rounded"
        />

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Incident"}
        </button>
      </form>

      {/* CATEGORY SELECT MODAL */}
      <CategorySelectorModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSelect={handleCategorySelect}
      />
      
      {/* INCIDENT SUCCESS MODAL <-- NEW */}
      <IncidentSuccessModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        incidentDetails={submittedIncidentDetails}
      />
    </div>
  );
};

export default LogIncidentEndUser;