import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";

const PAGE_SIZE = 20;

// --- Helper Components with basic Tailwind/Modern Styling ---
const Th = ({ children, onClick, active, direction }) => (
    <th
        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider 
            ${onClick ? 'cursor-pointer hover:bg-gray-200 transition duration-150' : ''} select-none`}
        onClick={onClick}
    >
        <span className="flex items-center">
            {children}
            {active && (
                <span className="ml-1 text-base">
                    {direction ? '▲' : '▼'}
                </span>
            )}
        </span>
    </th>
);
const Td = ({ children, className }) => <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${className || ''}`}>{children}</td>;


const AllIncidentsPage = () => {
    // --- State Initialization ---
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    // Dropdown data state
    const [dropdowns, setDropdowns] = useState({
        priorities: [], classifications: [], categories: [], workgroups: [], users: [], pendingReasons: [],
        resolutionCodes: [], closureCodes: [],
    });

    // UI state
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterPriority, setFilterPriority] = useState("");
    const [sortField, setSortField] = useState("createdAt");
    const [sortAsc, setSortAsc] = useState(false);
    const [page, setPage] = useState(1);

    // Edit modal state
    const [editingIncident, setEditingIncident] = useState(null);
    const [editValues, setEditValues] = useState({});

    const statusOptions = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];
    
    // --- Utility Functions ---

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    // Helper to safely get nested values for sorting/filtering
    const getNestedValue = (incident, field) => {
        if (field === 'priority') return incident.priority?.name || '';
        if (field === 'category') return incident.category?.name || '';
        if (field === 'assignmentGroup') return incident.assignmentGroup?.name || '';
        if (field === 'assignedTo') return incident.assignedTo?.username || incident.assignedTo?.id || '';
        if (field === 'caller') return incident.caller?.username || incident.caller?.id || '';
        return incident[field];
    };

    // --- Data Fetching Functions (using useCallback for stability) ---

    const fetchIncidents = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const res = await axios.get(
                "https://incidentmanagementsystem-backend.onrender.com/api/admin/incidents/all",
                { withCredentials: true }
            );
            setIncidents(res.data);
        } catch (err) {
            console.error("Error fetching incidents:", err);
            setFetchError("Failed to fetch incidents list.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDropdownData = useCallback(async () => {
        try {
            const [
                priorities, classifications, categories,
                workgroups, analysts, pendingReasons, resolutionCodes, closureCodes
            ] = await Promise.all([
                axios.get('https://incidentmanagementsystem-backend.onrender.com/api/admin/priorities'),
                axios.get('https://incidentmanagementsystem-backend.onrender.com/api/classifications'),
                axios.get('https://incidentmanagementsystem-backend.onrender.com/api/categories/all'), 
                axios.get('https://incidentmanagementsystem-backend.onrender.com/api/workgroups'),
                axios.get('https://incidentmanagementsystem-backend.onrender.com/api/users/analysts'),
                axios.get('https://incidentmanagementsystem-backend.onrender.com/api/pending-reasons'),
                axios.get('https://incidentmanagementsystem-backend.onrender.com/api/resolution-codes'),
                axios.get('https://incidentmanagementsystem-backend.onrender.com/api/admin/closure-codes'),
            ]);
            setDropdowns({
                priorities: priorities.data, classifications: classifications.data, categories: categories.data,
                workgroups: workgroups.data, users: analysts.data, pendingReasons: pendingReasons.data, 
                resolutionCodes: resolutionCodes.data, closureCodes: closureCodes.data,
            });
        } catch (err) {
            console.error('Error loading dropdowns:', err);
            // Non-critical error, no need to stop rendering
        }
    }, []);

    // Fetch data on mount
    useEffect(() => {
        fetchIncidents();
        fetchDropdownData();
    }, [fetchIncidents, fetchDropdownData]);

    // --- UI/Interaction Handlers ---

    // Toggle Sort Function 
    const toggleSort = (field) => {
        if (field === sortField) {
            setSortAsc(prev => !prev);
        } else {
            setSortField(field);
            setSortAsc(true); // Default to ascending when changing field
        }
        setPage(1); // Reset to first page on sort change
    };

    // Delete incident
    const handleDeleteIncident = async (id) => {
        if (!window.confirm("Are you sure you want to delete this incident? This action cannot be undone.")) return;

        try {
            await axios.delete(
                `https://incidentmanagementsystem-backend.onrender.com/api/incidents/${id}`,
                { withCredentials: true }
            );
            alert("Incident deleted successfully!");
            // Optimistically update the list
            setIncidents((prev) => prev.filter((i) => i.id !== id));
        } catch (err) {
            console.error("Error deleting incident:", err);
            alert(`Failed to delete incident: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleEditClick = (incident) => {
        setEditingIncident(incident);
        // Initialize editValues with IDs for related entities
        setEditValues({
            status: incident.status,
            shortDescription: incident.shortDescription,
            detailedDescription: incident.detailedDescription,
            workNotes: incident.workNotes,
            customerComments: incident.customerComments,
            resolutionNotes: incident.resolutionNotes, 
            location: incident.location,
            contactType: incident.contactType,
            
            // Entity IDs - map nested objects to simple IDs (use null for empty fields to handle the payload filtering)
            categoryId: incident.category?.id || null,
            assignmentGroupId: incident.assignmentGroup?.id || null,
            assignedToUserId: incident.assignedTo?.id || null,
            priorityId: incident.priority?.id || null,
            classificationId: incident.classification?.id || null,
            pendingReasonId: incident.pendingReason?.id || null,
            resolutionCodeId: incident.resolutionCode?.id || null,
            closureCodeId: incident.closureCode?.id || null,
        });
    };

    const handleEditChange = (field, value) => {
        setEditValues((prev) => ({ 
            ...prev, 
            [field]: value 
        }));
    };

    const handleSaveEdit = async () => {
        if (!editingIncident) return;
        
        try {
            // Prepare payload: Filter out nulls/empty strings/undefined
            const payload = Object.entries(editValues).reduce((acc, [key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {});

            await axios.put(
                `https://incidentmanagementsystem-backend.onrender.com/api/admin/incidents/${editingIncident.id}`,
                payload,
                { withCredentials: true }
            );
            
            // Re-fetch the entire list to ensure the table is fully up-to-date with server state
            await fetchIncidents(); 
            setEditingIncident(null);
            alert("Incident updated successfully!");
        } catch (err) {
            console.error("Error updating incident:", err);
            alert(`Failed to update incident: ${err.response?.data?.message || err.message || 'Unknown Error'}`);
        }
    };

    // --- Memoized Filtering and Sorting Logic ---
    const filtered = useMemo(() => {
        return incidents
            .filter((i) =>
                searchTerm
                    ? (i.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        i.id?.toString().includes(searchTerm))
                    : true
            )
            .filter((i) => (filterStatus ? i.status === filterStatus : true))
            .filter((i) => (filterPriority ? getNestedValue(i, 'priority') === filterPriority : true))
            .sort((a, b) => {
                const valA = getNestedValue(a, sortField);
                const valB = getNestedValue(b, sortField);

                // Handle Date comparison for 'createdAt'
                if (sortField === "createdAt") {
                    return sortAsc
                        ? new Date(valA) - new Date(valB)
                        : new Date(valB) - new Date(valA);
                }
                
                const strA = (valA || '').toString();
                const strB = (valB || '').toString();

                // Default String comparison
                const comparison = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });
                
                return sortAsc ? comparison : -comparison;
            });
    }, [incidents, searchTerm, filterStatus, filterPriority, sortField, sortAsc]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // --- Render ---

    if (loading) return <p className="p-6 text-lg text-blue-600">Loading incidents and dropdowns...</p>;

    const getStatusClass = (status) => {
        switch (status) {
            case 'NEW': return 'text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded';
            case 'RESOLVED': return 'text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded';
            case 'CLOSED': return 'text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded';
            default: return 'text-gray-800 bg-gray-100 px-2 py-0.5 rounded';
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">All Incidents 📝</h2>
            <p className="mb-4 text-sm text-gray-600">Total filtered incidents: **{filtered.length}**</p>
            
            {fetchError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <p className="font-bold">Data Fetch Error</p>
                    <p>{fetchError}</p>
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-4 p-4 bg-white shadow-md rounded-lg mb-6">
                <input
                    type="text"
                    placeholder="Search by ID or Description"
                    className="border border-gray-300 px-3 py-2 rounded-lg w-72 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                />
                <select
                    className="border border-gray-300 px-3 py-2 rounded-lg"
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                >
                    <option value="">Filter by Status</option>
                    {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
                <select
                    className="border border-gray-300 px-3 py-2 rounded-lg"
                    value={filterPriority}
                    onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}
                >
                    <option value="">Filter by Priority</option>
                    {dropdowns.priorities.map(p => <option key={p.id} value={p.name}>{p.displayName || p.name}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <Th onClick={() => toggleSort("id")} active={sortField === "id"} direction={sortAsc}>ID</Th>
                            <Th onClick={() => toggleSort("createdAt")} active={sortField === "createdAt"} direction={sortAsc}>Logged Time</Th>
                            <Th onClick={() => toggleSort("status")} active={sortField === "status"} direction={sortAsc}>Status</Th>
                            <Th onClick={() => toggleSort("caller")} active={sortField === "caller"} direction={sortAsc}>Caller</Th>
                            <Th onClick={() => toggleSort("assignmentGroup")} active={sortField === "assignmentGroup"} direction={sortAsc}>Workgroup</Th>
                            <Th onClick={() => toggleSort("assignedTo")} active={sortField === "assignedTo"} direction={sortAsc}>Assigned To</Th>
                            <Th>Pending Reason</Th>
                            <Th onClick={() => toggleSort("shortDescription")} active={sortField === "shortDescription"} direction={sortAsc}>Symptom</Th>
                            <Th onClick={() => toggleSort("priority")} active={sortField === "priority"} direction={sortAsc}>Priority</Th>
                            <Th>Location</Th>
                            <Th>Actions</Th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {paged.length === 0 ? (
                            <tr>
                                <Td colSpan="11" className="text-center py-10">No incidents match the current filters or search term.</Td>
                            </tr>
                        ) : (
                            paged.map((inc) => (
                               <tr key={inc.id} className="hover:bg-blue-50 transition duration-100">
                                <Td className="font-medium text-blue-600">{inc.id}</Td>
                                <Td>{formatDate(inc.createdAt)}</Td>
                                <Td><span className={getStatusClass(inc.status)}>{inc.status}</span></Td>
                                <Td>{inc.caller?.username || "-"}</Td>
                                <Td>{inc.assignmentGroup?.name || "-"}</Td>
                                <Td>{inc.assignedTo?.username || "-"}</Td>
                                <Td>{inc.pendingReason?.reasonText || "-"}</Td>
                                <Td className="max-w-xs truncate" title={inc.shortDescription}>{inc.shortDescription || "-"}</Td>
                                <Td>{inc.priority?.displayName || inc.priority?.name || "-"}</Td> 
                                <Td>{inc.location || "-"}</Td>
                                <Td>
                                    <div className="flex gap-2 text-sm font-medium">
                                        <button 
                                            onClick={() => handleEditClick(inc)} 
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteIncident(inc.id)} 
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </Td>
                               </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-lg shadow-md">
                <p className="text-sm text-gray-600">
                    Showing **{(page - 1) * PAGE_SIZE + 1}**–**{Math.min(page * PAGE_SIZE, filtered.length)}** of **{filtered.length}** incidents.
                </p>
                <div className="flex gap-2 items-center">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                    >
                        &larr; Prev
                    </button>
                    <span className="px-2 text-sm font-semibold text-gray-800">Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                    >
                        Next &rarr;
                    </button>
                </div>
            </div>

            {/* Edit Modal (Retained original structure for fields) */}
            {editingIncident && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto transform transition-all duration-300 scale-100">
                        <h3 className="text-2xl font-bold mb-6 border-b pb-2 text-gray-800">
                            Edit Incident **{editingIncident.id}**
                        </h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Row 1: Status & Priority */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
                                    <select
                                        value={editValues.status || ""}
                                        onChange={(e) => handleEditChange("status", e.target.value)}
                                        className="border border-gray-300 rounded-lg w-full px-3 py-2"
                                    >
                                        <option value="">Select Status</option>
                                        {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Priority</label>
                                    <select
                                        value={editValues.priorityId || ""}
                                        onChange={(e) => handleEditChange("priorityId", e.target.value ? Number(e.target.value) : null)}
                                        className="border border-gray-300 rounded-lg w-full px-3 py-2"
                                    >
                                        <option value="">Select Priority</option>
                                        {dropdowns.priorities.map((p) => (<option key={p.id} value={p.id}>{p.displayName || p.name}</option>))}
                                    </select>
                                </div>
                                
                                {/* Row 3: Category & Classification */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Category</label>
                                    <select
                                        value={editValues.categoryId || ""}
                                        onChange={(e) => handleEditChange("categoryId", e.target.value ? Number(e.target.value) : null)}
                                        className="border border-gray-300 rounded-lg w-full px-3 py-2"
                                    >
                                        <option value="">Select Category</option>
                                        {dropdowns.categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Classification</label>
                                    <select
                                        value={editValues.classificationId || ""}
                                        onChange={(e) => handleEditChange("classificationId", e.target.value ? Number(e.target.value) : null)}
                                        className="border border-gray-300 rounded-lg w-full px-3 py-2"
                                    >
                                        <option value="">Select Classification</option>
                                        {dropdowns.classifications.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                                    </select>
                                </div>

                                {/* Row 4: Assignment Group & Assigned To */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Assignment Group</label>
                                    <select
                                        value={editValues.assignmentGroupId || ""}
                                        onChange={(e) => handleEditChange("assignmentGroupId", e.target.value ? Number(e.target.value) : null)}
                                        className="border border-gray-300 rounded-lg w-full px-3 py-2"
                                    >
                                        <option value="">Select Group</option>
                                        {dropdowns.workgroups.map((wg) => (<option key={wg.id} value={wg.id}>{wg.name}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Assigned To</label>
                                    <select
                                        value={editValues.assignedToUserId || ""}
                                        onChange={(e) => handleEditChange("assignedToUserId", e.target.value ? Number(e.target.value) : null)}
                                        className="border border-gray-300 rounded-lg w-full px-3 py-2"
                                    >
                                        <option value="">Select Analyst</option>
                                        {dropdowns.users.map((u) => (<option key={u.id} value={u.id}>{u.username || u.id}</option>))} 
                                    </select>
                                </div>
                                
                                {/* Row 5: Descriptions (Full Width) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Short Description</label>
                                    <input
                                        type="text"
                                        value={editValues.shortDescription || ""}
                                        onChange={(e) => handleEditChange("shortDescription", e.target.value)}
                                        className="border border-gray-300 rounded-lg w-full px-3 py-2"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Detailed Description</label>
                                    <textarea
                                        value={editValues.detailedDescription || ""}
                                        onChange={(e) => handleEditChange("detailedDescription", e.target.value)}
                                        rows="2"
                                        className="border border-gray-300 rounded-lg w-full px-3 py-2"
                                    />
                                </div>
                                
                                {/* Row 6: Location & Contact Type */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Location</label>
                                    <input
                                        type="text"
                                        value={editValues.location || ""}
                                        onChange={(e) => handleEditChange("location", e.target.value)}
                                        className="border border-gray-300 rounded-lg w-full px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Contact Type</label>
                                    <input
                                        type="text"
                                        value={editValues.contactType || ""}
                                        onChange={(e) => handleEditChange("contactType", e.target.value)}
                                        className="border border-gray-300 rounded-lg w-full px-3 py-2"
                                    />
                                </div>
                                
                                {/* Conditional Fields (Full Width) */}
                                {editValues.status === 'PENDING' && (
                                    <div className="md:col-span-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <label className="block text-sm font-bold mb-1 text-yellow-800">Pending Reason</label>
                                        <select
                                            value={editValues.pendingReasonId || ""}
                                            onChange={(e) => handleEditChange("pendingReasonId", e.target.value ? Number(e.target.value) : null)}
                                            className="border border-yellow-300 rounded-lg w-full px-3 py-2 bg-white"
                                        >
                                            <option value="">Select Reason</option>
                                            {dropdowns.pendingReasons.map((r) => (<option key={r.id} value={r.id}>{r.reasonText}</option>))}
                                        </select>
                                    </div>
                                )}

                                {(editValues.status === 'RESOLVED' || editValues.status === 'CLOSED') && (
                                    <div className="md:col-span-2 p-3 bg-green-50 rounded-lg border border-green-200 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-1 text-green-800">Resolution Code</label>
                                            <select
                                                value={editValues.resolutionCodeId || ""}
                                                onChange={(e) => handleEditChange("resolutionCodeId", e.target.value ? Number(e.target.value) : null)}
                                                className="border border-green-300 rounded-lg w-full px-3 py-2 bg-white"
                                            >
                                                <option value="">Select Code</option>
                                                {dropdowns.resolutionCodes.map((r) => (<option key={r.id} value={r.id}>{r.codeName}</option>))}
                                            </select>
                                        </div>
                                        {editValues.status === 'CLOSED' && (
                                            <div>
                                                <label className="block text-sm font-bold mb-1 text-green-800">Closure Code</label>
                                                <select
                                                    value={editValues.closureCodeId || ""}
                                                    onChange={(e) => handleEditChange("closureCodeId", e.target.value ? Number(e.target.value) : null)}
                                                    className="border border-green-300 rounded-lg w-full px-3 py-2 bg-white"
                                                >
                                                    <option value="">Select Code</option>
                                                    {dropdowns.closureCodes.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                                                </select>
                                            </div>
                                        )}
                                        <div className="col-span-full">
                                            <label className="block text-sm font-bold mb-1 text-green-800">Resolution Notes</label>
                                            <textarea
                                                value={editValues.resolutionNotes || ""}
                                                onChange={(e) => handleEditChange("resolutionNotes", e.target.value)}
                                                rows="2"
                                                className="border border-green-300 rounded-lg w-full px-3 py-2 bg-white"
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                {/* Notes (Full Width) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Work Notes (Internal)</label>
                                    <textarea
                                        value={editValues.workNotes || ""}
                                        onChange={(e) => handleEditChange("workNotes", e.target.value)}
                                        rows="2"
                                        className="border border-gray-300 rounded-lg w-full px-3 py-2"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Customer Comments</label>
                                    <textarea
                                        value={editValues.customerComments || ""}
                                        onChange={(e) => handleEditChange("customerComments", e.target.value)}
                                        rows="2"
                                        className="border border-gray-300 rounded-lg w-full px-3 py-2"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 mt-8 border-t pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingIncident(null)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllIncidentsPage;