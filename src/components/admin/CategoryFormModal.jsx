import React, { useState, useEffect } from "react";

const CategoryFormModal = ({ initialData, onSubmit, onClose, openParentPicker }) => {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState(null);

  useEffect(() => {
    setName(initialData?.name || "");
    setParentId(initialData?.parentId ?? null);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      id: initialData?.id,
      name,
      parentId,
    };

    onSubmit(payload, parentId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-96 rounded shadow p-5">
        <h2 className="text-lg font-semibold mb-3">
          {initialData?.id ? "Edit Category" : "Add Category"}
        </h2>

        <form onSubmit={handleSubmit}>
          <label className="block mb-1 font-medium">Name</label>
          <input
            className="border rounded w-full p-2 mb-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className="block mb-1 font-medium">Parent Category</label>
          <div className="flex gap-2 mb-3">
            <input
              className="border rounded p-2 flex-1"
              readOnly
              value={parentId ?? "Root"}
            />
            <button
              type="button"
              className="px-3 py-1 bg-gray-200 rounded"
              onClick={() => openParentPicker((cat) => setParentId(cat?.id ?? null))}
            >
              Select
            </button>
            <button
              type="button"
              className="px-3 py-1 bg-gray-100 rounded"
              onClick={() => setParentId(null)}
            >
              Clear
            </button>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-3 py-1 border rounded"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
