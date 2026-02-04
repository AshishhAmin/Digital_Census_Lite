import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        confirm_password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match.');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        try {
            // Remove confirm_password before sending to API
            const { confirm_password, ...submitData } = formData;
            await axios.post('http://127.0.0.1:8000/api/register/', submitData);
            navigate('/login');
        } catch (err) {
            setError('Registration failed. Try a different username.');
            console.error(err);
        }
    };

    return (
        <div className="auth-container">
            <div className="card">
                <h1 className="card-title">Surveyor Registration</h1>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleRegister}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="label">First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                required
                                className="input"
                                value={formData.first_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                required
                                className="input"
                                value={formData.last_name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Username</label>
                        <input
                            type="text"
                            name="username"
                            required
                            className="input"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="input"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            minLength="6"
                            className="input"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Confirm Password</label>
                        <input
                            type="password"
                            name="confirm_password"
                            required
                            className="input"
                            value={formData.confirm_password}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{
                            display: 'block',
                            width: 'fit-content',
                            margin: '0 auto',
                            paddingLeft: '2rem',
                            paddingRight: '2rem'
                        }}
                    >
                        Register
                    </button>
                </form>
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <span className="text-gray-600">Already have an account? </span>
                    <Link to="/login" style={{ color: '#2563eb', fontWeight: 'bold' }}>Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
