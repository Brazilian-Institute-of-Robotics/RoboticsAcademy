import React, { useContext, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
} from "@mui/material";
import { userCodeFiles } from "../../contexts/UserCodeFilesContex";
import { LoadingButton } from '@mui/lab';
import { useTheme } from "@mui/material/styles";

const DeleteCodeModal = ({ open, onClose, changeFileName }) => {

  const { codeFiles, setCodeFiles } = userCodeFiles();
  const [selectedFileToReadIndex, setSelectedFileToReadIndex] = useState(null);
  const [selectedFilesToDeleteIndex, setSelectedFilesToDeleteIndex] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("")
  const [deleteMessage, setDeleteMessage] = useState("")

  const config = JSON.parse(
    document.getElementById("exercise-config").textContent
  );
  const theme = useTheme();
  const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT;

  useEffect(() => {
    if(codeFiles == null || codeFiles.length == 0)
      setMessage("No file save in this exercise")
    else
      setMessage("Click on a file name button to see code")
      
  },[codeFiles, open]);

  const toggleFileSelection = (index) => {
    if (selectedFilesToDeleteIndex.includes(index)) {
      setSelectedFilesToDeleteIndex(selectedFilesToDeleteIndex.filter((i) => i !== index));
    } else {
      setSelectedFilesToDeleteIndex([...selectedFilesToDeleteIndex, index]);
    }
  };

  const handleClose = () => {
    setSelectedFileToReadIndex(null);
    setSelectedFilesToDeleteIndex([])
    setDeleteMessage("")
    onClose();
  };

  const handleLoad = () => {
    if (selectedFileToReadIndex !== null) {
      const file = codeFiles[selectedFileToReadIndex];
      RoboticsReactComponents.CodeEditor.setCode(file.content);

      //Change value on textfields "Filename" in components:
      //DownloadFileButton.js and SaveButton.js
      changeFileName(file.filename)
      handleClose();
    }
  };

  const handleDelete = async () => {

    const fileNames = selectedFilesToDeleteIndex.map(
      (index) => codeFiles[index].filename
    )
    setIsDeleting(true)
    setSelectedFileToReadIndex(null);
    setSelectedFilesToDeleteIndex([])

    await deleteCodes(fileNames)

    setIsDeleting(false)
  };


  const deleteCodes = async(fileNames) => {

    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`;
    let requestUrl = `${serverBase}/exercises/exercise/${config[0].exercise_id}/delete_user_codes`;

    try {
      const confirmed = window.confirm("Are you sure in delete theses codes?");
      if (!confirmed) return;

      setDeleteMessage("Codes are been deleted...")

      const response = await fetch(requestUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({ "fileNames": fileNames }),
      });

      //Simutale request waiting
      //await new Promise(resolve => setTimeout(resolve, 2000));

      if(response.ok){
        //filtra todos os arquivos removidos do codeFiles
        const newCodeFiles = codeFiles.filter(
          (item) => !fileNames.includes(item.filename)
        );
       
        setCodeFiles(newCodeFiles)
        setDeleteMessage("Files deleted successfully")
        
      }else{
        setDeleteMessage("Failed to delete files, problem on request or API")
      }
      
    } catch (error) {
      setDeleteMessage("Failed to delete files, problem on FRONT")
    }finally{}
     
};

  return (
    <Dialog
      fullWidth
      maxWidth="lg"
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') { handleClose(); }
      }}
    >
      <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, marginBottom: "10px"}}>
          Codes stored
      </DialogTitle>
      <DialogContent
        sx={{
            display: "flex",
            flexDirection: "row",
            gap: 2,
            height: "100%", // importante para os filhos herdarem altura
          }}
      >
        <Box display="flex" flexDirection="row" gap={2}>
          {/* Lado esquerdo */}
          <Box
            sx={{
                width: "30%",
                overflow: "auto",
                borderRight: "1px solid #ccc",
                pr: 2,
                maxHeight: "60vh",
                minWidth: "340px"
              }}
          >
            {/* Cabeçalho da "tabela" */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                paddingBottom: 1,
                borderBottom: "1px solid #ccc",
              }}
            >
              <Typography variant="subtitle1">File Name</Typography>
              <Typography variant="subtitle1">To Delete</Typography>
            </Box>

            {/* Lista de arquivos */}
            {codeFiles.map((file, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingY: 1,
                  borderBottom: "1px solid #eee",
                }}
              >
                <Button
                  style={{textTransform: 'none'}}
                  variant="contained"
                  color={selectedFileToReadIndex === index ? "primary" : "secondary"}
                  onClick={() => setSelectedFileToReadIndex(index)}
                  disabled={isDeleting}
                >
                  {file.filename}
                </Button>
                <Checkbox
                  checked={selectedFilesToDeleteIndex.includes(index)}
                  onChange={() => toggleFileSelection(index)}
                  inputProps={{ "aria-label": `Select ${file.filename}` }}
                  disabled = {isDeleting}
                />
              </Box>
            ))}
          </Box>

          {/* Lado direito */}
          <Box
            sx={{
                width: "70%",
                overflow: "auto",
                pl: 2,
                maxHeight: "60vh",
              }}
          >
            {selectedFileToReadIndex !== null && !isDeleting ? (
              <Typography
                variant="body1"
                sx={{ whiteSpace: "pre-wrap", fontSize: "1.1rem" }}
              >
                {codeFiles[selectedFileToReadIndex]?.content}
              </Typography>
            ) : (
              <Box 
                display="flex" 
                flexDirection="column"
                justifyContent="center" 
                alignItems="center" 
                height="100%"
              >
                <Typography variant="body1" color="error" align="center">
                  {(deleteMessage)}
                </Typography>
                <Typography variant="h6" color="text.secondary" align="center">
                  {message}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose}
          disabled={isDeleting}
        >
          Close
        </Button>

        <Button 
          onClick={handleLoad}
          disabled={selectedFileToReadIndex == null || isDeleting}
          variant="contained"
          color="primary"
        >
          Load
        </Button>

        <LoadingButton
          loadingIndicator="Deleting..."
          loading={isDeleting}
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={selectedFilesToDeleteIndex.length === 0}
          
        >
          Delete
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCodeModal;
