import React, { useState, useRef, useEffect } from "react";

const DropdownMenu = ({ label, menuItems, navigateHandler }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block w-full" ref={ref}>
      {/* Dropdown button */}
      <button
        onClick={() => setOpen(!open)}
        className="block w-full text-left px-3 py-2 rounded-md hover:bg-sky-500 hover:text-white transition-colors duration-150"
      >
        {label} ▾
      </button>

      {/* Dropdown menu */}
      {open && (
        <ul className="absolute left-0 mt-1 w-full bg-white border rounded-md shadow-lg z-10">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                onClick={() => {
                  navigateHandler(item.route);
                  setOpen(false);
                }}
                className="block w-full text-left px-3 py-2 hover:bg-sky-500 hover:text-white transition-colors duration-150"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropdownMenu;
