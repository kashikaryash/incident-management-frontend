import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";

// --- Helper: Transform Flat API Data to Tree Structure (Unchanged) ---
const buildTree = (items) => {
    if (!items || items.length === 0) return [];
    
    const data = JSON.parse(JSON.stringify(items)); 
    const map = {};
    const roots = [];

    data.forEach((item) => {
        map[item.id] = { ...item, children: [] };
    });

    data.forEach((item) => {
        if (item.parentId && map[item.parentId]) {
            map[item.parentId].children.push(map[item.id]);
        } else {
            roots.push(map[item.id]);
        }
    });

    return roots;
};

// --- Modal Backdrop Component ---
const ModalBackdrop = ({ children }) => {
    return (
        <div className="fixed inset-0 z-40 bg-opacity-50 flex items-center justify-center">
            {children}
        </div>
    );
};

// --- New Component: Sort Options Modal ---
const SortModal = ({ currentSort, onSelectSort, onClose }) => {
    const options = [
        { key: 'id', label: 'By ID (Default)' },
        { key: 'name', label: 'By Name (Alphabetical)' },
    ];

    return (
        <ModalBackdrop>
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96 z-50 transform transition-all duration-300 scale-100">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 flex items-center">
                    <span className="text-2xl mr-2">⋮≡</span> Set Sort Order
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                    Choose the primary ordering method for the classification nodes.
                </p>
                <div className="space-y-3">
                    {options.map((option) => (
                        <button
                            key={option.key}
                            onClick={() => onSelectSort(option.key)}
                            className={`
                                w-full py-3 px-4 text-left rounded-lg transition-colors duration-150 border 
                                ${currentSort === option.key 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                                }
                            `}
                        >
                            <span className="font-semibold">{option.label}</span>
                            {currentSort === option.key && (
                                <span className="float-right text-sm font-bold opacity-80">CURRENT</span>
                            )}
                        </button>
                    ))}
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </ModalBackdrop>
    );
};

// --- New Component: Context Menu (Updated to use dynamic label) ---
const ContextMenu = ({ x, y, node, onClose, onActionClick }) => {
    if (x === null || y === null || !node) return null;

    // Dynamically determine the label for the toggle action
    const toggleLabel = node.active ? "Set Inactive" : "Set Active";

    // List of actions, using the dynamic label for toggleActive
    const actions = [
        { label: "Create Root Node", type: "createRoot" },
        { label: "Create Child Node", type: "createChild" },
        { label: "Rename", type: "rename" },
        // Use the dynamic label here
        { label: toggleLabel, type: "toggleActive" }, 
        { label: "Set as Default", type: "setDefault" },
    ];

    return (
        <div 
            className="absolute z-50 bg-white border border-gray-300 shadow-xl rounded py-1"
            style={{ top: `${y}px`, left: `${x}px` }}
        >
            {actions.map((action, index) => (
                <div
                    key={index}
                    onClick={() => {
                        onActionClick(node, action.type);
                        onClose();
                    }}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white cursor-pointer transition-colors duration-100 whitespace-nowrap"
                    style={
                        action.type === 'toggleActive' 
                            ? { borderTop: '1px dotted #ccc', paddingTop: '8px', marginTop: '4px' } 
                            : {}
                    }
                >
                    {action.label}
                </div>
            ))}
        </div>
    );
};


