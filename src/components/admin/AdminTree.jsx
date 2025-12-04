import React, { useEffect, useState, useRef } from "react";
import api from "../../services/axios";
import CategoryFormModal from "../admin/CategoryFormModal";
import CategorySelectorModal from "../Analyst/CategorySelectorModal";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
});

const AdminTree = () => {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(new Set());
  const [context, setContext] = useState(null); // {x,y,node}
  const contextRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [formInitial, setFormInitial] = useState(null);
  const [parentPicker, setParentPicker] = useState({ open: false, onPick: null });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    loadTree();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load category tree
  const loadTree = async () => {
    try {
      setLoading(true);
      const res = await api.get("api/categories/tree");
      if (!mountedRef.current) return;
      setTree(res.data || []);
      // Expand top-level nodes by default
      const topIds = (res.data || []).map((r) => r.id);
      setExpanded(new Set(topIds));
    } catch (err) {
      console.error(err);
      Toast.fire({ icon: "error", title: "Failed to load categories" });
    } finally {
      setLoading(false);
    }
  };

  const collectIds = (nodes) => {
    const ids = [];
    const walk = (arr) => {
      arr.forEach((n) => {
        ids.push(n.id);
        if (n.children?.length) walk(n.children);
      });
    };
    walk(nodes);
    return ids;
  };

  const expandAll = () => setExpanded(new Set(collectIds(tree)));
  const collapseAll = () => setExpanded(new Set());

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  // Context menu close handler
  useEffect(() => {
    const closeContext = (e) => {
      if (contextRef.current && !contextRef.current.contains(e.target)) {
        setContext(null);
      }
    };
    document.addEventListener("click", closeContext);
    return () => document.removeEventListener("click", closeContext);
  }, []);

  // CRUD Actions (omitted for brevity, unchanged)
  const openAddModal = (parentId = null) => {
    setFormInitial({ id: null, name: "", parentId });
    setShowForm(true);
  };

  const openEditModal = (node) => {
    setFormInitial(node);
    setShowForm(true);
  };

  const handleSave = async (payload, parentId) => {
    try {
      if (payload?.id) {
        await api.put(`api/categories/${payload.id}`, {
          name: payload.name,
          parentId,
          active: true,
          visibleToEndUser: true,
          defaultCategory: false,
        });
        Toast.fire({ icon: "success", title: "Updated successfully" });
      } else {
        await api.post(`api/categories`, {
          name: payload.name,
          parentId,
          active: true,
          visibleToEndUser: true,
          defaultCategory: false,
        });
        Toast.fire({ icon: "success", title: "Created successfully" });
      }
      await loadTree();
    } catch (e) {
      Toast.fire({ icon: "error", title: "Save failed" });
    }
  };

  const handleDelete = async (id) => {
    const r = await MySwal.fire({
      title: "Delete?",
      text: "This will delete category + all subcategories!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!r.isConfirmed) return;

    try {
      await api.delete(`api/categories/${id}`);
      Toast.fire({ icon: "success", title: "Deleted" });
      await loadTree();
    } catch {
      Toast.fire({ icon: "error", title: "Delete failed" });
    }
  };

  const handleToggleActive = async (id) => {
    await api.put(`api/categories/${id}/toggle-active`);
    await loadTree();
    Toast.fire({ icon: "success", title: "Active toggled" });
  };

  const handleToggleVisible = async (id) => {
    await api.put(`api/categories/${id}/toggle-visible`);
    await loadTree();
    Toast.fire({ icon: "success", title: "Visibility toggled" });
  };

  const handleSetDefault = async (id) => {
    await api.put(`api/categories/${id}/set-default`);
    await loadTree();
    Toast.fire({ icon: "success", title: "Default set" });
  };

  // Recursive tree rendering
  const Node = ({ node, level }) => {
    const children = node.children || [];
    const isExpanded = expanded.has(node.id);

    const colorClass =
      !node.active
        ? "bg-red-50 hover:bg-red-100"
        : node.defaultCategory
        ? "bg-green-50 hover:bg-green-100"
        : !node.visibleToEndUser
        ? "bg-gray-100 hover:bg-gray-200"
        : "bg-white hover:bg-blue-50";

    // Calculate the padding required for indentation (e.g., 20px per level)
    const paddingLeft = level * 20 + 8; // Added a base padding of 8px (p-2 equivalent)

    return (
      <div className="relative">
        <div 
          className="flex items-center py-1 transition-colors" 
          style={{ paddingLeft: `${paddingLeft}px` }} // Apply dynamic padding here
        >
          {/* 1. Expand/Collapse Button */}
          <div className="w-6 mr-2 shrink-0">
            {children.length > 0 ? (
              <button
                className="w-5 h-5 border border-gray-400 text-gray-600 rounded flex items-center justify-center text-xs bg-white hover:bg-blue-100 transition-colors"
                onClick={() => toggleExpand(node.id)}
              >
                {isExpanded ? "−" : "+"}
              </button>
            ) : (
              <div className="w-5 h-5"></div> // Spacer for alignment
            )}
          </div>

          {/* 2. Category Name formatted as (ID) Name */}
          <span
            className={`border px-3 py-1 rounded cursor-context-menu text-sm font-medium whitespace-nowrap transition-colors ${colorClass}`}
            onContextMenu={(e) => {
              e.preventDefault();
              setContext({ x: e.clientX, y: e.clientY, node });
            }}
          >
            <span className="text-gray-500 font-normal mr-1.5">
              ({node.id})
            </span>
            {node.name}
          </span>
        </div>

        {isExpanded &&
          children.map((child) => (
            <Node key={child.id} node={child} level={level + 1} />
          ))}
      </div>
    );
  };

  const flatten = (tree) => {
    const out = [];
    const walk = (n) => {
      out.push(n);
      (n.children || []).forEach(walk);
    };
    tree.forEach(walk);
    return out;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Category Tree Management</h1>
      
      {/* Control Buttons */}
      <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <div>
          <button onClick={expandAll} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg mr-3 transition-colors shadow-md text-sm">
            Expand All 🔽
          </button>
          <button onClick={collapseAll} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors shadow-md text-sm">
            Collapse All 🔼
          </button>
        </div>

        <button
          onClick={() => openAddModal(null)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-md flex items-center text-sm"
        >
          <span className="text-lg mr-1">+</span> Add Root Category
        </button>
      </div>
      <hr className="my-4"/>

      {/* Category Tree Display */}
      <div className="border border-gray-300 rounded-lg bg-white p-4 shadow-xl">
        {loading ? (
          <div className="text-gray-500 text-center py-10">Loading categories... ⏳</div>
        ) : tree.length === 0 ? (
          <div className="text-gray-500 text-center py-10">No categories found. Click 'Add Root Category' to start.</div>
        ) : (
          <div className="space-y-1">
            {tree.map((root) => <Node key={root.id} node={root} level={0} />)}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {context && (
        <div
          ref={contextRef}
          className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-2 text-sm space-y-0.5"
          style={{ top: context.y, left: context.x }}
        >
          <button className="block w-full text-left p-2 hover:bg-blue-100 rounded" onClick={() => {openAddModal(context.node.id); setContext(null);}}>
            ➕ Add Subcategory
          </button>
          <button className="block w-full text-left p-2 hover:bg-blue-100 rounded" onClick={() => {openEditModal(context.node); setContext(null);}}>
            ✏️ Rename
          </button>
          <hr className="my-1 border-gray-100"/>
          <button className="block w-full text-left p-2 hover:bg-yellow-100 rounded" onClick={() => {handleToggleActive(context.node.id); setContext(null);}}>
            {context.node.active ? '🚫 Deactivate' : '✅ Activate'}
          </button>
          <button className="block w-full text-left p-2 hover:bg-yellow-100 rounded" onClick={() => {handleToggleVisible(context.node.id); setContext(null);}}>
            {context.node.visibleToEndUser ? '👁️ Hide from User' : '👀 Show to User'}
          </button>
          <button className="block w-full text-left p-2 hover:bg-yellow-100 rounded" onClick={() => {handleSetDefault(context.node.id); setContext(null);}}>
            ⭐ Set Default
          </button>
          <hr className="my-1 border-gray-100"/>
          <button className="block w-full text-left p-2 text-red-600 hover:bg-red-100 rounded" onClick={() => {handleDelete(context.node.id); setContext(null);}}>
            🗑 Delete
          </button>
        </div>
      )}

      {/* Category Form Modal (Add/Edit) */}
      {showForm && (
        <CategoryFormModal
          initialData={formInitial}
          onClose={() => setShowForm(false)}
          onSubmit={handleSave}
          openParentPicker={(onPick) =>
            setParentPicker({ open: true, onPick })
          }
        />
      )}

      {/* Category Selector Modal (Parent Picker) */}
      {parentPicker.open && (
        <CategorySelectorModal
          isOpen={true}
          // Flatten the tree data to provide a searchable list for the parent selector
          categories={flatten(tree)} 
          onClose={() => setParentPicker({ open: false, onPick: null })}
          onSelect={(cat) => {
            if (parentPicker.onPick) parentPicker.onPick(cat);
            setParentPicker({ open: false, onPick: null }); // Close picker after selection
          }}
        />
      )}
    </div>
  );
};

export default AdminTree;