import React, { useState, useEffect } from 'react';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckSharpIcon from '@mui/icons-material/CheckSharp';

import { Box, Button, styled } from "@mui/material";
import FormError from "../message_system/FormError";
import { useFormikContext } from 'formik';

const UploadFileButton = ({formik, formikAtrributeName, title, successTitle, width, fileType, isDisable, setMessageFunction}, props) => {

    const formikContext = formik != null ? formik : useFormikContext()

    const [isWorldFile, setIsWorldFile] = useState(formikContext?.values[formikAtrributeName] == null ? false : true)
    
    // INSERT .WORLD FILE IN FORMIK VARIABLE WORLDFILE
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (selectedFile && selectedFile.name.endsWith(fileType)) {
            //console.log(formikContext.errors)
            formikContext.setFieldValue(formikAtrributeName, selectedFile)
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
        <div>
          <Button
            component="label"
            variant="contained"
            disabled={isDisable}
            startIcon={!isWorldFile ? <CloudUploadIcon /> : <CheckSharpIcon />}
            sx={{
              textTransform: "none",
              width: {width},
              bgcolor: !isWorldFile ? "primary.main" : "#4CAF50",
              color: "#fff",
              '&:hover': {
                backgroundColor: !isWorldFile ? "primary.dark" : "#388E3C",
              }
            }}
          >
            {!isWorldFile ? title : successTitle}
            <VisuallyHiddenInput
              type="file"
              onChange={handleFileChange}
              accept={fileType}
            />
          </Button>
          <FormError
            inputName={formikAtrributeName}
            errorsList={formikContext.errors} 
            touchedList={formikContext.touched}
            divStyle={{height: "1.2rem", marginTop: "8px", marginLeft: "8px"}}
          />
        </div>
    )
}

export default UploadFileButton