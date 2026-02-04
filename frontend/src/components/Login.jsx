import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setAuthToken }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login/', {
                username,
                password
            });
            const token = response.data.token;
            setAuthToken(token);
            localStorage.setItem('authToken', token);

            // Save User Data
            localStorage.setItem('user', JSON.stringify({
                username: response.data.username,
                is_staff: response.data.is_staff
            }));

            navigate('/');
        } catch (err) {
            setError('Invalid username or password.');
            console.error(err);
        }
    };

    return (
        <div className="auth-container">
            <div className="card">
                <h1 className="card-title">Digital Census Login</h1>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="label">Username</label>
                        <input
                            type="text"
                            required
                            className="input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Password</label>
                        <input
                            type="password"
                            required
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn-primary">
                        Login
                    </button>
                </form>
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <span style={{ color: '#666' }}>Access Needs? </span>
                    <a href="/register" style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}>Register as Surveyor</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
