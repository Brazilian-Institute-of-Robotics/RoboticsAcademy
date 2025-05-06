import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Alert } from '@mui/material';
import { saveContainerManagerPorts, deleteContainerManagerPorts } from  '../helpers/storeManager'

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT;
    const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`;

    const handleSubmit = async (e) => {
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
            if (response.ok) {
                const data = await response.json();
                console.log(data['container-ports'])

                //Saves on local storage
                saveContainerManagerPorts(data['container-ports']);

                window.location.href = '/exercises';
            }
            else setError('Credenciais inválidas');
        } catch (err) {
            setError('Erro local: '+err);
        }
    };
    const handleLogout = async (e) => {
        try {
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            const response = await fetch(`${serverBase}/api/v1/logout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
            });
            if (response.ok) {
                //Delete localStorage
                deleteContainerManagerPorts()
                alert('Logout realizado com sucesso');
            } else {
                alert('Erro ao fazer logout');
            }
        } catch (err) {
            setError('Erro local: '+err);
        }
    }

    return (
        <Container maxWidth="sm">
            <Typography variant="h4">Login</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <form onSubmit={handleSubmit}> 
                <label>
                    USERNAME: 
                    <input type='text' value={username} onChange={e => setUsername(e.target.value)} />
                </label>
                <label>
                    PASSWORD: 
                    <input type='password' value={password} onChange={e => setPassword(e.target.value)} />
                </label>
                <br />
                <Button type="submit" variant="contained">Entrar</Button>
                <Button variant="outlined" color="secondary" onClick={handleLogout}>
                    Logout
                </Button>
            </form>
        </Container>
    );
};

export default LoginPage;