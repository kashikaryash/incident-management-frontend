import React, { useState } from "react";

const ImportPage = () => {
  const [userFile, setUserFile] = useState(null);
  const [roleFile, setRoleFile] = useState(null);

  const handleUserFileChange = (e) => {
    setUserFile(e.target.files[0]);
  };

  const handleRoleFileChange = (e) => {
    setRoleFile(e.target.files[0]);
  };

  const handleUploadUsers = () => {
    if (!userFile) return alert("Please select a file to upload");
    // Add your API call logic here
    alert(`Uploading user file: ${userFile.name}`);
  };

  const handleUploadRoles = () => {
    if (!roleFile) return alert("Please select a file to upload");
    // Add your API call logic here
    alert(`Uploading role file: ${roleFile.name}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Import</h2>

      {/* Import Users Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold mb-2">Import Users</h3>
        <input type="file" onChange={handleUserFileChange} />
        <button
          onClick={handleUploadUsers}
          className="ml-2 px-3 py-1 bg-blue-600 text-white rounded"
        >
          Upload
        </button>
      </div>

      {/* Import Roles Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Import Roles</h3>
        <input type="file" onChange={handleRoleFileChange} />
        <button
          onClick={handleUploadRoles}
          className="ml-2 px-3 py-1 bg-blue-600 text-white rounded"
        >
          Upload
        </button>
      </div>
    </div>
  );
};

export default ImportPage;
