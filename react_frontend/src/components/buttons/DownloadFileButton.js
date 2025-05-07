import * as React from "react";
import DownloadIcon from '@mui/icons-material/Download';
import { Box, Button, TextField } from "@mui/material";
import { saveCode } from "../../helpers/utils";
import PropTypes from "prop-types";

const DownloadFileButton = (props) => {
  const [fileName, setFileName] = React.useState("myCode");
  const saveFile = () => {
    let userCode = "";
    userCode = RoboticsReactComponents.CodeEditor.getCode();
    saveCode(fileName, userCode);
  };
  return (
    <Box sx={{ display: "flex" }}>
      <Button
        id={"save"}
        variant="contained"
        color={"secondary"}
        startIcon={<DownloadIcon />}
        sx={{ m: 1 }}
        onClick={saveFile}
      >
        Download code
      </Button>
      <TextField
        sx={{ m: 1 }}
        size={"small"}
        id="filename"
        label="Filename"
        color={"secondary"}
        value={fileName}
        onChange={(e) => {
          setFileName(e.target.value);
        }}
      />
    </Box>
  );
};

DownloadFileButton.propTypes = {
  context: PropTypes.any,
};

export default DownloadFileButton;
