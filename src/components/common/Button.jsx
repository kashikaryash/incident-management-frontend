import React from 'react';
import { Button as MuiButton } from '@mui/material';

/**
 * Reusable primary button component using Material UI styling.
 * * @param {object} props
 * @param {string} props.label - The text displayed inside the button.
 * @param {function} props.onClick - Handler function for click events.
 * @param {'button' | 'submit' | 'reset'} [props.type='button'] - The native button type.
 * @param {string} [props.className=''] - Optional class names for overriding styles (Tailwind or custom).
 * @param {'text' | 'outlined' | 'contained'} [props.variant='contained'] - MUI style variant.
 * @param {'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'} [props.color='primary'] - MUI color.
 * @param {boolean} [props.disabled=false] - If true, the button is disabled.
 * @param {React.ReactNode} [props.startIcon] - Icon placed before the children.
 * @param {React.ReactNode} [props.endIcon] - Icon placed after the children.
 */
const Button = ({ 
    label, 
    onClick, 
    type = 'button', 
    className = '',
    variant = 'contained', // Defaulting to contained for the original component's look
    color = 'primary', 
    ...rest // Capture any other MUI button props (e.g., disabled, size, startIcon)
}) => {
    return (
        <MuiButton
            type={type}
            onClick={onClick}
            variant={variant}
            color={color}
            // sx prop allows passing custom styles, helpful if the Tailwind className needs MUI overrides
            className={className} 
            {...rest}
        >
            {label}
        </MuiButton>
    );
};

export default Button;