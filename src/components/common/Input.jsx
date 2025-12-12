import React from 'react';
import { TextField } from '@mui/material';

/**
 * Reusable input component wrapper using Material UI TextField.
 * This component supports all standard HTML input attributes and MUI TextField props.
 * * @param {object} props
 * @param {string} [props.label] - The floating label text for the input.
 * @param {string} props.name - The name attribute.
 * @param {string} props.value - The controlled value.
 * @param {function} props.onChange - The handler function for changes.
 * @param {'text' | 'email' | 'password' | 'number' | 'date' | 'tel'} [props.type='text'] - The native input type.
 * @param {string} [props.placeholder] - The placeholder text.
 * @param {string} [props.className] - Optional class names for external styling (e.g., margins).
 * @param {'filled' | 'outlined' | 'standard'} [props.variant='outlined'] - The MUI style variant.
 * @param {boolean} [props.fullWidth=true] - If true, the input takes up the full width.
 * @param {string} [props.helperText] - Optional helper text for validation or information.
 * @param {boolean} [props.required=false] - If true, displays a required indicator.
 * @param {boolean} [props.error=false] - If true, the label and border will be red.
 * @param {('small' | 'medium')} [props.size='small'] - The size of the input field.
 * @param {object} [props.sx] - Custom style overrides using the MUI system.
 * @param {object} [props.InputProps] - Props applied to the native input element.
 */
const Input = ({ 
    label, 
    name, 
    value, 
    onChange, 
    type = 'text', 
    placeholder = '', 
    className = '',
    variant = 'outlined', // Standard professional variant
    fullWidth = true, // Defaulting to full width for forms
    size = 'small', // Smaller size preferred for admin forms
    ...rest // Captures any other MUI TextField props (helperText, error, required, etc.)
}) => {
    return (
        <TextField
            // Native input attributes
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}

            // MUI attributes
            label={label}
            variant={variant}
            fullWidth={fullWidth}
            size={size}
            
            // Apply external classes for margins/layout
            className={className} 
            
            // Pass through any extra props like error, helperText, required
            {...rest}
        />
    );
};

export default Input;