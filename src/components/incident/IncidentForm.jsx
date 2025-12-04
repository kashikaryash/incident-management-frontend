import React from "react";
import Input from "../common/Input";
import Button from "../common/Button";

const IncidentForm = ({ formData, onChange, onSubmit, isSubmitting }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <Input name="shortDescription" value={formData.shortDescription} onChange={onChange} label="Short Description" required />
    <Input name="detailedDescription" value={formData.detailedDescription} onChange={onChange} label="Detailed Description" required />
    
    <select
      name="category"
      value={formData.category}
      onChange={onChange}
      className="w-full px-3 py-2 border rounded"
      required
    >
      <option value="">Select Category</option>
      {["Hardware", "Software", "Network", "Access Request", "Other"].map(cat => (
        <option key={cat}>{cat}</option>
      ))}
    </select>

    <input type="file" name="attachments" multiple onChange={onChange} />
    
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? "Submitting..." : "Submit"}
    </Button>
  </form>
);

export default IncidentForm;
