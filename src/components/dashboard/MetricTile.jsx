import React from "react";
import { Paper, Typography, Box } from "@mui/material";

/**
 * Component to display a single, large key performance indicator (KPI) metric.
 * @param {object} props
 * @param {string} props.label - The descriptive text below the metric value.
 * @param {number|string} props.value - The main metric value (e.g., a count or percentage).
 * @param {('xs' | 'sm' | 'md' | 'lg' | 'xl')} [props.size='md'] - Controls the size of the metric text.
 * @param {string} [props.color='primary'] - Controls the color of the metric value (MUI theme color).
 */
const MetricTile = ({ label, value, size = 'md', color = 'primary' }) => {
    // Define font size based on the 'size' prop
    const valueVariant = size === 'lg' ? 'h3' : size === 'sm' ? 'h5' : 'h4';

    return (
        <Paper 
            elevation={3} // Provides a lift and shadow
            sx={{ 
                p: 3, 
                textAlign: 'center', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center' 
            }}
        >
            <Box sx={{ minHeight: 40 }}>
                {/* Metric Value */}
                <Typography 
                    variant={valueVariant} 
                    component="div"
                    sx={{ 
                        fontWeight: 700, 
                        color: `${color}.main`, // Use MUI theme color
                    }}
                >
                    {value}
                </Typography>
            </Box>
            
            {/* Label */}
            <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mt: 1 }}
            >
                {label}
            </Typography>
        </Paper>
    );
};

export default MetricTile;