import React, { useState } from 'react';
import { TextField, Paper, Typography, Box, Link} from "@mui/material";
import { LoadingButton } from '@mui/lab';
import { login } from '../helpers/auth';

import PasswordVisibilityButton from './buttons/PasswordVisibilityButton';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] =  useState(false)

    const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT;
    const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`;

    const handleSubmit = async(e) => {
        e.preventDefault();
        setLoading(true)
        await login(serverBase, username, password)
        setLoading(false)
    }

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
          <Paper elevation={4} sx={{ padding: 4, width: 320,}}>
            <Typography variant="h5" align="center" gutterBottom>
              Login
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                margin="normal"
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Password"
                type= {showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <PasswordVisibilityButton 
                      isVisible={showPassword} 
                      handleIsVisible={() => setShowPassword(!showPassword)}
                    />
                  )
                }}
              />
              <LoadingButton
                fullWidth
                loadingIndicator="Loading..."
                loading={loading}
                type="submit"
                variant="contained"
                color="primary"
                sx={{ marginTop: 2, marginBottom: 2 }}
              >
                Enter
              </LoadingButton>
            </form>
            <Link  href="/password-reset-request">Forget password?</Link>
          </Paper>
        </Box>
    );
};

export default LoginPage;