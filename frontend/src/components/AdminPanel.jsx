import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('responses');
    const [responses, setResponses] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState({ text: '', field_type: 'text', options: '' });
    const [filterSurveyor, setFilterSurveyor] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const token = localStorage.getItem('authToken');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Token ${token}` } };

            if (activeTab === 'responses') {
                const res = await axios.get('http://127.0.0.1:8000/api/responses/', config);
                setResponses(res.data);
            } else if (activeTab === 'analytics') {
                const [resResponses, resQuestions] = await Promise.all([
                    axios.get('http://127.0.0.1:8000/api/responses/', config),
                    axios.get('http://127.0.0.1:8000/api/questions/', config)
                ]);
                setResponses(resResponses.data);
                setQuestions(resQuestions.data);
            } else if (activeTab === 'questions') {
                const res = await axios.get('http://127.0.0.1:8000/api/questions/', config);
                setQuestions(res.data);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch data. Ensure you are an Admin.');
            setLoading(false);
        }
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Token ${token}` } };
            await axios.post('http://127.0.0.1:8000/api/questions/', {
                ...newQuestion,
                is_active: true
            }, config);

            setNewQuestion({ text: '', field_type: 'text', options: '' });
            fetchData(); // Refresh list
        } catch (err) {
            alert('Failed to add question');
        }
    };

    const exportCSV = () => {
        if (!responses.length) return;

        // Flatten data for simple CSV
        const csvRows = [];
        const headers = ['ID', 'Surveyor', 'Date', 'Data'];
        csvRows.push(headers.join(','));

        responses.forEach(r => {
            const row = [
                r.id,
                r.surveyor, // might be ID, ideally backend sends username but ID is fine for MVP
                new Date(r.created_at).toLocaleString(),
                `"${JSON.stringify(r.answers).replace(/"/g, '""')}"` // Escape quotes
            ];
            csvRows.push(row.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'census_responses.csv';
        a.click();
    };

    return (
        <div className="app-container" style={{ padding: '2rem' }}>
            <div className="card" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 className="card-title" style={{ margin: 0, textAlign: 'left' }}>Admin Panel</h1>
                    <button onClick={() => navigate('/')} className="logout-btn">Back to Dashboard</button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e5e7eb', marginBottom: '2rem' }}>
                    <button
                        onClick={() => setActiveTab('responses')}
                        style={{
                            padding: '1rem',
                            borderBottom: activeTab === 'responses' ? '3px solid var(--primary-color)' : '3px solid transparent',
                            background: 'none',
                            border: 'none',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            color: activeTab === 'responses' ? 'var(--primary-color)' : 'var(--text-muted)',
                            cursor: 'pointer'
                        }}
                    >
                        Responses
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        style={{
                            padding: '1rem',
                            borderBottom: activeTab === 'analytics' ? '3px solid var(--primary-color)' : '3px solid transparent',
                            background: 'none',
                            border: 'none',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            color: activeTab === 'analytics' ? 'var(--primary-color)' : 'var(--text-muted)',
                            cursor: 'pointer'
                        }}
                    >
                        Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('questions')}
                        style={{
                            padding: '1rem',
                            borderBottom: activeTab === 'questions' ? '3px solid var(--primary-color)' : 'none',
                            border: 'none',
                            background: 'none',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            color: activeTab === 'questions' ? 'var(--primary-color)' : 'var(--text-muted)',
                            cursor: 'pointer'
                        }}
                    >
                        Manage Questions
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                {loading ? <p>Loading...</p> : (
                    <>
                        {activeTab === 'responses' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Filter by Surveyor ID..."
                                        className="input"
                                        style={{ maxWidth: '300px', padding: '0.75rem' }}
                                        value={filterSurveyor}
                                        onChange={(e) => setFilterSurveyor(e.target.value)}
                                    />
                                    <button onClick={exportCSV} className="btn-primary" style={{ width: 'auto' }}>
                                        Download CSV
                                    </button>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--bg-color)', textAlign: 'left' }}>
                                                <th style={{ padding: '1rem' }}>Response ID</th>
                                                <th style={{ padding: '1rem' }}>Date</th>
                                                <th style={{ padding: '1rem' }}>Surveyor ID</th>
                                                <th style={{ padding: '1rem' }}>Data Snippet</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {responses
                                                .filter(r => r.surveyor.toString().includes(filterSurveyor))
                                                .map(r => (
                                                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                        <td style={{ padding: '1rem' }}>{r.id}</td>
                                                        <td style={{ padding: '1rem' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                                                        <td style={{ padding: '1rem' }}>{r.surveyor}</td>
                                                        <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                                            {JSON.stringify(r.answers).slice(0, 50)}...
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="analytics-dashboard">
                                {/* Summary Metrics */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                    <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: 'linear-gradient(135deg, #4f46e5, #818cf8)', color: 'white' }}>
                                        <h3 style={{ fontSize: '1rem', opacity: 0.9 }}>Total Surveys</h3>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{responses.length}</div>
                                    </div>
                                    <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: 'white' }}>
                                        <h3 style={{ fontSize: '1rem', color: '#6b7280' }}>Active Surveyors</h3>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                                            {new Set(responses.map(r => r.surveyor)).size}
                                        </div>
                                    </div>
                                    <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: 'white' }}>
                                        <h3 style={{ fontSize: '1rem', color: '#6b7280' }}>Questions Tracked</h3>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                                            {questions.length}
                                        </div>
                                    </div>
                                </div>

                                {/* Operational Charts */}
                                <div className="grid-2" style={{ marginBottom: '2rem' }}>
                                    <div className="card">
                                        <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Responses by Surveyor</h3>
                                        <div style={{ width: '100%', height: 300 }}>
                                            <ResponsiveContainer>
                                                <BarChart data={Object.entries(responses.reduce((acc, curr) => {
                                                    acc[curr.surveyor] = (acc[curr.surveyor] || 0) + 1;
                                                    return acc;
                                                }, {})).map(([surveyor, count]) => ({ surveyor: `Surveyor ${surveyor}`, count }))}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="surveyor" />
                                                    <YAxis allowDecimals={false} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="count" fill="#4f46e5" name="Total Responses" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="card">
                                        <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Submission Timeline</h3>
                                        <div style={{ width: '100%', height: 300 }}>
                                            <ResponsiveContainer>
                                                <AreaChart data={Object.entries(responses.reduce((acc, curr) => {
                                                    const date = new Date(curr.created_at).toLocaleDateString();
                                                    acc[date] = (acc[date] || 0) + 1;
                                                    return acc;
                                                }, {})).sort((a, b) => new Date(a[0]) - new Date(b[0])).map(([date, count]) => ({ date, count }))}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" />
                                                    <YAxis allowDecimals={false} />
                                                    <Tooltip />
                                                    <Area type="monotone" dataKey="count" stroke="#db2777" fill="#fce7f3" name="Daily Submissions" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* Demographic / Question Analysis */}
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--primary-color)', paddingLeft: '1rem' }}>Demographic Insights</h2>
                                <div className="grid-2">
                                    {questions
                                        .filter(q => ['religion', 'category', 'income'].some(keyword => q.text.toLowerCase().includes(keyword)))
                                        .map(q => {
                                            // Aggregate data for this question
                                            const counts = responses.reduce((acc, r) => {
                                                const val = r.answers[q.text];
                                                if (val) {
                                                    // For numbers, maybe bucket? For now, just raw values if low cardinality, else bucket.
                                                    // Simple grouping for MVP
                                                    acc[val] = (acc[val] || 0) + 1;
                                                }
                                                return acc;
                                            }, {});

                                            const chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));

                                            if (chartData.length === 0) return null;

                                            return (
                                                <div key={q.id} className="card">
                                                    <h3 style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1.1rem' }}>{q.text}</h3>
                                                    <div style={{ width: '100%', height: 300 }}>
                                                        <ResponsiveContainer>
                                                            {q.field_type === 'dropdown' || chartData.length < 5 ? (
                                                                <PieChart>
                                                                    <Pie
                                                                        data={chartData}
                                                                        dataKey="value"
                                                                        nameKey="name"
                                                                        cx="50%"
                                                                        cy="50%"
                                                                        outerRadius={80}
                                                                        fill="#8884d8"
                                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                                    >
                                                                        {chartData.map((entry, index) => (
                                                                            <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                                                                        ))}
                                                                    </Pie>
                                                                    <Tooltip />
                                                                    <Legend />
                                                                </PieChart>
                                                            ) : (
                                                                <BarChart data={chartData.slice(0, 10)}> {/* Limit to top 10 unique values */}
                                                                    <CartesianGrid strokeDasharray="3 3" />
                                                                    <XAxis dataKey="name" />
                                                                    <YAxis allowDecimals={false} />
                                                                    <Tooltip />
                                                                    <Bar dataKey="value" fill="#82ca9d" name="Count" radius={[4, 4, 0, 0]} />
                                                                </BarChart>
                                                            )}
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        )}

                        {activeTab === 'questions' && (
                            <div className="grid-2">
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Existing Questions</h3>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {questions.map(q => (
                                            <li key={q.id} className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                                                <div style={{ fontWeight: 'bold' }}>{q.text}</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Type: {q.field_type}</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div style={{ background: 'var(--bg-color)', padding: '2rem', borderRadius: 'var(--radius)' }}>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Add New Question</h3>
                                    <form onSubmit={handleAddQuestion}>
                                        <div className="form-group">
                                            <label className="label">Question Text</label>
                                            <input
                                                className="input"
                                                value={newQuestion.text}
                                                onChange={e => setNewQuestion({ ...newQuestion, text: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Type</label>
                                            <select
                                                className="input"
                                                value={newQuestion.field_type}
                                                onChange={e => setNewQuestion({ ...newQuestion, field_type: e.target.value })}
                                            >
                                                <option value="text">Text Identity</option>
                                                <option value="number">Number</option>
                                                <option value="dropdown">Dropdown</option>
                                            </select>
                                        </div>
                                        {newQuestion.field_type === 'dropdown' && (
                                            <div className="form-group">
                                                <label className="label">Options (comma separated)</label>
                                                <input
                                                    className="input"
                                                    value={newQuestion.options}
                                                    onChange={e => setNewQuestion({ ...newQuestion, options: e.target.value })}
                                                    placeholder="e.g. Yes, No, Maybe"
                                                />
                                            </div>
                                        )}
                                        <button type="submit" className="btn-primary">Add Question</button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
