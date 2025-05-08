import React, { createContext, useState, useContext } from 'react';

const UserCodeFilesContext = createContext();

export const userCodeFiles = () => useContext(UserCodeFilesContext);

export const UserCodeFilesProvider = ({ children }) => {
  const [codeFiles, setCodeFiles] = useState([]);

  return (
    <UserCodeFilesContext.Provider value={{ codeFiles, setCodeFiles }}>
      {children}
    </UserCodeFilesContext.Provider>
  );
};