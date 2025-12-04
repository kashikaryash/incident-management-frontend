import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

const PAGE_SIZE = 20;

// Helper component for table header
const Th = ({ children, onClick, active, direction }) => (
    <th 
        className={`border p-2 text-left cursor-pointer select-none ${onClick ? 'hover:bg-gray-200' : ''}`} 
        onClick={onClick}
    >
        {children}
        {active && (direction ? ' ▲' : ' ▼')}
    </th>
);
const Td = ({ children, className }) => <td className={`border p-2 ${className || ''}`}>{children}</td>;


const AllIncidentsPage = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dropdown data state
    const [dropdowns, setDropdowns] = useState({
        priorities: [], 
        //impacts: [], urgencies: [], 
        classifications: [], 
        categories: [], workgroups: [], users: [], pendingReasons: [], 
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

    // 🌟 ADDED: Toggle Sort Function 
    const toggleSort = (field) => {
        if (field === sortField) {
            setSortAsc(prev => !prev);
        } else {
            setSortField(field);
            setSortAsc(true); // Default to ascending when changing field
        }
        setPage(1); // Reset to first page on sort change
    };

    // Fetch all incidents and dropdown data on mount
    useEffect(() => {
        fetchIncidents();
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        try {
            const [
                priorities, 
                //impacts, urgencies, 
                classifications, categories,
                workgroups, analysts, pendingReasons, resolutionCodes, closureCodes
            ] = await Promise.all([
                // Priorities: API endpoint confirmed (incidentmanagementsystem-backend.railway.internal/api/priorities)
                axios.get('incidentmanagementsystem-backend.railway.internal/api/admin/priorities'),
                // axios.get('incidentmanagementsystem-backend.railway.internal/api/impacts'),
                // axios.get('incidentmanagementsystem-backend.railway.internal/api/urgencies'),
                axios.get('incidentmanagementsystem-backend.railway.internal/api/classifications'),
                
                // 🌟 UPDATED: Categories endpoint to /api/categories/all
                axios.get('incidentmanagementsystem-backend.railway.internal/api/categories/all'), 
                
                axios.get('incidentmanagementsystem-backend.railway.internal/api/workgroups'),
                
                axios.get('incidentmanagementsystem-backend.railway.internal/api/users/analysts'),
                
                axios.get('incidentmanagementsystem-backend.railway.internal/api/pending-reasons'),
                axios.get('incidentmanagementsystem-backend.railway.internal/api/resolution-codes'),
                axios.get('incidentmanagementsystem-backend.railway.internal/api/admin/closure-codes'),
            ]);
            setDropdowns({
                priorities: priorities.data, 
                //impacts: impacts.data, urgencies: urgencies.data, 
                classifications: classifications.data, categories: categories.data, 
                workgroups: workgroups.data, users: analysts.data, 
                pendingReasons: pendingReasons.data, resolutionCodes: resolutionCodes.data, 
                closureCodes: closureCodes.data,
            });
        } catch (err) {
            console.error('Error loading dropdowns:', err);
        }
    };

    const fetchIncidents = async () => {
        try {
            const res = await axios.get(
                "incidentmanagementsystem-backend.railway.internal/api/admin/incidents/all",
                { withCredentials: true }
            );
            setIncidents(res.data);
        } catch (err) {
            console.error("Error fetching incidents:", err);
            alert("Failed to fetch incidents");
        } finally {
            setLoading(false);
        }
    };

    // Delete incident
    const handleDeleteIncident = async (id) => {
        if (!window.confirm("Are you sure you want to delete this incident?")) return;

        try {
            await axios.delete(
                `incidentmanagementsystem-backend.railway.internal/api/incidents/${id}`,
                { withCredentials: true }
            );
            alert("Incident deleted successfully!");
            // Optimistically update the list
            setIncidents((prev) => prev.filter((i) => i.id !== id));
        } catch (err) {
            console.error("Error deleting incident:", err);
            alert("Failed to delete incident");
        }
    };

    const filtered = useMemo(() => {
        return incidents
            .filter((i) =>
                searchTerm
                    ? (i.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        i.id?.toString().includes(searchTerm))
                    : true
            )
            .filter((i) => (filterStatus ? i.status === filterStatus : true))
            .filter((i) => (filterPriority ? i.priority?.name === filterPriority : true)) // Use priority.name for filtering
            .sort((a, b) => {
                // Helper to get nested field value for comparison
                const getValue = (incident, field) => {
                    if (field === 'priority' && incident.priority?.name) return incident.priority.name;
                    if (field === 'category' && incident.category?.name) return incident.category.name;
                    return incident[field];
                };

                const valA = getValue(a, sortField);
                const valB = getValue(b, sortField);

                if (sortField === "createdAt") {
                    // Handle Date comparison
                    return sortAsc
                        ? new Date(valA) - new Date(valB)
                        : new Date(valB) - new Date(valA);
                }
                
                // Handle null/undefined during comparison
                if (!valA || !valB) return 0; 
                
                // Default String/Numeric comparison
                return sortAsc
                    ? valA.toString().localeCompare(valB.toString())
                    : valB.toString().localeCompare(valA.toString());
            });
    }, [incidents, searchTerm, filterStatus, filterPriority, sortField, sortAsc]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleEditClick = (incident) => {
        setEditingIncident(incident);
        // Initialize editValues with IDs for related entities to match the AdminIncidentUpdateDto
        setEditValues({
            status: incident.status,
            shortDescription: incident.shortDescription,
            detailedDescription: incident.detailedDescription,
            workNotes: incident.workNotes,
            customerComments: incident.customerComments,
            resolutionNotes: incident.resolutionNotes, 
            location: incident.location,
            contactType: incident.contactType,
            
            // Entity IDs - map nested objects to simple IDs
            categoryId: incident.category?.id || '',
            assignmentGroupId: incident.assignmentGroup?.id || '',
            assignedToUserId: incident.assignedTo?.id || '',
            priorityId: incident.priority?.id || '',
            // impactId: incident.impact?.id || '',
            // urgencyId: incident.urgency?.id || '',
            classificationId: incident.classification?.id || '',
            pendingReasonId: incident.pendingReason?.id || '',
            resolutionCodeId: incident.resolutionCode?.id || '',
            closureCodeId: incident.closureCode?.id || '',
        });
    };

    const handleEditChange = (field, value) => {
        // Handle select fields where the value is the ID, and input fields where value is string
        setEditValues((prev) => ({ 
            ...prev, 
            [field]: value 
        }));
    };

    const handleSaveEdit = async () => {
        try {
            // Prepare payload: Filter out empty strings/nulls for fields the server expects as Long/String
            const payload = Object.entries(editValues).reduce((acc, [key, value]) => {
                // Note: Zero is a valid ID, so check for null/undefined/empty string
                if (value !== '' && value !== null && value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {});

            await axios.put(
                `incidentmanagementsystem-backend.railway.internal/api/admin/incidents/${editingIncident.id}`,
                payload,
                { withCredentials: true }
            );
            await fetchIncidents(); // Refresh the list
            setEditingIncident(null);
            alert("Incident updated successfully!");
        } catch (err) {
            console.error("Error updating incident:", err);
            alert(`Failed to update incident: ${err.response?.data?.message || err.message}`);
        }
    };

    if (loading) return <p className="p-6">Loading incidents...</p>;

    const statusOptions = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];

    return (
        <div className="p-6 min-h-screen">
            <h2 className="text-xl font-bold mb-4">All Incidents 📝</h2>
            <p className="mb-4 text-sm text-gray-600">Total incidents: {incidents.length}</p>

            {/* Filters */}
            <div className="flex gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by ID or Description"
                    className="border px-2 py-1 rounded w-64"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                />
                <select
                    className="border px-2 py-1 rounded"
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                >
                    <option value="">All Status</option>
                    {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
                <select
                    className="border px-2 py-1 rounded"
                    value={filterPriority}
                    onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}
                >
                    <option value="">All Priority</option>
                    {/* Using p.name for filtering based on the data structure */}
                    {dropdowns.priorities.map(p => <option key={p.id} value={p.name}>{p.displayName || p.name}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <Th>ID</Th>
                            <Th onClick={() => toggleSort("createdAt")} active={sortField === "createdAt"} direction={sortAsc}>Logged Time</Th>
                            <Th onClick={() => toggleSort("status")} active={sortField === "status"} direction={sortAsc}>Status</Th>
                            <Th>Caller</Th>
                            <Th onClick={() => toggleSort("assignmentGroup")} active={sortField === "assignmentGroup"} direction={sortAsc}>Workgroup</Th>
                            <Th onClick={() => toggleSort("assignedTo")} active={sortField === "assignedTo"} direction={sortAsc}>Assigned To</Th>
                            <Th>Pending Reason</Th>
                            <Th>Symptom</Th>
                            <Th onClick={() => toggleSort("priority")} active={sortField === "priority"} direction={sortAsc}>Priority</Th>
                            <Th>Location</Th>
                            <Th>Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {paged.map((inc) => (
                           <tr key={inc.id} className="hover:bg-gray-50">
                           <Td>{inc.id}</Td>
                           <Td>{inc.createdAt ? new Date(inc.createdAt).toLocaleString() : "-"}</Td>
                           <Td className={`font-semibold ${inc.status === 'NEW' ? 'text-green-600' : inc.status === 'CLOSED' ? 'text-red-600' : 'text-gray-800'}`}>{inc.status}</Td>
                           <Td>{inc.caller?.username || "-"}</Td>
                           <Td>{inc.assignmentGroup?.name || inc.assignmentGroup || "-"}</Td>
                           <Td>{inc.assignedTo?.username || inc.assignedTo || "-"}</Td>
                           <Td>{inc.pendingReason?.reasonText || inc.pendingReason || "-"}</Td>
                           <Td>{inc.shortDescription || "-"}</Td>
                           <Td>{inc.priority?.displayName || inc.priority?.name || "-"}</Td> 
                           <Td>{inc.location || "-"}</Td>
                           <Td className="flex gap-2">
                               <button onClick={() => handleEditClick(inc)} className="text-blue-600 hover:underline">Edit</button>
                               <button onClick={() => handleDeleteIncident(inc.id)} className="text-red-600 hover:underline">Delete</button>
                           </Td>
                       </tr>
                       
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-600">
                    Showing **{(page - 1) * PAGE_SIZE + 1}**–**{Math.min(page * PAGE_SIZE, filtered.length)}** of **{filtered.length}**
                </p>
                <div className="flex gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span className="px-2">{page} / {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            {editingIncident && (
                <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4 border-b pb-2">
                            Edit Incident #INC-{editingIncident.id}
                        </h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Row 1: Status & Priority */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select
                                        value={editValues.status || ""}
                                        onChange={(e) => handleEditChange("status", e.target.value)}
                                        className="border rounded w-full px-2 py-1"
                                    >
                                        <option value="">Select Status</option>
                                        {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Priority</label>
                                    <select
                                        value={editValues.priorityId || ""}
                                        onChange={(e) => handleEditChange("priorityId", e.target.value ? Number(e.target.value) : null)}
                                        className="border rounded w-full px-2 py-1"
                                    >
                                        <option value="">Select Priority</option>
                                        {dropdowns.priorities.map((p) => (<option key={p.id} value={p.id}>{p.displayName || p.name}</option>))}
                                    </select>
                                </div>
                                
                                {/* Row 2: Impact & Urgency */}
                                {/* <div>
                                    <label className="block text-sm font-medium mb-1">Impact</label>
                                    <select
                                        value={editValues.impactId || ""}
                                        onChange={(e) => handleEditChange("impactId", e.target.value ? Number(e.target.value) : null)}
                                        className="border rounded w-full px-2 py-1"
                                    >
                                        <option value="">Select Impact</option>
                                        {dropdowns.impacts.map((i) => (<option key={i.id} value={i.id}>{i.level}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Urgency</label>
                                    <select
                                        value={editValues.urgencyId || ""}
                                        onChange={(e) => handleEditChange("urgencyId", e.target.value ? Number(e.target.value) : null)}
                                        className="border rounded w-full px-2 py-1"
                                    >
                                        <option value="">Select Urgency</option>
                                        {dropdowns.urgencies.map((u) => (<option key={u.id} value={u.id}>{u.level}</option>))}
                                    </select>
                                </div> */}

                                {/* Row 3: Category & Classification */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <select
                                        value={editValues.categoryId || ""}
                                        onChange={(e) => handleEditChange("categoryId", e.target.value ? Number(e.target.value) : null)}
                                        className="border rounded w-full px-2 py-1"
                                    >
                                        <option value="">Select Category</option>
                                        {dropdowns.categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Classification</label>
                                    <select
                                        value={editValues.classificationId || ""}
                                        onChange={(e) => handleEditChange("classificationId", e.target.value ? Number(e.target.value) : null)}
                                        className="border rounded w-full px-2 py-1"
                                    >
                                        <option value="">Select Classification</option>
                                        {dropdowns.classifications.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                                    </select>
                                </div>

                                {/* Row 4: Assignment Group & Assigned To */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Assignment Group</label>
                                    <select
                                        value={editValues.assignmentGroupId || ""}
                                        onChange={(e) => handleEditChange("assignmentGroupId", e.target.value ? Number(e.target.value) : null)}
                                        className="border rounded w-full px-2 py-1"
                                    >
                                        <option value="">Select Group</option>
                                        {dropdowns.workgroups.map((wg) => (<option key={wg.id} value={wg.id}>{wg.name}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Assigned To</label>
                                    <select
                                        value={editValues.assignedToUserId || ""}
                                        onChange={(e) => handleEditChange("assignedToUserId", e.target.value ? Number(e.target.value) : null)}
                                        className="border rounded w-full px-2 py-1"
                                    >
                                        <option value="">Select Analyst</option>
                                        {/* Use username for display if available, fallback to id */}
                                        {dropdowns.users.map((u) => (<option key={u.id} value={u.id}>{u.username || u.id}</option>))} 
                                    </select>
                                </div>
                                
                                {/* Row 5: Descriptions */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Short Description</label>
                                    <input
                                        type="text"
                                        value={editValues.shortDescription || ""}
                                        onChange={(e) => handleEditChange("shortDescription", e.target.value)}
                                        className="border rounded w-full px-2 py-1"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Detailed Description</label>
                                    <textarea
                                        value={editValues.detailedDescription || ""}
                                        onChange={(e) => handleEditChange("detailedDescription", e.target.value)}
                                        rows="2"
                                        className="border rounded w-full px-2 py-1"
                                    />
                                </div>
                                
                                {/* Row 6: Location & Contact Type */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={editValues.location || ""}
                                        onChange={(e) => handleEditChange("location", e.target.value)}
                                        className="border rounded w-full px-2 py-1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Contact Type</label>
                                    <input
                                        type="text"
                                        value={editValues.contactType || ""}
                                        onChange={(e) => handleEditChange("contactType", e.target.value)}
                                        className="border rounded w-full px-2 py-1"
                                    />
                                </div>
                                
                                {/* Conditional Resolution/Pending Fields (Full Width) */}
                                {editValues.status === 'PENDING' && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1">Pending Reason</label>
                                        <select
                                            value={editValues.pendingReasonId || ""}
                                            onChange={(e) => handleEditChange("pendingReasonId", e.target.value ? Number(e.target.value) : null)}
                                            className="border rounded w-full px-2 py-1"
                                        >
                                            <option value="">Select Reason</option>
                                            {dropdowns.pendingReasons.map((r) => (<option key={r.id} value={r.id}>{r.reasonText}</option>))}
                                        </select>
                                    </div>
                                )}

                                {(editValues.status === 'RESOLVED' || editValues.status === 'CLOSED') && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Resolution Code</label>
                                            <select
                                                value={editValues.resolutionCodeId || ""}
                                                onChange={(e) => handleEditChange("resolutionCodeId", e.target.value ? Number(e.target.value) : null)}
                                                className="border rounded w-full px-2 py-1"
                                            >
                                                <option value="">Select Code</option>
                                                {dropdowns.resolutionCodes.map((r) => (<option key={r.id} value={r.id}>{r.codeName}</option>))}
                                            </select>
                                        </div>
                                        {editValues.status === 'CLOSED' && (
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Closure Code</label>
                                                <select
                                                    value={editValues.closureCodeId || ""}
                                                    onChange={(e) => handleEditChange("closureCodeId", e.target.value ? Number(e.target.value) : null)}
                                                    className="border rounded w-full px-2 py-1"
                                                >
                                                    <option value="">Select Code</option>
                                                    {dropdowns.closureCodes.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                                                </select>
                                            </div>
                                        )}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1">Resolution Notes</label>
                                            <textarea
                                                value={editValues.resolutionNotes || ""}
                                                onChange={(e) => handleEditChange("resolutionNotes", e.target.value)}
                                                rows="2"
                                                className="border rounded w-full px-2 py-1"
                                            />
                                        </div>
                                    </>
                                )}
                                
                                {/* Notes (Full Width) */}
                                <div className="md:col-span-2 mt-2">
                                    <label className="block text-sm font-medium mb-1">Work Notes (Internal)</label>
                                    <textarea
                                        value={editValues.workNotes || ""}
                                        onChange={(e) => handleEditChange("workNotes", e.target.value)}
                                        rows="2"
                                        className="border rounded w-full px-2 py-1"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Customer Comments</label>
                                    <textarea
                                        value={editValues.customerComments || ""}
                                        onChange={(e) => handleEditChange("customerComments", e.target.value)}
                                        rows="2"
                                        className="border rounded w-full px-2 py-1"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingIncident(null)}
                                    className="px-4 py-2 border rounded hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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