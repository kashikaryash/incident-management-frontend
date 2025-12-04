import React, { useState, useEffect } from "react";
import { FaEye, FaSort, FaRedo, FaSearch } from "react-icons/fa";
import api from "../../services/axios";
import Swal from "sweetalert2";


const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
});

const IncidentsIRaised = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "id", direction: "descending" });

    // ------------------------------------------
    // 🔹 Fetch Incidents Raised by the User
    // ------------------------------------------
    useEffect(() => {
        fetchMyIncidents();
    }, []);

    const fetchMyIncidents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get("/api/incidents/incidents-i-raised");
            setIncidents(response.data || []);
            Toast.fire({ icon: "success", title: "Incidents refreshed" });
        } catch (err) {
            console.error("Failed to fetch incidents:", err);
            setError("Could not load your incidents. Please try again.");
            Toast.fire({ icon: "error", title: "Failed to load incidents" });
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------------
    // 🔹 Sorting Logic
    // ------------------------------------------
    const sortedIncidents = React.useMemo(() => {
        let sortableItems = [...incidents];

        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key] || "";
                const bValue = b[sortConfig.key] || "";

                if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [incidents, sortConfig]);

    const requestSort = (key) => {
        let direction = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <FaSort className="text-gray-400" size={10} />;
        return sortConfig.direction === "ascending" ? "▲" : "▼";
    };

    // ------------------------------------------
    // 🔹 Searching / Filtering
    // ------------------------------------------
    const filteredAndSortedIncidents = React.useMemo(() => {
        return sortedIncidents.filter((incident) =>
            incident.id?.toString().includes(searchTerm) ||
            incident.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            incident.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            incident.priorityName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [sortedIncidents, searchTerm]);

    // ------------------------------------------
    // 🔹 Table Header Config (matches actual DTO)
    // ------------------------------------------
    const headers = [
        { key: "id", label: "Ticket ID" },
        { key: "status", label: "Status" },
        { key: "priorityName", label: "Priority" },
        { key: "shortDescription", label: "Description" },
        { key: "assignedTo", label: "Assigned To" },
        { key: "actions", label: "Actions", sortable: false },
    ];

    const getStatusClass = (status) => {
        switch ((status || "").toLowerCase()) {
            case "new":
                return "bg-green-100 text-green-800 border-green-300";
            case "in_progress":
            case "in progress":
                return "bg-blue-100 text-blue-800 border-blue-300";
            case "resolved":
                return "bg-purple-100 text-purple-800 border-purple-300";
            case "closed":
                return "bg-gray-100 text-gray-800 border-gray-300";
            default:
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
        }
    };

    // ------------------------------------------
    // 🔹 Component Render
    // ------------------------------------------
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Incidents I Raised 📝</h1>

            {/* Controls */}
            <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow-sm border">
                <button
                    onClick={fetchMyIncidents}
                    className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
                >
                    <FaRedo className={`mr-2 ${loading ? "animate-spin" : ""}`} size={12} />
                    Refresh
                </button>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search incidents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-72 p-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            {headers.map((h) => (
                                <th
                                    key={h.key}
                                    onClick={() => h.sortable !== false && requestSort(h.key)}
                                    className="px-6 py-3 text-left font-semibold text-gray-600 uppercase cursor-pointer"
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{h.label}</span>
                                        {h.sortable !== false && <span>{getSortIcon(h.key)}</span>}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-100">
                        {/* Loading */}
                        {loading && (
                            <tr>
                                <td colSpan={headers.length} className="py-12 text-center text-gray-500">
                                    <FaRedo className="animate-spin inline mr-2" /> Loading incidents...
                                </td>
                            </tr>
                        )}

                        {/* Error */}
                        {error && !loading && (
                            <tr>
                                <td colSpan={headers.length} className="py-12 text-center text-red-500">
                                    {error}
                                </td>
                            </tr>
                        )}

                        {/* Empty */}
                        {!loading && !error && filteredAndSortedIncidents.length === 0 && (
                            <tr>
                                <td colSpan={headers.length} className="py-12 text-center text-gray-500">
                                    No incidents found.
                                </td>
                            </tr>
                        )}

                        {/* Rows */}
                        {!loading &&
                            !error &&
                            filteredAndSortedIncidents.map((incident) => (
                                <tr key={incident.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-semibold text-blue-600">{incident.id}</td>

                                    <td className="px-6 py-3">
                                        <span className={`px-3 py-1 rounded-full text-xs border ${getStatusClass(incident.status)}`}>
                                            {incident.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-3">{incident.priorityName}</td>

                                    <td className="px-6 py-3 max-w-sm truncate">{incident.shortDescription}</td>

                                    <td className="px-6 py-3">{incident.assignedTo || "Unassigned"}</td>

                                    <td className="px-6 py-3">
                                        <button className="text-blue-600 hover:text-blue-800">
                                            <FaEye size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IncidentsIRaised;
