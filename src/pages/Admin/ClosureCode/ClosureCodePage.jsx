import React, { useState, useEffect, useRef } from "react";
// axios is imported but not strictly necessary for this mock, but we keep it for realistic structure.
// import axios from "axios"; 

// --- Custom Modal/UI Components (The Fix is applied here) ---

/**
 * Custom Confirmation Modal (Replaces window.confirm)
 */
const ConfirmModal = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-300 scale-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Confirm Action</h3>
                <p className="text-sm text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors shadow-md"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-md"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};


/**
 * Modal for Adding/Editing Closure Codes
 */
const ClosureCodeModal = ({ initial, onSave, onClose }) => {
    // Use initial data or provide defaults for new entry
    const initialData = initial || { name: '', isDefault: false, active: true };
    
    const [name, setName] = useState(initialData.name);
    const [isDefault, setIsDefault] = useState(initialData.isDefault);
    const [active, setActive] = useState(initialData.active);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...initialData, name, isDefault, active });
    };

    return (
        // ✅ FIX APPLIED: Added bg-gray-900 bg-opacity-70 for the dark overlay
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
                <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-800">
                    {initialData.id ? "Edit Closure Code" : "Add New Closure Code"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                            required
                        />
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center">
                            <input
                                id="isDefault"
                                type="checkbox"
                                checked={isDefault}
                                onChange={(e) => setIsDefault(e.target.checked)}
                                className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                            />
                            <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                                Set as Default
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                id="active"
                                type="checkbox"
                                checked={active}
                                onChange={(e) => setActive(e.target.checked)}
                                className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                            />
                            <label htmlFor="active" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                                Active
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors shadow-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/**
 * Custom Message Bar (Replaces window.alert for notifications)
 */
const MessageBar = ({ message, type, onClose }) => {
    if (!message) return null;

    const bgColor = type === 'success' ? 'bg-green-100 border-green-400 text-green-700' :
        type === 'error' ? 'bg-red-100 border-red-400 text-red-700' :
            'bg-yellow-100 border-yellow-400 text-yellow-700';
    
    const icon = type === 'success' ? '✔' : type === 'error' ? '❌' : 'ℹ️';

    return (
        <div className={`fixed bottom-4 right-4 p-4 border-l-4 rounded-lg shadow-xl z-[100] ${bgColor} flex items-center space-x-3 animate-slideIn`}>
            <span className="text-xl">{icon}</span>
            <p className="font-medium text-sm">{message}</p>
            <button 
                onClick={onClose} 
                className="ml-auto text-xl font-bold p-1 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Close notification"
            >
                &times;
            </button>
        </div>
    );
};

/**
 * Placeholder for the Department Sidebar
 */
const DepartmentListPlaceholder = () => {
    const departments = ["Information Technology"];
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState("Information Technology");

    const filteredDepartments = departments.filter(d => 
        d.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        // *** RETAIN BG-WHITE FOR VISIBILITY OF THE SIDEBAR ***
        <div className="w-64 border-r bg-white flex flex-col shadow-lg">
            <h4 className="p-4 text-xs font-extrabold border-b text-gray-600 uppercase tracking-wider">Department Filter</h4>
            <div className="p-3 border-b">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')} 
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    )}
                </div>
            </div>
            <ul className="flex-grow overflow-y-auto">
                {filteredDepartments.map((d, index) => (
                    <li 
                        key={index} 
                        onClick={() => setSelectedDepartment(d)}
                        className={`p-3 text-sm cursor-pointer transition-all duration-150 ${
                            d === selectedDepartment 
                                ? 'bg-sky-100 text-blue-700 font-semibold border-l-4 border-blue-600' 
                                : 'text-gray-700 border-l-4 border-transparent hover:bg-gray-100 hover:border-blue-300'
                        }`}
                    >
                        {d}
                    </li>
                ))}
            </ul>
        </div>
    );
}


// --- Main Component ---

