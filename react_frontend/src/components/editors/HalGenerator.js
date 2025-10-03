import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { Button, Checkbox, FormControlLabel, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import { Editor } from '@monaco-editor/react';
import FormError from '../message_system/FormError';

import { getCookie } from '../../helpers/cookie';
import { useFormikContext } from 'formik';

import DescriptionIcon from '@mui/icons-material/Description';
import { bgcolor, fontSize, minHeight } from '@mui/system';

export default function HalGenerator({
    formik, formikAtrributeName, isLoading, 
    setIsLoading, isDisable, setMessageFunction,
    initialHalCode=null
}, props) {

    const formikContext = formik != null ? formik : useFormikContext()

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
            console.log(data)
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
        if (selectedNodes.length == 0)
          setIsNodeSelected(false)
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
            if (res.ok)
                formikContext.setFieldValue(formikAtrributeName, data.code)
            else {
              setMessageFunction("❌ Error on generate code (API). please contact suport");
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          } catch (error) {
            //console.log(error)
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
                             <Grid container>
                                <Grid item sx={{
                                    bgcolor:"#D9C8B4", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "center"
                                }}> 
                                    <FormControlLabel
                                        key={node.id}
                                        control={
                                            <Checkbox
                                                sx={{ml:2}}
                                                value={node.name}
                                                checked={selectedNodes.includes(node.id)}
                                                onChange={() => toggleNode(node.id)}
                                            />
                                        }
                                        label={node.name}
                                    />
                                    <Tooltip
                                        enterDelay={100}
                                        title={
                                            <Box sx={{ whiteSpace: "pre-line", maxWidth: 320, fontSize:14 }}>
                                                {node.description}
                                            </Box>
                                        }
                                    >
                                        <IconButton aria-label={`description${node.name}`} fontSize="small">
                                            <DescriptionIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                            </Grid>
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
            {
                initialHalCode != null ? 
                    (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                            <Button 
                                variant="contained" 
                                sx={{ width:"30ch", textTransform: "none"}}
                                onClick={() => {formikContext.setFieldValue(formikAtrributeName, initialHalCode)}}
                            >
                                Reset HAL.py
                            </Button>
                        </Box>
                    ) : 
                    (null)
            }
                    
            
            <FormError inputName={formikAtrributeName} errorsList={formikContext.errors} touchedList={formikContext.touched}/>
            {/* CODE EDITOR */}
            <Editor
                name="code"
                height="600px"
                defaultLanguage="python"
                value={formikContext.values[formikAtrributeName]}
                onChange={(value) => formikContext.setFieldValue(formikAtrributeName, value || "")}
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