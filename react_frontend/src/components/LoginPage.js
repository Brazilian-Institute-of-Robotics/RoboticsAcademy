import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box } from "@mui/material";
import { saveContainerManagerPorts, deleteContainerManagerPorts } from  '../helpers/storeManager'
import { LoadingButton } from '@mui/lab';
import { login } from '../helpers/auth';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false)

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
            backgroundColor: "#f5f5f5",
          }}
        >
          <Paper elevation={4} sx={{ padding: 4, width: 320 }}>
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
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <LoadingButton
                fullWidth
                loadingIndicator="Loading..."
                loading={loading}
                type="submit"
                variant="contained"
                color="primary"
                sx={{ marginTop: 2 }}
              >
                Enter
              </LoadingButton>
            </form>
          </Paper>
        </Box>
    );
};

export default LoginPage;