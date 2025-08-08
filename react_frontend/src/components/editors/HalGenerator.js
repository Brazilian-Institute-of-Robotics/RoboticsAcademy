import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { Button, Checkbox, FormControlLabel, Grid, Typography } from '@mui/material';
import { Editor } from '@monaco-editor/react';
import FormError from '../message_system/FormError';

import { getCookie } from '../../helpers/cookie';

export default function HalGenerator({
    formik, formikAtrributeName, isLoading, 
    setIsLoading, isDisable, setMessageFunction
}, props) {

    const [availableNodes, setAvailableNodes] = useState([]);
    const [selectedNodes, setSelectedNodes] = useState([])
    const [isNodeSelected, setIsNodeSelected] = useState(true)

    const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT;
    const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`;

    // GETS NODES TYPES'S LIST FROM DATABASE
    useEffect(() => {
        const csrfToken = getCookie("csrftoken")
        const fetchNodeTypes = async () => {
            try {
            const response = await fetch(`${serverBase}/api/v1/node`, {
                method: 'GET',
                headers: {
                'X-CSRFToken': csrfToken
                },
            });

            const data = await response.json();
            setAvailableNodes(data)

            } catch (error) {
                setMessageFunction("❌ Error to find nodes types. Please contact suport")
            }
        };

        fetchNodeTypes();
    }, []);

    //HANDLE TO CHANGE SELECTED NODES
    const toggleNode = (node_id) => {
        if (selectedNodes.includes(node_id)) 
            setSelectedNodes(selectedNodes.filter((n) => n !== node_id))
        else 
            setSelectedNodes([...selectedNodes, node_id])  
    };

    const handleGenerate = async () => {
        if (selectedNodes.length == 0){
          setIsNodeSelected(false)
          formik.setFieldValue(formikAtrributeName, "")
        }
        else {
          try {
            setIsNodeSelected(true)
            setIsLoading(true);
    
            const csrfToken = getCookie("csrftoken")
            const res = await fetch(`${serverBase}/api/v1/hal/`, {
              method: 'POST',
              headers: {
                'X-CSRFToken': csrfToken
              },
              body: JSON.stringify({ nodes_ids: selectedNodes}),
            });
    
            const data = await res.json();
            if (res.ok) {
              formik.setFieldValue("code", data.code)
            } else {
              setMessageFunction("❌ Error on generate code (API). please contact suport");
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          } catch (error) {
            setMessageFunction("❌ Error on generate code (FRONT END). please contact suport");
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }finally{
            setIsLoading(false);
          }
        }
        
      };

    
    return (
        <div>
            {/* NODE'S SELECTION GRID */}
            <Typography variant="h6" gutterBottom>
                Select necessary nodes
            </Typography>
            <Box
                sx={{
                    m: 2, 
                    maxHeight: 200,
                    overflowY: 'auto',
                    border: '1px solid #ccc',
                    borderRadius: 2,
                    padding: 1,
                }}
            >
                <Grid container spacing={2} sx={{ m: 2, p:2,}}>
                    {availableNodes.map((node) => (
                        <Grid item xs={3} key={node.id}>
                            <FormControlLabel
                                key={node.id}
                                control={
                                    <Checkbox
                                        value={node.name}
                                        checked={selectedNodes.includes(node.id)}
                                        onChange={() => toggleNode(node.id)}
                                    />
                                }
                                label={node.name}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* BUTTON TO GENERATE HAL.PY CODE */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 2,
                mb: 2
            }}>
                <Button 
                    variant="contained" 
                    sx={{ width:"30ch", textTransform: "none"}}
                    loading={isLoading ? true : undefined}
                    loadingIndicator="Loading..."
                    disabled={isDisable}
                    onClick={handleGenerate}
                >
                    Generate HAL.py
                </Button>
                {
                    isNodeSelected ? "" : ( <div style={{ height: "1.2rem", marginTop: "16px", marginLeft:"16px"}}>
                        <p style={{ fontSize: "14px", color: "red", align:"center"}}>
                            Please select at least one node
                        </p>
                </div>)
                }
            </Box>
            <FormError inputName={formikAtrributeName} errors={formik.errors} touched={formik.touched}/>
            
            {/* CODE EDITOR */}
            <Editor
                name="code"
                height="600px"
                defaultLanguage="python"
                value={formik.values[formikAtrributeName]}
                onChange={(value) => formik.setFieldValue(formikAtrributeName, value || "")}
                theme="vs-dark"
                options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    wordWrap: "on",
                }}
            />
        </div>
    )
}