// --- Component: Single Tree Node (Unchanged) ---
const ClassificationNode = ({ node, level, expandedIds, toggleExpand, onOpenContextMenu }) => {
    const isExpanded = expandedIds.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;

    const paddingLeft = level * 20;

    const getStatusColor = (active) => {
        return active ? "bg-green-500" : "bg-red-500";
    };

    return (
        <div className="select-none">
            <div 
                className="flex items-center mb-2 group relative"
                style={{ paddingLeft: `${paddingLeft}px` }}
                onContextMenu={(e) => {
                   e.preventDefault();
                   onOpenContextMenu(e.clientX, e.clientY, node);
                }}
            >
                {/* Vertical Guide Line for levels > 0 */}
                {level > 0 && (
                   <div className="absolute w-px h-full bg-gray-300" style={{ left: `${paddingLeft - 12}px`}}></div>
                )}
                
                {/* Expand/Collapse Button */}
                <div className="mr-2 z-10 w-6 flex justify-center">
                    {hasChildren ? (
                        <button
                            onClick={() => toggleExpand(node.id)}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-400 text-white font-bold hover:bg-gray-500 transition shadow-sm"
                        >
                            {isExpanded ? "−" : "+"}
                        </button>
                    ) : (
                        <div className="w-6" /> 
                    )}
                </div>

                {/* Node Content Box */}
                <div className="flex items-center bg-gray-100 border border-gray-200 rounded px-3 py-2 w-full max-w-2xl hover:bg-gray-200 transition cursor-pointer">
                   <div className={`w-3 h-3 ${getStatusColor(node.active)} mr-3 rounded-sm`}></div>
                   <span className="text-gray-700 font-medium text-sm">
                     <span className="mr-2 text-gray-500">({node.id})</span>
                     {node.name}
                   </span>
                </div>
            </div>

            {/* Render Children Recursively */}
            {isExpanded && hasChildren && (
                <div className="relative">
                    {/* Connection Line for Children */}
                    <div className="absolute border-l border-gray-300 h-full" style={{ left: `${paddingLeft + 11}px`, top: '-10px' }}></div>
                    {node.children.map((child) => (
                        <ClassificationNode
                            key={child.id}
                            node={child}
                            level={level + 1}
                            expandedIds={expandedIds}
                            toggleExpand={toggleExpand}
                            onOpenContextMenu={onOpenContextMenu}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


// --- Main Page Component ---
const ClassificationPage = () => {
    const [classifications, setClassifications] = useState([]);
    const [expandedIds, setExpandedIds] = useState([]);
    const [includeInactive, setIncludeInactive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('id'); 
    const [isSortModalOpen, setIsSortModalOpen] = useState(false); // NEW STATE for modal
    
    const [contextMenu, setContextMenu] = useState({ 
        visible: false, 
        x: null, 
        y: null, 
        node: null 
    });

    // Handle closing the context menu when clicking anywhere else (Unchanged)
    useEffect(() => {
        const handleClickOutside = () => {
            if (contextMenu.visible) {
                setContextMenu({ visible: false, x: null, y: null, node: null });
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [contextMenu.visible]);
    
    // --- Helper function for sorting the flat array (Unchanged) ---
    const applySort = (data, method) => {
        if (!data) return [];

        const sortedData = [...data];

        sortedData.sort((a, b) => {
            // 1. Always sort by parentId first to group children together
            const parentComparison = (a.parentId || 0) - (b.parentId || 0);
            if (parentComparison !== 0) {
                return parentComparison;
            }

            // 2. Apply secondary sort based on method
            if (method === 'name') {
                return a.name.localeCompare(b.name);
            }
            // Default to 'id' sort
            return a.id - b.id;
        });

        return sortedData;
    };


    // 1. Fetch Data from Backend
    const fetchClassifications = async () => {
        try {
            setLoading(true);
            const res = await axios.get("incidentmanagementsystem-backend.railway.internal/api/classifications");
            // Apply the current sort method after fetching
            setClassifications(applySort(res.data, sortBy)); 
            setError(null);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load classifications. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClassifications();
    }, [sortBy]); // Re-fetch or re-sort when 'sortBy' changes

    // 2. Build Tree (Unchanged)
    const treeData = useMemo(() => {
        let filtered = classifications;
        if (!includeInactive) {
            filtered = classifications.filter(c => c.active);
        }
        return buildTree(filtered);
    }, [classifications, includeInactive]);

    // --- Core Action: Toggle Active Status (Unchanged) ---
    const handleToggleActive = async (id) => {
        try {
            const res = await axios.patch(`incidentmanagementsystem-backend.railway.internal/api/classifications/${id}/toggle-active`);
            
            // Update the local state and re-sort the new list immediately
            setClassifications(prev => 
                applySort(prev.map(c => c.id === id ? res.data : c), sortBy)
            );
        } catch (error) {
            console.error("Error toggling active status:", error);
            alert("Failed to toggle status. Check console.");
        }
    };

    // --- General Actions ---
    const toggleExpand = (id) => {
        setExpandedIds(prev => 
            prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
        );
    };

    const expandAll = () => {
        setExpandedIds(classifications.map(c => c.id));
    };

    // NEW: Function to handle sort selection from the modal
    const handleSelectSort = (newSort) => {
        if (newSort !== sortBy) {
            setSortBy(newSort);
        }
        setIsSortModalOpen(false);
    };

    // NEW: Handle the Sort Order button click to open the modal
    const handleSortOrder = () => {
        setIsSortModalOpen(true);
    };


    // --- Context Menu Handlers (Unchanged) ---
    const handleOpenContextMenu = (x, y, node) => {
        setContextMenu({ visible: true, x: x, y: y, node: node });
    };

    const handleContextAction = (node, actionType) => {
        switch (actionType) {
            case 'toggleActive':
                handleToggleActive(node.id);
                break;
            case 'createRoot':
                alert(`TODO: Open modal to create a new Root Node.`);
                break;
            case 'createChild':
                alert(`TODO: Open modal to create a Child Node under ${node.name}`);
                break;
            case 'rename':
                alert(`TODO: Open modal to rename ${node.name}`);
                break;
            case 'setDefault':
                alert(`TODO: Call API to set ${node.name} as default.`);
                break;
            default:
                break;
        }
    };


    return (
        <div className="flex h-screen bg-white font-sans relative"> 
            
            {/* Context Menu Component */}
            <ContextMenu 
                x={contextMenu.x}
                y={contextMenu.y}
                node={contextMenu.node}
                onClose={() => setContextMenu({ visible: false, x: null, y: null, node: null })}
                onActionClick={handleContextAction}
            />

            {/* Sort Modal */}
            {isSortModalOpen && (
                <SortModal
                    currentSort={sortBy}
                    onSelectSort={handleSelectSort}
                    onClose={() => setIsSortModalOpen(false)}
                />
            )}

            {/* --- Main Content --- */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                
                {/* Header / Legend */}
                <div className="bg-gray-50 p-4 rounded-lg border mb-6 flex flex-col md:flex-row md:items-center justify-between">
                    <h2 className="text-gray-700 font-bold mb-2 md:mb-0">DETAILS</h2>
                    
                    <div className="flex space-x-6 text-sm text-gray-600">
                        <div className="flex items-center"><span className="w-3 h-3 bg-green-500 mr-2 rounded-sm"></span> Default/Active</div>
                        <div className="flex items-center"><span className="w-3 h-3 bg-red-500 mr-2 rounded-sm"></span> Inactive</div>
                        <div className="flex items-center"><span className="w-3 h-3 bg-yellow-400 mr-2 rounded-sm"></span> New Node</div>
                    </div>

                    <label className="flex items-center mt-2 md:mt-0 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="mr-2 h-4 w-4"
                            checked={includeInactive}
                            onChange={(e) => setIncludeInactive(e.target.checked)}
                        />
                        <span className="font-semibold text-sm text-gray-700">Include Inactive (<span className="text-blue-600 font-bold">{sortBy.toUpperCase()}</span> Sort)</span>
                    </label>
                </div>

                {/* Info Note */}
                <div className="mb-6 pl-2">
                     <ul className="list-disc text-sm text-gray-500 italic ml-5">
                         <li>It is recommended that the classification hierarchy should not be greater than 10.</li>
                     </ul>
                     <p className="text-right text-xs text-gray-400 italic mt-1">
                         Right-click any node to perform actions.
                     </p>
                </div>

                {/* Error / Loading State */}
                {loading && <div className="text-blue-600 p-4">Loading data...</div>}
                {error && <div className="text-red-600 p-4 border border-red-200 bg-red-50 rounded">{error}</div>}

                {/* Tree Render */}
                <div className="pl-2 pb-10">
                    {treeData.length > 0 ? (
                        treeData.map((node) => (
                            <ClassificationNode
                                key={node.id}
                                node={node}
                                level={0}
                                expandedIds={expandedIds}
                                toggleExpand={toggleExpand}
                                onOpenContextMenu={handleOpenContextMenu}
                            />
                        ))
                    ) : (
                        !loading && <div className="text-gray-400 italic">No classifications found.</div>
                    )}
                </div>
            </div>

            {/* --- Right Sidebar Actions --- */}
            <div className="w-24 bg-blue-50 border-l border-blue-100 flex flex-col items-center py-6 space-y-6 shadow-inner">
                 <div className="text-blue-800 font-bold text-xs border-b border-blue-200 w-full text-center pb-2 tracking-wide">ACTIONS</div>
                 
                 <SidebarBtn icon="⤢" label="EXPAND ALL" onClick={expandAll} />
                 <SidebarBtn icon="⬆" label="IMPORT" onClick={() => alert("Import clicked")} />
                 {/* Handler updated to open modal */}
                 <SidebarBtn 
                    icon="⋮≡" 
                    label="SORT ORDER" 
                    onClick={handleSortOrder} 
                    isActive={isSortModalOpen || sortBy !== 'id'} 
                />
            </div>
        </div>
    );
};

// Small Component for Sidebar Buttons (Updated for better active state)
const SidebarBtn = ({ icon, label, onClick, isActive = false }) => (
    <button 
        onClick={onClick} 
        className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition group w-full"
    >
        <div 
            className={`
                w-10 h-10 border rounded-lg flex items-center justify-center mb-1 shadow-sm transition-all
                ${isActive 
                    ? 'bg-blue-600 border-blue-700 text-white shadow-lg' 
                    : 'bg-white border-gray-200 group-hover:border-blue-300 group-hover:bg-blue-100'
                }
            `}
        >
           <span className={`text-xl ${isActive ? '' : 'group-hover:text-blue-600'}`}>{icon}</span>
        </div>
        <span className={`text-[10px] text-center font-bold ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>{label}</span>
    </button>
);

export default ClassificationPage;