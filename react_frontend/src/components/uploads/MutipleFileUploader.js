import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Tooltip,
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

const MutipleFileUploader = ({formik, formikAtrributeName, fileTypes, startText}, props) => {

  const [files, setFiles] = useState([]);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const allFiles = [...files];

    //For each new file, is verify with there is a file with same name and same
    //update timestamp
    selected.forEach(file => {
      if (!allFiles.some(f => f.name === file.name && f.lastModified === file.lastModified)) {
        allFiles.push(file);
      }
    });

    setFiles(allFiles);
    formik.setFieldValue(formikAtrributeName, allFiles)
  };

  const handleRemove = (index) => {
    new_array = files.filter((file, i) => i !== index)

    setFiles(new_array);
    formik.setFieldValue(formikAtrributeName, new_array)
  };

  const handleClickAdd = () => {
    fileInputRef.current.click();
  };

  return (
    <Box p={2}>
      {/* hidden input */}
      <input
        type="file"
        accept={fileTypes}
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <Paper
        variant="outlined"
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 2,
          p: 2,
          minHeight: 160,
          position: 'relative',
        }}
      >
        
        {files.length === 0 ? (
          <Box
            height="100%"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            color="text.secondary"
          >
            <Typography sx={{mt: 5}} variant="h5">{startText}</Typography>
            <Typography sx={{color:"red"}}variant="h7">Allowed formats: {fileTypes}</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              overflowX: 'auto',
              gap: 2,
              pt: 1,
              pb: 5, // espaço para não cobrir o botão no canto inferior
            }}
          >
            {files.map((file, index) => (
              <Paper
                key={index}
                elevation={1}
                sx={{
                  minWidth: 150,
                  p: 2,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  flexShrink: 0,
                  backgroundColor: "#96938a"
                }}
              >
                <InsertDriveFileIcon color="action" fontSize="large" />
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    wordBreak: 'break-word',
                    maxWidth: '100%',
                  }}
                >
                  {file.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleRemove(index)}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    color: 'error.main',
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Paper>
            ))}
          </Box>
        )}

        {/* Botão de adicionar no canto inferior direito */}
        <Tooltip title="Add file">
          <IconButton
            onClick={handleClickAdd}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              width: 64,
              height: 64,
              borderRadius: '50%',
              color: "white",
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            <AddIcon fontSize="small"/>
          </IconButton>
        </Tooltip>
      </Paper>
    </Box>
  );
};

export default MutipleFileUploader;
