import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Alert } from '@mui/material';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            const response = await fetch('ap/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ username, password }),
            });
            if (response.ok) window.location.href = '/exercises';
            else setError('Credenciais inválidas');
        } catch (err) {
            setError('Erro no servidor');
        }
    };

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
            </form>
        </Container>
    );
};

export default LoginPage;