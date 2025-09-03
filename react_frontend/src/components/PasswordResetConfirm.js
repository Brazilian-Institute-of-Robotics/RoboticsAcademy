import React, { useState, useEffect } from 'react';
import { TextField, Paper, Typography, Box, Link } from "@mui/material";
import { LoadingButton } from '@mui/lab';
import { confirmPasswordRecover, checkPasswordConfirmToken } from '../helpers/auth';


import { useFormik } from "formik";
import * as Yup from "yup"
import FormError from './message_system/FormError';
import PasswordVisibilityButton from './buttons/PasswordVisibilityButton';

const PasswordResetConfirm = () => {
    const [responseMsg, setResponseMsg] = useState('');
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showRetype, setShowRetype] = useState(false)

    const { uid, token } = window.PASSWORD_RESET
    const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT;
    const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`;

    const formik = useFormik({
      initialValues: {password: "", retypePassword: ""},
      validationSchema: Yup.object({
          password: Yup
            .string()
            .required('Please enter your password.')
            .min(8, 'Your password is too short.'),
          retypePassword: Yup
            .string()
            .required('Please retype your password.')
            .oneOf([Yup.ref('password')], 'Your passwords do not match.')
      }),
      onSubmit: async (values, {setSubmitting}) => {
          setLoading(true)
          try{
              const result = await confirmPasswordRecover(serverBase, uid, token, values.password, values.retypePassword)
              if (result.success == 1){
                  setResponseMsg(`✅ Success! Password was updated.`);
                  setShowForm(false)
              }
              else 
                  setResponseMsg(`❌ ${result.error}`);
      
          } catch (error) {
              setResponseMsg(`❌ Fail to change password. Check connection or contact suport`);
          }finally{
              setLoading(false)
          }
      },
    })

    useEffect(() => {
      const checkToken = async () => {
        const result = await checkPasswordConfirmToken(serverBase, uid, token)
        if (result.success == 1)
          setShowForm(true)
        else{
          setShowForm(false)
          setResponseMsg("❌ Token invalid. Please go to recover password page")
        }
      }

      checkToken()
    }, []);
    
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
              Inform new password
            </Typography>
            <Typography variant="h7" align="center" color="orange" gutterBottom>
               {responseMsg}
            </Typography>
            {
              showForm ? (
                <form onSubmit={formik.handleSubmit}>
                    <TextField
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        name="password"
                        label="Password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        margin="normal"
                        InputProps={{
                          endAdornment: (
                            <PasswordVisibilityButton 
                              isVisible={showPassword} 
                              handleIsVisible={() => setShowPassword(!showPassword)}
                            />
                          )
                        }}
                    />
                    <FormError inputName="password" errors={formik.errors} touched={formik.touched} divStyle={{height: "1.2rem"}}/>

                    <TextField
                        fullWidth
                        type={showRetype ? "text" : "password"}
                        name="retypePassword"
                        label="Retype password"
                        value={formik.values.retypePassword}
                        onChange={formik.handleChange}
                        margin="normal"
                        InputProps={{
                          endAdornment: (
                            <PasswordVisibilityButton 
                              isVisible={showRetype} 
                              handleIsVisible={() => setShowRetype(!showRetype)}
                            />
                          )
                        }}
                    />
                    <FormError inputName="retypePassword" errors={formik.errors} touched={formik.touched} divStyle={{height: "1.2rem"}}/>

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
              ) : 
              (
                <div>
                  <br></br>
                  <Link  href="/login">Return to login</Link>
                </div>
              )
            }
          </Paper>
        </Box>
    );
};

export default PasswordResetConfirm;