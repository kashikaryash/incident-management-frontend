import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminTree from "../../../components/admin/AdminTree";
import CategoryFormModal from "../../../components/admin/CategoryFormModal";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("incidentmanagementsystem-backend.railway.internal/api/categories/tree");
      setCategories(data);
    } catch (err) {
      Toast.fire({ icon: "error", title: "Failed to fetch categories" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddRoot = () => {
    setSelectedCategory(null);
    setShowModal(true);
  };

  const handleModalSubmit = async (formData, parentId = null) => {
    try {
      if (selectedCategory?.id) {
        await axios.put(
          `incidentmanagementsystem-backend.railway.internal/api/categories/${selectedCategory.id}`,
          formData
        );
        Toast.fire({ icon: "success", title: "Category updated" });
      } else {
        await axios.post("incidentmanagementsystem-backend.railway.internal/api/categories", {
          ...formData,
          parentId,
        });
        Toast.fire({ icon: "success", title: "Category created" });
      }
      setShowModal(false);
      await fetchCategories();
    } catch (err) {
      Toast.fire({ icon: "error", title: "Operation failed" });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Category Management</h1>

      <button
        onClick={handleAddRoot}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        + Add Root Category
      </button>

      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <AdminTree
          categories={categories}
          onReload={fetchCategories}
          onSubmit={handleModalSubmit}
        />
      )}

      {showModal && (
        <CategoryFormModal
          initialData={selectedCategory}
          onSubmit={handleModalSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default CategoryManagementPage;
