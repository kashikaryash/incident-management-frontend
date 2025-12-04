import React, { useState, useEffect } from "react";

const ClosureCodeModal = ({ initial, onSave, onClose }) => {
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setActive(initial.active);
      setIsDefault(initial.isDefault);
    }
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, active, isDefault });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
      <div className="bg-white p-5 rounded border shadow-lg pointer-events-auto w-80">
        <h2 className="text-lg mb-3">
          {initial ? "Edit Closure Code" : "Add Closure Code"}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="border w-full mb-3 p-2 rounded"
            placeholder="Closure Code"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="mb-3 flex items-center space-x-2">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              id="active"
            />
            <label htmlFor="active">Active</label>
          </div>

          <div className="mb-4 flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              id="default"
            />
            <label htmlFor="default">Default</label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="border px-3 py-1 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gray-800 text-white px-3 py-1 rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClosureCodeModal;
