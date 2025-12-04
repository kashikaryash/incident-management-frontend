import React from 'react';
import { FaTimes } from 'react-icons/fa'; // Assuming you use react-icons

const IncidentSuccessModal = ({ isOpen, onClose, incidentDetails }) => {
    if (!isOpen || !incidentDetails) return null;

    const { incidentId, priority, serviceWindow } = incidentDetails;

    // Tailwind classes matching the screenshot's banner
    const headerBgColor = 'bg-[#D9E5F3]'; 
    const headerTextColor = 'text-[#005a96]'; 

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-opacity-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
                
                {/* Modal Header/Banner */}
                <div className={`p-3 flex items-center justify-between ${headerBgColor} rounded-t-lg border-b border-gray-300`}>
                    <div className="flex items-center">
                        <svg className={`w-5 h-5 mr-2 ${headerTextColor}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        <h3 className={`text-base font-semibold ${headerTextColor}`}>
                            ✅ Your incident is logged successfully.
                        </h3>
                    </div>
                    
                    {/* Close Button (X icon) */}
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-700 p-1 transition-colors"
                        aria-label="Close"
                    >
                        <FaTimes size={16} /> 
                    </button>
                </div>

                {/* Modal Body: Incident Details */}
                <div className="p-4 space-y-3 text-sm">
                    {/* Row: Incident ID */}
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Incident ID:</span>
                        <span className="text-gray-900 font-bold">{incidentId}</span>
                    </div>

                    {/* Row: Priority */}
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Priority:</span>
                        <span className="text-gray-900 font-bold">{priority}</span>
                    </div>
                    
                    {/* Row: Service Window */}
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Service Window:</span>
                        <span className="text-gray-900 font-bold">{serviceWindow}</span>
                    </div>
                </div>

                {/* Modal Footer: Action Buttons */}
                <div className="p-4 pt-0 flex justify-center space-x-3">
                    <button 
                        type="button"
                        className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm"
                        onClick={() => { /* Navigate to dashboard or incidents */ onClose(); }}
                    >
                        VIEW DASHBOARD
                    </button>
                    <button 
                        type="button"
                        className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm"
                        onClick={() => { /* Navigate to my incidents */ onClose(); }}
                    >
                        MY INCIDENTS
                    </button>
                    <button 
                        type="button"
                        className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm"
                        onClick={onClose} // Just close the modal, allowing LogIncidentEndUser to reset the form
                    >
                        NEW INCIDENT
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncidentSuccessModal;