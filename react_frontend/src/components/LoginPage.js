import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box } from "@mui/material";
import { saveContainerManagerPorts, deleteContainerManagerPorts } from  '../helpers/storeManager'
import { LoadingButton } from '@mui/lab';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false)

    const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT;
    const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`;

    const handleSubmit = async(e) => {
        setLoading(true)
        await submit(e)
        setLoading(false)
    }

    const submit = async (e) => {
        e.preventDefault();
        try {
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            const response = await fetch(`${serverBase}/api/v1/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ username, password }),
            });
            if(response.ok) {
                const data = await response.json();

                //Saves on local storage
                saveContainerManagerPorts(data['container-ports']);
                window.location.href = '/exercises';
            }
            else alert('Credenciais inválidas');
        } catch (err) {
            console.log("ERROR: "+err)
            alert('Erro local');
        }finally{}
    };

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