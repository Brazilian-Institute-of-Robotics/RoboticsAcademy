import React, { useState } from 'react';
import { TextField, Paper, Typography, Box } from "@mui/material";
import { LoadingButton } from '@mui/lab';
import { generatePasswordRecoverLink } from '../helpers/auth';


import { useFormik } from "formik";
import * as Yup from "yup"
import FormError from './message_system/FormError';

const PasswordResetRequest = () => {
    const [responseMsg, setResponseMsg] = useState('');
    const [loading, setLoading] = useState(false)

    const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT;
    const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`;

    const formik = useFormik({
        initialValues: {email: ""},
        validationSchema: Yup.object({
          email: Yup.string().required("Email is required").email("Inform a valid email")
        }),
        onSubmit: async (values, {setSubmitting}) => {
            setLoading(true)
            try{
                
                const result = await generatePasswordRecoverLink(serverBase, values.email)
                if (result.success == 1) 
                    setResponseMsg(`✅ Success! Link was sent to your email`);
                else 
                    setResponseMsg(`❌ ${result.error}`);
        
            } catch (error) {
                setResponseMsg(`❌ Fail to password recovery. Check connection or contact suport`);
            }finally{
                setLoading(false)
            }
        },
      })

    return (
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#474444",
          }}
        >
          <Paper elevation={4} sx={{ padding: 4, width: 450,}}>
            <Typography variant="h5" align="center" gutterBottom>
              Recover Password
            </Typography>
            <Typography variant="h7" align="center" color="orange" gutterBottom>
               {responseMsg}
            </Typography>
            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                type="text"
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                margin="normal"
              />
               <FormError inputName="email" errors={formik.errors} touched={formik.touched} divStyle={{height: "1.2rem"}}/>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
              }}>
                <LoadingButton
                    fullWidth
                    align="center"
                    loadingIndicator="Loading..."
                    loading={loading}
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{marginTop: 1, width:"20ch", align:"center" }}
                >
                    Send
                </LoadingButton>
              </Box>
              
            </form>
          </Paper>
        </Box>
    );
};

export default PasswordResetRequest;