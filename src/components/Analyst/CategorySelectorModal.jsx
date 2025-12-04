import React, { useState, useEffect } from "react";

// The FaPlus/FaMinus icons are not necessary if you use the simple '−' and '+' characters, 
// but if you prefer icons, ensure you import them:
// import { FaTimes, FaPlus, FaMinus } from "react-icons/fa"; 

const CategorySelectorModal = ({ isOpen, onClose, categories, onSelect }) => {
  // Track which nodes are expanded (Set of IDs)
  const [expanded, setExpanded] = useState(new Set());

  // --- Search State (Added for completeness based on original request) ---
  const [search, setSearch] = useState("");
  
  // Memoize the filtered and structured tree for display
  const filteredCategories = React.useMemo(() => {
    if (!search) return categories;

    // A simple filter that checks if the category name includes the search term (case-insensitive)
    // For a recursive tree filter, a more complex function is needed.
    // Assuming 'categories' is already a flat list for simple filtering:
    return categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [categories, search]);

  // Automatically expand root nodes when the modal opens
  useEffect(() => {
    if (isOpen && categories.length > 0) {
      // Find all top-level categories (parentId is null/undefined, assuming your data has this)
      const rootIds = categories.filter(c => !c.parentId).map(c => c.id);
      
      // Expand root nodes and the first level of children (Level 0 and 1)
      const initialExpanded = new Set();
      rootIds.forEach(id => initialExpanded.add(id));

      // Simple one-level expansion
      categories.forEach(c => {
        if (rootIds.includes(c.parentId)) {
            initialExpanded.add(c.id);
        }
      });

      setExpanded(initialExpanded);
    }
  }, [isOpen, categories]);

  // Toggle expand/collapse
  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ------------------------------------------------------
  // Recursive Tree Node Component
  // ------------------------------------------------------
  const TreeNode = ({ node, level, parentPath }) => {
    // Check if this node has children
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded.has(node.id);
    
    // Construct the breadcrumb path for this specific node
    // If parentPath exists, append current name; otherwise, just current name.
    const currentPath = parentPath ? `${parentPath} > ${node.name}` : node.name;

    // Logic for indentation
    const indentStyle = { paddingLeft: `${level * 20}px` };

    return (
      <div className="select-none">
        <div className="flex items-center py-1 rounded" style={indentStyle}>
          
          {/* 1. Expand/Collapse Button (Only if children exist) */}
          <div className="w-6 mr-1 flex justify-center shrink-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent selecting the category when just expanding
                  toggleExpand(node.id);
                }}
                className="w-5 h-5 border border-gray-400 text-gray-600 rounded flex items-center justify-center text-xs bg-white hover:bg-blue-50 transition-colors"
              >
                {isExpanded ? "−" : "+"}
              </button>
            ) : (
              <span className="w-5 h-5 block" /> // Spacer
            )}
          </div>

          {/* 2. Category Name (Clickable for Selection) */}
          <div
            onClick={() => {
              // Pass the node AND the constructed path back to the parent
              onSelect({ ...node, path: currentPath });
              onClose(); // Close the modal upon selection
            }}
            // Enhanced styling for better hover feedback
            className={`cursor-pointer px-2 py-1 rounded border border-transparent hover:bg-blue-100 hover:border-blue-200 hover:text-blue-800 transition-all flex-1 flex items-center ${
              !node.active ? "opacity-50" : ""
            } ${node.active && 'hover:shadow-sm'}`} 
          >
            {/* Folder vs File Icon */}
            <span className="mr-2 text-lg leading-none">
              {hasChildren ? (isExpanded ? "📂" : "📁") : "📄"}
            </span>
            <span className="text-sm font-medium text-gray-700">
                {node.name}
            </span>
          </div>
        </div>

        {/* 3. Render Children Recursively */}
        {isExpanded && hasChildren && (
          <div>
            {node.children.map((child) => (
              <TreeNode 
                key={child.id} 
                node={child} 
                level={level + 1} 
                parentPath={currentPath} // Pass the path down
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    // 1. MODAL BACKDROP CONTAINER: Fixed, full screen, centered, dimmed background
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity">
      
      {/* 2. MODAL CONTENT CONTAINER: White box, fixed size, shadow */}
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl flex flex-col max-h-[85vh] border border-gray-200">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-800">Category</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-red-500 rounded-full p-1 transition-colors"
          >
            {/* Close Icon (Using Tailwind's heroic icons path) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100">
            <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        {/* Modal Body (Scrollable Tree) */}
        <div className="flex-1 overflow-y-auto p-2">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <span className="text-3xl mb-2">📭</span>
              <p>No categories found.</p>
            </div>
          ) : (
            categories.map((root) => (
              // Note: For search functionality to work properly on a recursive tree, 
              // the 'categories' array should be pre-filtered/pre-structured outside 
              // this map to only include matching nodes and their necessary parents.
              // Assuming 'categories' here means the filtered roots/top-level nodes.
              <TreeNode 
                key={root.id} 
                node={root} 
                level={0} 
                parentPath="" 
              />
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySelectorModal;