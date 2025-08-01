import React, { useState, useEffect } from 'react';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckSharpIcon from '@mui/icons-material/CheckSharp';

import { Box, Button, styled } from "@mui/material";
import FormError from "../message_system/FormError";

const UploadFileButton = ({formik, formikAtrributeName, fileType, isDisable, setMessageFunction}, props) => {

    const [isWorldFile, setIsWorldFile] = useState(false)

    // INSERT .WORLD FILE IN FORMIK VARIABLE WORLDFILE
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (selectedFile && selectedFile.name.endsWith(fileType)) {
            formik.setFieldValue(formikAtrributeName, selectedFile)
            setIsWorldFile(true)
        } else {
            setIsWorldFile(false)
            setMessageFunction('❌ Only .world file is allowed')
        }
    };

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    return (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 2,
            mb: 2
        }}>
          <Button
            component="label"
            variant="contained"
            disabled={isDisable}
            startIcon={!isWorldFile ? <CloudUploadIcon /> : <CheckSharpIcon />}
            sx={{
              width:"50ch",
              bgcolor: !isWorldFile ? "primary.main" : "#4CAF50",
              color: "#fff",
              '&:hover': {
                backgroundColor: !isWorldFile ? "primary.dark" : "#388E3C",
              }
            }}
          >
            {!isWorldFile ? "Upload world file" : "File received"}
            <VisuallyHiddenInput
              type="file"
              onChange={handleFileChange}
              accept={fileType}
            />
          </Button>
          <FormError 
            inputName={formikAtrributeName}
            errors={formik.errors} 
            touched={formik.touched}
            divStyle={{height: "1.2rem", marginTop: "8px", marginLeft: "8px"}}
          />
        </Box>
    )
}

export default UploadFileButton