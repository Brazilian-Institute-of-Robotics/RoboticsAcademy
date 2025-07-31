import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { Button, Checkbox, FormControlLabel, Grid, Typography } from '@mui/material';
import { Editor } from '@monaco-editor/react';
import FormError from '../message_system/FormError';

export default function HalGenerator({
    formik, availableNodes, selectedNodes, 
    isNodeSelected, toggleNode, handleGenerate, props
}) {
    
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
                    sx={{ width:"50ch"}}
                    //loading={isGenarating}
                    loadingIndicator="Loading..."
                    //disabled={isDeleting || isSaving}
                    onClick={handleGenerate}
                >
                    Generate HAL. py
                </Button>
                {
                    isNodeSelected ? "" : ( <div style={{ height: "1.2rem", marginTop: "16px", marginLeft:"16px"}}>
                        <p style={{ fontSize: "14px", color: "red", align:"center"}}>
                            Please select at least one node
                        </p>
                </div>)
                }
            </Box>
            {/* <FormError inputName="code" errors={formik.errors} touched={formik.touched}/> */}
            
            {/* CODE EDITOR */}
            <Editor
                name="code"
                height="600px"
                defaultLanguage="python"
                value={formik.values.code}
                onChange={(value) => formik.setFieldValue("code", value || "")}
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