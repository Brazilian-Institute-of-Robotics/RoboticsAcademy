import React, { useState, useEffect } from 'react';

const FormError = ({ inputName, errors, touched, divStyle, textStyle }) => {
    const defaultDivStyle = { height: "1.2rem", marginTop: "4px" };
    const defaultTextStyle = { fontSize: "14px", color: "red" };
  
    return (
      <div style={divStyle || defaultDivStyle}>
        {errors!= null && errors[inputName] && touched[inputName] && (
          <p style={textStyle || defaultTextStyle}>
            {errors[inputName]}
          </p>
        )}
      </div>
    );
  };
  
  export default FormError;
  