const ClosureCodePage = () => {
    // Mock Data
    const mockCodes = [
        { id: 1167, name: "Auto Closed", isDefault: false, active: true },
        { id: 1194, name: "Auto Deactivated", isDefault: false, active: true },
        { id: 1166, name: "Closed by Scheduler", isDefault: false, active: true },
        { id: 1196, name: "Forgot Password", isDefault: false, active: true },
        { id: 1183, name: "No Resolution Found", isDefault: false, active: true },
        { id: 3, name: "Out of Scope", isDefault: false, active: true },
        { id: 70, name: "Resolved", isDefault: false, active: true },
        { id: 1, name: "Successful", isDefault: true, active: true },
        { id: 1177, name: "Successfully Completed", isDefault: false, active: true },
        { id: 5, name: "Temporary Solution", isDefault: false, active: false },
        { id: 1168, name: "Test", isDefault: false, active: false },
        { id: 2, name: "UnSuccessful", isDefault: false, active: true },
        { id: 9, name: "User not Responding", isDefault: false, active: true },
    ];

    const [codes, setCodes] = useState([]);
    const [includeInactive, setIncludeInactive] = useState(false);
    
    // State for Add/Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCode, setSelectedCode] = useState(null); 
    
    // State for Custom Confirmation Modal
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState(() => () => {}); // Action to execute on confirm
    
    // State for MessageBar (Alert/Notification)
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState('info');
    
    const fileInputRef = useRef(null);

    // Helper function to load/filter data
    const loadCodes = () => {
        // Simulating data fetch and filtering
        const data = mockCodes;
        setCodes(includeInactive ? data : data.filter((c) => c.active));
    };

    useEffect(() => {
        loadCodes();
    }, [includeInactive]);

    // Custom Alert/Confirm replacement
    const showMessage = (msg, type = 'info') => {
        setMessage(msg);
        setMessageType(type);
        // Clear message after 5 seconds
        setTimeout(() => setMessage(null), 5000); 
    };

    const openAdd = () => {
        setSelectedCode(null);
        setShowEditModal(true);
    };

    const openEdit = (code) => {
        setSelectedCode(code);
        setShowEditModal(true);
    };

    const saveCode = (payload) => {
        // Mocking API call and data update
        if (payload.id) {
            // Edit logic
            showMessage(`Closure Code ${payload.id} updated successfully (Simulated).`, 'success');
        } else {
            // Add logic (assign new mock ID)
            showMessage(`New Closure Code added successfully (Simulated).`, 'success');
        }
        setShowEditModal(false);
        // For demonstration, we simply reload (which re-filters the mockCodes)
        loadCodes(); 
    };
    
    // **CORRECTED:** Uses the custom ConfirmModal instead of window.confirm
    const deleteCode = (id) => {
        setConfirmMessage(`Are you sure you want to permanently delete Closure Code ID ${id}? This action cannot be undone.`);
        
        // Define the function that runs if the user clicks 'Delete' in the modal
        setConfirmAction(() => () => {
            // Actual (Simulated) deletion logic
            showMessage(`Closure Code ID ${id} deleted (Simulated).`, 'success');
            // Remove from the local state list
            setCodes(prev => prev.filter(c => c.id !== id));
        });
        
        setShowConfirm(true);
    };

    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // For a real app, you would use FormData and axios here
        // const formData = new FormData();
        // formData.append("file", file);
        // await axios.post("/api/admin/closure-codes/import", formData, { headers: { "Content-Type": "multipart/form-data" } });

        showMessage(`File "${file.name}" imported successfully (Simulated).`, 'success');
        loadCodes();

        // Reset file input for next time
        e.target.value = null; 
    };

    return (
        // *** 1. REMOVED 'h-screen' to be an overlay/section, NOT a full-page app. ***
        // The main container will now flex within its parent element.
        <div className="flex font-sans w-full min-h-[600px] border border-gray-200 rounded-lg shadow-xl"> 
            <style jsx="true">{`
                .animate-slideIn {
                    animation: slideIn 0.5s forwards;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
            
            {/* 1. Left Sidebar (Departments) */}
            <DepartmentListPlaceholder />
            
            {/* 2. Main Content (Table) */}
            {/* Removed 'overflow-auto' to ensure the main scroll is on the table/parent, not here */}
            <div className="flex-grow p-8 flex flex-col">
                
                <h1 className="text-2xl font-extrabold uppercase text-gray-800 mb-6 border-b-4 border-blue-500 pb-2 tracking-wide">
                    Closure Codes Management
                </h1>

                {/* Header/Filter Row - Kept bg-white/shadow for visual grouping */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-inner border border-gray-200">
                        <input
                            type="checkbox"
                            id="includeInactive"
                            checked={includeInactive}
                            onChange={(e) => setIncludeInactive(e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="includeInactive" className="text-sm text-gray-700 font-medium hover:text-blue-600 cursor-pointer transition-colors">
                            Show Inactive Codes
                        </label>
                    </div>
                    <span className="text-md font-semibold text-gray-600">
                        Total Codes: {codes.length}
                    </span>
                </div>

                {/* Table Container - Kept bg-white and added flex-grow and proper overflow for table scroll */}
                <div className="flex-grow overflow-y-auto rounded-xl shadow-2xl bg-white border border-gray-100">
                    <table className="w-full text-sm">
                        <thead className="bg-blue-600 sticky top-0 shadow-lg text-white">
                            <tr className="uppercase tracking-wider">
                                <th className="px-4 py-3 text-left">Code ID</th>
                                <th className="px-4 py-3 text-left">Closure Code</th>
                                <th className="px-4 py-3 text-center">Default</th>
                                <th className="px-4 py-3 text-center">Active</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {codes.map((c) => (
                                <tr 
                                    key={c.id} 
                                    className={`hover:bg-sky-50 transition-colors border-b ${c.active ? 'text-gray-800' : 'text-gray-400 italic'}`}
                                >
                                    <td className="px-4 py-3 font-mono">{c.id}</td>
                                    <td
                                        className="px-4 py-3 text-blue-600 underline cursor-pointer hover:text-sky-500 transition-colors font-medium"
                                        onClick={() => openEdit(c)}
                                    >
                                        {c.name}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {c.isDefault ? <span className="text-green-500 font-bold">●</span> : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-block w-3 h-3 rounded-full ${c.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => deleteCode(c.id)}
                                            className="text-red-600 text-sm hover:text-red-800 transition-colors font-medium hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {codes.length === 0 && (
                        <div className="text-center p-6 text-gray-500 bg-white">No closure codes found matching current filters.</div>
                    )}
                </div>
            </div>

            {/* 3. Right Sidebar (Actions) - Kept bg-white for distinction */}
            <div className="w-32 border-l bg-white p-4 pt-10 flex flex-col space-y-4 shadow-lg">
                <h4 className="text-xs font-extrabold text-gray-600 uppercase border-b pb-2 mb-2 tracking-wider">ACTIONS</h4>
                
                {/* ADD NEW Button (Block Style) */}
                <button
                    onClick={openAdd}
                    className="w-full h-16 flex flex-col items-center justify-center p-2 bg-blue-600 text-white border-2 border-transparent rounded-xl shadow-md transition-all duration-200 
                            hover:bg-blue-700 hover:shadow-xl transform hover:scale-[1.02]"
                >
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span className="text-xs font-semibold">ADD NEW</span>
                </button>

                {/* IMPORT Button (Block Style) */}
                <button
                    onClick={handleImportClick}
                    className="w-full h-16 flex flex-col items-center justify-center p-2 bg-gray-200 text-gray-700 border-2 border-transparent rounded-xl shadow-md transition-all duration-200 
                            hover:bg-gray-300 hover:text-gray-800 hover:shadow-xl transform hover:scale-[1.02]"
                >
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    <span className="text-xs font-semibold">IMPORT</span>
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleImport}
                        className="hidden"
                    />
                </button>
            </div>

            {/* Modals and Messages */}
            {showEditModal && (
                <ClosureCodeModal
                    initial={selectedCode}
                    onSave={saveCode}
                    onClose={() => setShowEditModal(false)}
                />
            )}

            {showConfirm && (
                <ConfirmModal
                    message={confirmMessage}
                    onConfirm={() => {
                        confirmAction();
                        setShowConfirm(false);
                    }}
                    onCancel={() => setShowConfirm(false)}
                />
            )}

            <MessageBar message={message} type={messageType} onClose ={() => setMessage(null)} />
        </div>
    );
};

export default ClosureCodePage;