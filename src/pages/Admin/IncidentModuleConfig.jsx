import React, { useEffect, useState } from "react";

const IncidentModuleConfig = () => {
    const [config, setConfig] = useState({
        statusOptions: [],
        priorityLevels: [],
        impactLevels: [],
        urgencyLevels: [],
        categories: [],
        contactTypes: [],
        assignmentGroups: [],
        customFields: [],
        slaThresholds: {
            P1: { response: "", resolution: "" },
            P2: { response: "", resolution: "" },
            P3: { response: "", resolution: "" },
            P4: { response: "", resolution: "" },
            P5: { response: "", resolution: "" }
        },
        approvalWorkflowEnabled: false,
        auditTrailEnabled: false
    });

    const [fieldInput, setFieldInput] = useState("");
    const [customField, setCustomField] = useState({ name: "", type: "Text" });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch("incidentmanagementsystem-backend.railway.internal/api/config/getConfig", {
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Failed to load config");
                const json = await res.json();

                if (json) {
                    setConfig({
                        approvalWorkflowEnabled: json.approvalRequired || false,
                        auditTrailEnabled: json.auditTrailEnabled || false,
                        priorityLevels: json.priorityLevels ? json.priorityLevels.split(",") : [],
                        impactLevels: json.impactLevels ? json.impactLevels.split(",") : [],
                        urgencyLevels: json.urgencyLevels ? json.urgencyLevels.split(",") : [],
                        statusOptions: json.statusOptions ? json.statusOptions.split(",") : [],
                        categories: json.categories ? json.categories.split(",") : [],
                        contactTypes: json.contactTypes ? json.contactTypes.split(",") : [],
                        assignmentGroups: json.assignmentGroups ? json.assignmentGroups.split(",") : [],
                        customFields: json.customFieldsJson ? JSON.parse(json.customFieldsJson) : [],
                        slaThresholds: json.slaConfigJson ? JSON.parse(json.slaConfigJson) : {
                            P1: { response: "", resolution: "" },
                            P2: { response: "", resolution: "" },
                            P3: { response: "", resolution: "" },
                            P4: { response: "", resolution: "" },
                            P5: { response: "", resolution: "" }
                        }
                    });
                }
            } catch (err) {
                console.error("Error loading config:", err);
                alert("Could not load configuration. Check server or CORS settings.");
            }
        };

        fetchConfig();
    }, []);

    const handleAdd = (key) => {
        if (!fieldInput.trim()) return;
        setConfig((prev) => ({
            ...prev,
            [key]: [...prev[key], fieldInput.trim()]
        }));
        setFieldInput("");
    };

    const handleAddCustomField = () => {
        if (!customField.name.trim()) return;
        setConfig((prev) => ({
            ...prev,
            customFields: [...prev.customFields, { ...customField }]
        }));
        setCustomField({ name: "", type: "Text" });
    };

    const handleSave = async () => {
        const payload = {
            approvalRequired: config.approvalWorkflowEnabled,
            auditTrailEnabled: config.auditTrailEnabled,
            priorityLevels: config.priorityLevels.join(","),
            impactLevels: config.impactLevels.join(","),
            urgencyLevels: config.urgencyLevels.join(","),
            statusOptions: config.statusOptions.join(","),
            categories: config.categories.join(","),
            contactTypes: config.contactTypes.join(","),
            assignmentGroups: config.assignmentGroups.join(","),
            customFieldsJson: JSON.stringify(config.customFields),
            slaConfigJson: JSON.stringify(config.slaThresholds)
        };

        try {
            const res = await fetch("incidentmanagementsystem-backend.railway.internal/api/config/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include", // ✅ important
                body: JSON.stringify(payload)
            });


            if (!res.ok) throw new Error("Failed to save config");

            alert("Configuration saved successfully!");
        } catch (err) {
            console.error("Save failed:", err);
            alert("Error saving configuration. Check server status.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">
                    Incident Management Module Attribute Configuration
                </h2>
                <p className="text-sm text-gray-600 text-center mb-6">
                    Configure each attribute below. Use "Add" to append values.
                </p>

                {[
                    "statusOptions",
                    "priorityLevels",
                    "impactLevels",
                    "urgencyLevels",
                    "categories",
                    "contactTypes",
                    "assignmentGroups"
                ].map((key) => (
                    <div key={key} className="mb-4 border p-4 rounded-md">
                        <h4 className="font-semibold text-gray-700 mb-2">
                            {key.replace(/([A-Z])/g, " $1")}
                        </h4>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={fieldInput}
                                onChange={(e) => setFieldInput(e.target.value)}
                                placeholder={`Enter ${key}`}
                                className="flex-1 px-3 py-2 border rounded"
                            />
                            <button
                                type="button"
                                onClick={() => handleAdd(key)}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Add
                            </button>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                            Current: {config[key]?.length > 0 ? config[key].join(", ") : "None"}
                        </div>
                    </div>
                ))}

                {/* SLA Thresholds */}
                <div className="mb-6 border p-4 rounded-md">
                    <h4 className="font-semibold text-gray-700 mb-2">SLA Thresholds</h4>
                    <div className="space-y-2">
                        {Object.entries(config.slaThresholds).map(([priority, times]) => (
                            <div key={priority} className="flex gap-4 items-center">
                                <span className="w-[40px] font-medium">{priority}</span>
                                <input
                                    type="text"
                                    placeholder="Response (e.g., 15m)"
                                    value={times.response}
                                    onChange={(e) =>
                                        setConfig((prev) => ({
                                            ...prev,
                                            slaThresholds: {
                                                ...prev.slaThresholds,
                                                [priority]: {
                                                    ...prev.slaThresholds[priority],
                                                    response: e.target.value
                                                }
                                            }
                                        }))
                                    }
                                    className="px-3 py-1 border rounded w-[160px]"
                                />
                                <input
                                    type="text"
                                    placeholder="Resolution (e.g., 4h)"
                                    value={times.resolution}
                                    onChange={(e) =>
                                        setConfig((prev) => ({
                                            ...prev,
                                            slaThresholds: {
                                                ...prev.slaThresholds,
                                                [priority]: {
                                                    ...prev.slaThresholds[priority],
                                                    resolution: e.target.value
                                                }
                                            }
                                        }))
                                    }
                                    className="px-3 py-1 border rounded w-[160px]"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Toggles */}
                <div className="mb-6 flex flex-col gap-3 border p-4 rounded-md">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={config.approvalWorkflowEnabled}
                            onChange={() =>
                                setConfig((prev) => ({
                                    ...prev,
                                    approvalWorkflowEnabled: !prev.approvalWorkflowEnabled
                                }))
                            }
                        />
                        Enable Approval Workflow
                    </label>

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={config.auditTrailEnabled}
                            onChange={() =>
                                setConfig((prev) => ({
                                    ...prev,
                                    auditTrailEnabled: !prev.auditTrailEnabled
                                }))
                            }
                        />
                        Enable Audit Trail
                    </label>
                </div>

                {/* Custom Fields */}
                <div className="mb-6 border p-4 rounded-md">
                    <h4 className="font-semibold text-gray-700 mb-2">Custom Fields</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                        <input
                            type="text"
                            placeholder="Field Name"
                            value={customField.name}
                            onChange={(e) =>
                                setCustomField({ ...customField, name: e.target.value })
                            }
                            className="px-3 py-2 border rounded"
                        />
                        <select
                            value={customField.type}
                            onChange={(e) =>
                                setCustomField({ ...customField, type: e.target.value })
                            }
                            className="px-3 py-2 border rounded"
                        >
                            <option>Text</option>
                            <option>Dropdown</option>
                            <option>Number</option>
                            <option>Date</option>
                        </select>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddCustomField}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Add Custom Field
                    </button>
                    <div className="mt-2 text-sm text-gray-600">
                        Current:{" "}
                        {config.customFields.length > 0
                            ? config.customFields.map((f) => `${f.name} (${f.type})`).join(", ")
                            : "None"}
                    </div>
                </div>

                {/* Save Button */}
                <button
                    type="button"
                    onClick={handleSave}
                    className="w-[160px] bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700"
                >
                    Save Configuration
                </button>
            </div>
        </div>
    );
};

export default IncidentModuleConfig;
