import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Box,
    Typography,
  } from "@mui/material";
  import { userCodeFiles } from "../../contexts/UserCodeFilesContex";
  import React, { useState } from "react";
  
  const SelectCodeModal = ({ modalTitle, buttonTitle, open, onClose, onLoad }) => {
    const { codeFiles } = userCodeFiles();
    const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  
    const handleSelectFile = (index) => {
      setSelectedFileIndex(index);
    };
    
    const handleClose = () => {
      setSelectedFileIndex(null);
      onClose();
    };

    const handleLoad = () => {
      if (selectedFileIndex !== null) {
        const selected = codeFiles[selectedFileIndex];
        onLoad(selected);
        handleClose();
      }
    };
  
    return (
      <Dialog open={open} maxWidth="lg" fullWidth
        onClose={(event, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') { handleClose(); }
        }}
      >
        <DialogTitle>{modalTitle}</DialogTitle>
        <DialogContent
           sx={{
            display: "flex",
            flexDirection: "row",
            gap: 2,
            height: "100%", // importante para os filhos herdarem altura
          }}
        >
          <Box display="flex" flexDirection="row" gap={2}>
            {/* List of files */}
            <Box 
              sx={{
                width: "30%",
                overflow: "auto",
                borderRight: "1px solid #ccc",
                pr: 2,
                maxHeight: "60vh",
                minWidth: "200px"
              }}
              >
              <List>
                {codeFiles.map((file, index) => (
                  <ListItem disablePadding key={index}>
                    <ListItemButton
                      selected={index === selectedFileIndex}
                      onClick={() => handleSelectFile(index)}
                    >
                      <ListItemText primary={file.filename} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
  
            {/* Selected file content */}
            
              {selectedFileIndex !== null ? (
                <Box
                  sx={{
                    width: "70%",
                    overflow: "auto",
                    pl: 2,
                    maxHeight: "60vh",
                  }}
                >
                  <pre style={{ whiteSpace: "pre-wrap" }}>
                    {codeFiles[selectedFileIndex].content}
                  </pre>
                </Box>
                
              ) : (
                <Box
                  sx={{
                    width: "70%",
                    overflow: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "1.1rem",
                      whiteSpace: "pre-wrap",
                      textAlign: "center",
                    }}
                  >
                   {codeFiles.length == 0 ? "No file saved in this exercise" : "Select one file on the left"}
                  </Typography>
                </Box>
              )}
           
          </Box>
        </DialogContent>
  
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleLoad}
            variant="contained"
            color="primary"
            disabled={selectedFileIndex === null}
          >
            {buttonTitle}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default SelectCodeModal;
  