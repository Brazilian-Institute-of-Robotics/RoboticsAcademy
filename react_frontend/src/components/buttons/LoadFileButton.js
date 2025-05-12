import FileUploadIcon from '@mui/icons-material/FileUpload';
import { Button } from "@mui/material";
import * as React from "react";
import PropTypes from "prop-types";

const LoadFileButton = ({changeFileName},props) => {

  const loadFile = (event) => {
    event.preventDefault();
    var fr = new FileReader();
    fr.onload = () => {
      RoboticsReactComponents.CodeEditor.setCode(fr.result);
    };
    fr.readAsText(event.target.files[0]);
    const fileNameExtension = event.target.files[0].name
    const filename = fileNameExtension.split(".")[0]

    //Change value on textfields "Filename" in components:
    //DownloadFileButton.js and SaveButton.js
    changeFileName(filename)
  };
  return (
    <Button
      variant="contained"
      sx={{ m: 1 }}
      color={"secondary"}
      startIcon={<FileUploadIcon />}
      component="label"
    >
      Load local code
      <input hidden accept=".py" type="file" onChange={loadFile} />
    </Button>
  );
};

LoadFileButton.propTypes = {
  context: PropTypes.any,
};

export default LoadFileButton;
