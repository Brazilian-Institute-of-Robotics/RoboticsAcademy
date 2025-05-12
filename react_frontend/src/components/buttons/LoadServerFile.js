import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { Box, Button } from "@mui/material";
import * as React from "react";
import PropTypes from "prop-types";
import { useState } from "react";
import SelectMultipleCodeModal from '../modals/SelectMutipleCodeModal';

const LoadServerFileButton = ({changeFileName},props) => {

  const [openModal, setOpenModal] = useState(false);

  return (
    <Box sx={{ display: "flex" }}>
      <Button
        variant="contained"
        sx={{ m: 1 }}
        color={"secondary"}
        startIcon={<CloudUploadOutlinedIcon />}
        component="label"
        onClick={() => setOpenModal(true)}
      >
        Load server code
      </Button>
      <SelectMultipleCodeModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        changeFileName={changeFileName}
      />
    </Box>
  );
};

LoadServerFileButton.propTypes = {
  context: PropTypes.any,
};

export default LoadServerFileButton;
