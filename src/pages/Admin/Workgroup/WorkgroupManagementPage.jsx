import React, { useEffect, useState } from "react";
import {
  fetchWorkgroups,
  createWorkgroup,
  updateWorkgroup,
  deleteWorkgroup,
} from "../../../services/WorkgroupService";
import WorkgroupTable from "../../../components/admin/WorkgroupTable";
import WorkgroupFormModal from "../../../components/admin/WorkgroupFormModal";

const WorkgroupManagementPage = () => {
  const [workgroups, setWorkgroups] = useState([]);
  const [selected, setSelected] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    loadWorkgroups();
  }, []);

  const loadWorkgroups = async () => {
    const { data } = await fetchWorkgroups();
    setWorkgroups(data);
  };

  const handleCreate = async (payload) => {
    await createWorkgroup(payload);
    setOpenModal(false);
    loadWorkgroups();
  };

  const handleUpdate = async (payload) => {
    await updateWorkgroup(selected.id, payload);
    setSelected(null);
    setOpenModal(false);
    loadWorkgroups();
  };

  const handleDelete = async (id) => {
    await deleteWorkgroup(id);
    loadWorkgroups();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Workgroup Management</h1>
        <button
          className="bg-blue-600 text-white rounded-xl px-4 py-2"
          onClick={() => {
            setSelected(null);
            setOpenModal(true);
          }}
        >
          + Add Workgroup
        </button>
      </div>

      <WorkgroupTable
        data={workgroups}
        onEdit={(wg) => {
          setSelected(wg);
          setOpenModal(true);
        }}
        onDelete={handleDelete}
      />

      {openModal && (
        <WorkgroupFormModal
          workgroup={selected}
          onClose={() => setOpenModal(false)}
          onSave={(payload) =>
            selected ? handleUpdate(payload) : handleCreate(payload)
          }
        />
      )}
    </div>
  );
};

export default WorkgroupManagementPage;
