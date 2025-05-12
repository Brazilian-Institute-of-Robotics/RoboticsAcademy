import * as React from "react";
import Toolbar from "@mui/material/Toolbar";
import { Box } from "@mui/material";
import RoboticsTheme from "Components/RoboticsTheme";
import PropTypes from "prop-types";
import DownloadFileButton from "Components/buttons/DownloadFileButton";
import SaveButton from "Components/buttons/SaveButton";
import LoadFileButton from "Components/buttons/LoadFileButton";
import LoadServerFileButton from "../buttons/LoadServerFile";
import ResetButton from "Components/buttons/ResetButton";
import Frequencies from "Components/visualizers/Frequencies";
import PlayPauseButton from "Components/buttons/PlayPauseButton";
import "../../styles/layout_components/ExerciseControl.css";
import monitor from "../../images/monitoring2.png";

function ExerciseControl(props) {
  const [editorRendered, setEditorRendered] = React.useState(false);
  const [showFrequencies, setShowFrequencies] = React.useState(false);
  const [buttonActive, setButtonActive] = React.useState(false);
  const [fileName, setFileName] = React.useState("myCode");

  React.useEffect(() => {
    if (document.getElementById("code-container")) {
      setEditorRendered(true);
    }
  });
  const handleToggleFrequencies = () => {
    setButtonActive(!buttonActive);
    setShowFrequencies(!showFrequencies);
  };

  const handleChangeFileName = (name) => {

    // Filter of chars: / \ * ? : | \" < > ."
    const invalidChars = /[\/\\\?\%\*\:\|\"<>\'.]/g;

    if (!invalidChars.test(name)) {
      setFileName(name);
    }
  
  };

  return (
    <RoboticsTheme>
      <Toolbar className={"exercise-toolbar"}>
        {editorRendered ? (
          <Box id={"editor-control"}>
            <LoadFileButton changeFileName={handleChangeFileName}/>
            <LoadServerFileButton changeFileName={handleChangeFileName}/>
            <DownloadFileButton fileName={fileName} changeFileName={handleChangeFileName} />
            <SaveButton fileName={fileName} changeFileName={handleChangeFileName} />
          </Box>
        ) : null}
        <Box
          id={"robot-control"}
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            m: 1,
          }}
        >
          <PlayPauseButton></PlayPauseButton>
          <ResetButton></ResetButton>
          <Frequencies style={showFrequencies ? "visible" : "hidden"} />
          <button
            className={`button ${buttonActive ? "toggledColor" : ""}`}
            onClick={handleToggleFrequencies}
            id="toggleButton"
          >
            <img src={monitor} className="monitor"></img>
          </button>
        </Box>
      </Toolbar>
    </RoboticsTheme>
  );
}

ExerciseControl.propTypes = {
  specificConfiguration: PropTypes.any,
};

export default ExerciseControl;
