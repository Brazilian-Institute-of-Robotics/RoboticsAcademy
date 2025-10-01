import { fontWeight } from '@mui/system';
import React from 'react';

const FormError = ({ inputName, errorsList, touchedList, divStyle, textStyle }) => {

    const hasError = touchedList?.[inputName] && errorsList?.[inputName];

    const defaultDivStyle = { height: "1.2rem", marginTop: "4px" };
    const defaultTextStyle = { fontSize: "14px", color: "red", fontWeight: "bold" };
  
    return (
      <div style={divStyle || defaultDivStyle}>
        {hasError && (
          <p style={textStyle || defaultTextStyle}>
            {errorsList[inputName]}
          </p>
        )}
      </div>
    );
  };
  
  export default FormError;
  