import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Alert } from '@mui/material';
import { saveContainerManagerPorts, deleteContainerManagerPorts } from  '../helpers/storeManager'
import Loading from './message_system/Loading';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT;
    const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            //Use component ./message_system/Loading.js
            window.RoboticsReactComponents.MessageSystem.Loading.showLoading(
                "Login user..."
            );
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
            console.log("ERROR: "+err)
            setError('Erro local');
        }finally{
            window.RoboticsReactComponents.MessageSystem.Loading.hideLoading();
        }
    };

    return (
        
        <Container maxWidth="sm">
            <Loading/>
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
            </form>
        </Container>
    );
};

export default LoginPage;