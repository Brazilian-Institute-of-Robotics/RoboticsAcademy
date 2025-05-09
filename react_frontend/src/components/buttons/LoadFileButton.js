import FileUploadIcon from '@mui/icons-material/FileUpload';
import { Button } from "@mui/material";
import * as React from "react";
import PropTypes from "prop-types";

const LoadFileButton = (props) => {
  const loadFile = (event) => {
    event.preventDefault();
    var fr = new FileReader();
    fr.onload = () => {
      RoboticsReactComponents.CodeEditor.setCode(fr.result);
    };
    fr.readAsText(event.target.files[0]);
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
