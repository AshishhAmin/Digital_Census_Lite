import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    if (!user) return <div className="app-container"><p>Loading...</p></div>;

    return (
        <div className="app-container">
            <div style={{ maxWidth: '800px', margin: '3rem auto', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome, {user.username}!</h1>
                <p style={{ fontSize: '1.2rem', color: '#4b5563', marginBottom: '3rem' }}>
                    Select an action below to proceed.
                </p>

                <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
                    {/* Admin Action */}
                    {user.is_staff && (
                        <div className="card" style={{ flex: '1', minWidth: '350px', maxWidth: '500px', padding: '3rem' }}>
                            <h2 className="card-title">Administration</h2>
                            <p style={{ marginBottom: '2rem', color: '#666', fontSize: '1.1rem' }}>
                                Manage questions, view responses, and export data.
                            </p>
                            <a
                                href="http://127.0.0.1:8000/admin/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary"
                                style={{ display: 'block', textDecoration: 'none' }}
                            >
                                Open Admin Panel
                            </a>
                        </div>
                    )}

                    {/* Surveyor Action */}
                    <div className="card" style={{ flex: '1', minWidth: '350px', maxWidth: '500px', padding: '3rem' }}>
                        <h2 className="card-title">Field Survey</h2>
                        <p style={{ marginBottom: '2rem', color: '#666', fontSize: '1.1rem' }}>
                            Start a new census entry for a household.
                        </p>
                        <Link
                            to="/survey"
                            className="btn-primary"
                            style={{ display: 'block', textDecoration: 'none', backgroundColor: '#059669' }}
                        >
                            Start New Survey
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
