import React, { useState } from "react";
import { LoadingButton } from '@mui/lab';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
  } from "@mui/material";

export default function ConfirmationModal ({ 
    modalTitle, 
    buttonTitle, 
    open, 
    onClose, 
    onConfirm,
    themeColors = {primary: "#8E7756", secondary:"#D9C8B4"}
}) {

    const [isLoading, setIsLoading] = useState(false)

    const handleClose = () => {
        onClose();
    };

    const handleLoad = async () => {
        setIsLoading(true)
        await onConfirm();
        setIsLoading(false)
        handleClose();

    };

    return (
        <Dialog 
            open={open} 
            maxWidth="sm"
            fullWidth
            onClose={(event, reason) => {
                if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') { handleClose(); }
            }}
        >
            <DialogTitle sx={{ bgcolor: themeColors.primary}}>
                {modalTitle}
            </DialogTitle>

            <DialogContent dividers sx={{  bgcolor: themeColors.secondary, height: "100%" }}>
                <Typography  variant="h7">Are you sure you want to this?</Typography>
            </DialogContent>

            <DialogActions sx={{bgcolor: themeColors.secondary}}>
                <Button disabled={isLoading} onClick={handleClose}>Cancel</Button>
                <LoadingButton
                    sx={{
                        bgcolor: themeColors.primary,
                        '&:hover': {backgroundColor: themeColors.secondary}
                    }}
                    onClick={handleLoad}
                    variant="contained"
                    loading={isLoading}
                    loadingIndicator="Loading..."
                    disabled={false}
                >
                {buttonTitle}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    )
}