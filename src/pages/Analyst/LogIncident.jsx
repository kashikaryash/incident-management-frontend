import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import CategorySelectorModal from "../../components/Analyst/CategorySelectorModal";
import IncidentSuccessModal from "../../components/Analyst/IncidentSuccessModal";
import { createIncidentWithFiles } from "../../services/incidentService";

const initialForm = {
    category: "",
    symptom: "",
    description: "",
    attachments: []
};

const LogIncident = () => {
    const [form, setForm] = useState(initialForm);
    const [userDetails, setUserDetails] = useState(null);
    const [categories, setCategories] = useState([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successDetails, setSuccessDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastIncident, setLastIncident] = useState(null);

    // -------------------- CHECK SESSION --------------------
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("incidentmanagementsystem-backend.railway.internal/api/users/me", {
                    credentials: "include",
                });

                if (res.status === 401) throw new Error("Unauthorized");
                if (!res.ok) throw new Error("Failed to fetch user");

                const data = await res.json();

                if (!data.email || data.username === "anonymousUser") {
                    throw new Error("User is anonymous");
                }

                setUserDetails(data);
            } catch (err) {
                Swal.fire({
                    icon: "warning",
                    title: "Not logged in",
                    text: "Please log in to continue.",
                }).then(() => (window.location.href = "/login"));
            }
        };

        fetchUser();
    }, []);

    // -------------------- FETCH CATEGORIES --------------------
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("incidentmanagementsystem-backend.railway.internal/api/categories/tree", {
                    credentials: "include",
                });

                if (!res.ok) throw new Error("Failed to fetch categories");

                const data = await res.json();
                setCategories(data || []);
            } catch (err) {
                console.error("Category fetch failed:", err);
            }
        };

        fetchCategories();
    }, []);

    // -------------------- FORM HANDLERS --------------------
    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "attachments") {
            const validFiles = Array.from(files || []).filter(
                (file) => file.size <= 10 * 1024 * 1024
            );
            if (validFiles.length < (files ? files.length : 0)) {
                Swal.fire("File Too Large", "Files larger than 10MB were skipped.", "error");
            }
            setForm((prev) => ({ ...prev, attachments: validFiles }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleCategorySelect = (selectedNode) => {
        setForm((prev) => ({ ...prev, category: selectedNode.path || selectedNode.name }));
        setIsCategoryModalOpen(false);
    };

    // -------------------- SUBMIT INCIDENT --------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.category || !form.symptom || !form.description) {
            Swal.fire("Required Fields", "Please fill in Category, Symptom, and Description.", "warning");
            return;
        }

        if (!userDetails || userDetails.username === "anonymousUser") {
            Swal.fire("User Error", "You must be logged in to submit incidents.", "error");
            return;
        }

        setLoading(true);

        try {
            const incidentData = {
                createdBy: userDetails.username || userDetails.email,
                createdByEmail: userDetails.email,
                contactNumber: userDetails.phone,
                location: userDetails.location,
                shortDescription: form.symptom,
                detailedDescription: form.description,
                category: form.category
            };

            const response = await createIncidentWithFiles(incidentData, form.attachments);

            if (!response.id) {
                Swal.fire("Success?", "Incident created but missing ID in server response. Check console.", "warning");
                console.warn("create-with-files response:", response);
                return;
            }

            setSuccessDetails({
                incidentId: response.id,
                priority: response.priorityName || "P5",
                serviceWindow: "24/5 Support"
            });

            setIsSuccessModalOpen(true);
            setLastIncident({
                incidentId: response.id,
                shortDescription: form.symptom
            });

            // Reset form
            setForm(initialForm);
            const fileInput = document.getElementById("attachments");
            if (fileInput) fileInput.value = "";

        } catch (err) {
            console.error("Incident Submission Error:", err);
            Swal.fire(
                "Submission Failed",
                err.response?.data?.message || err.message || "Unexpected error occurred.",
                "error"
            );

            if (err.response && err.response.status === 401) {
                setTimeout(() => (window.location.href = "/"), 1000);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!userDetails) {
        return (
            <div className="flex h-screen items-center justify-center text-gray-500">
                Loading session...
            </div>
        );
    }

    // -------------------- RENDER FORM --------------------
    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-16 bg-white shadow-md flex flex-col items-center py-4 space-y-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">IT</div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-4 mb-6 bg-white p-4 rounded shadow-sm">
                    <div>
                        <p className="text-sm text-gray-600">
                            Welcome, <span className="font-bold">{userDetails.name}</span>
                        </p>
                        <p className="text-xs text-gray-500">{userDetails.role}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">{userDetails.email}</p>
                    </div>
                </div>

                {lastIncident && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                        <h2 className="text-green-800 font-bold">Ticket Logged Successfully</h2>
                        <p className="text-sm text-green-700">
                            ID: #{lastIncident.incidentId} - {lastIncident.shortDescription}
                        </p>
                    </div>
                )}

                <h1 className="text-2xl font-semibold mb-6">Log New Incident</h1>

                <form onSubmit={handleSubmit} className="bg-white p-8 shadow-md rounded-lg max-w-4xl mx-auto">
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">
                            Category <span className="text-red-500">*</span>
                        </label>

                        <div className="flex">
                            <input
                                type="text"
                                readOnly
                                value={form.category}
                                className="flex-1 border p-2 rounded-l-md bg-gray-50"
                                placeholder="Click Select..."
                                onClick={() => setIsCategoryModalOpen(true)}
                            />

                            <button
                                type="button"
                                onClick={() => setIsCategoryModalOpen(true)}
                                className="bg-blue-600 text-white px-4 rounded-r-md"
                            >
                                Select
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2">Symptom (Title) *</label>
                        <input
                            type="text"
                            name="symptom"
                            value={form.symptom}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            placeholder="E.g., Email not loading"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2">Detailed Description *</label>
                        <textarea
                            name="description"
                            rows="5"
                            value={form.description}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div className="mb-8">
                        <label className="block mb-2">Attachments (Optional)</label>
                        <input
                            id="attachments"
                            name="attachments"
                            type="file"
                            multiple
                            className="border p-2 rounded"
                            onChange={handleChange}
                        />

                        {form.attachments.length > 0 && (
                            <div className="mt-2">
                                {form.attachments.map((file, idx) => (
                                    <p key={idx} className="text-sm">
                                        • {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 text-white bg-blue-600 rounded-md ${loading ? "opacity-60" : ""}`}
                        >
                            {loading ? "Submitting..." : "Submit Incident"}
                        </button>
                    </div>
                </form>
            </div>

            <CategorySelectorModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                categories={categories}
                onSelect={handleCategorySelect}
            />

            {successDetails && (
                <IncidentSuccessModal
                    isOpen={isSuccessModalOpen}
                    onClose={() => setIsSuccessModalOpen(false)}
                    incidentDetails={successDetails}
                />
            )}
        </div>
    );
};

export default LogIncident;
