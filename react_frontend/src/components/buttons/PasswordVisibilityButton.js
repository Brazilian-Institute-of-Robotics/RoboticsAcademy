import React from 'react';

import { InputAdornment, IconButton } from "@mui/material";

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const PasswordVisibilityButton = ({isVisible, handleIsVisible}, props) => {
    return (
        <InputAdornment position="end">
            <IconButton onClick={handleIsVisible}>
                {isVisible ? <VisibilityIcon/> : <VisibilityOffIcon/>}
            </IconButton>
        </InputAdornment>
    )
}

export default PasswordVisibilityButton;