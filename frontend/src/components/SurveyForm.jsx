import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QUESTIONS_PER_PAGE = 3;

const SurveyForm = () => {
    const [answers, setAnswers] = useState({});
    const [questions, setQuestions] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [status, setStatus] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        axios.get('http://127.0.0.1:8000/api/questions/', {
            headers: { Authorization: `Token ${token}` }
        })
            .then(res => setQuestions(res.data))
            .catch(err => console.error(err));
    }, []);

    // Pagination Logic
    const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
    const startIdx = currentPage * QUESTIONS_PER_PAGE;
    const currentQuestions = questions.slice(startIdx, startIdx + QUESTIONS_PER_PAGE);

    const handleDynamicChange = (questionId, value) => {
        setAnswers({
            ...answers,
            [questionId]: value
        });
        // Clear error when user types
        if (errorMsg) setErrorMsg('');
    };

    const validatePage = () => {
        for (let q of currentQuestions) {
            let val = answers[q.text];

            // 1. Required Check
            if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
                setErrorMsg(`Please answer: "${q.text}"`);
                return false;
            }

            // 2. Number Validation
            if (q.field_type === 'number') {
                if (isNaN(val) || val === '') {
                    setErrorMsg(`"${q.text}" must be a number.`);
                    return false;
                }
                if (Number(val) < 0) {
                    setErrorMsg(`"${q.text}" cannot be negative.`);
                    return false;
                }
            }

            // 3. Content-Specific Validation (Heuristics)
            const text = q.text.toLowerCase();

            // Phone/Mobile Number (Assuming 10 digits for India/general)
            if (text.includes('mobile') || text.includes('phone') || text.includes('contact')) {
                const phoneRegex = /^[0-9]{10}$/;
                if (!phoneRegex.test(val)) {
                    setErrorMsg(`Please enter a valid 10-digit number for: "${q.text}"`);
                    return false;
                }
            }

            // Age Validation
            if (text.includes('age')) {
                const age = Number(val);
                if (age < 0 || age > 120) {
                    setErrorMsg(`Please enter a valid age (0-120) for: "${q.text}"`);
                    return false;
                }
            }
        }
        return true;
    };

    const handleNext = () => {
        if (!validatePage()) return;

        window.scrollTo(0, 0);
        setCurrentPage(prev => prev + 1);
    };

    const handlePrev = () => {
        window.scrollTo(0, 0);
        setCurrentPage(prev => prev - 1);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            // 1. Prevent moving if empty
            if (!e.target.value || e.target.value.toString().trim() === '') {
                setErrorMsg('This field cannot be empty.');
                return;
            }

            const form = e.target.form;
            const index = Array.prototype.indexOf.call(form, e.target);
            const nextElement = form.elements[index + 1];

            // If next element is an input/select, focus it
            if (nextElement && (nextElement.tagName === 'INPUT' || nextElement.tagName === 'SELECT')) {
                nextElement.focus();
            } else {
                // If not (e.g. buttons), we are at the end of this page's inputs
                if (currentPage < totalPages - 1) {
                    handleNext();
                } else {
                    handleSubmit(e);
                }
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePage()) return;

        setStatus('submitting');
        setErrorMsg('');

        try {
            const token = localStorage.getItem('authToken');
            await axios.post('http://127.0.0.1:8000/api/submit/', {
                answers: answers
            }, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            setStatus('success');
            setAnswers({});
            setCurrentPage(0);
        } catch (err) {
            setStatus('error');
            setErrorMsg('Submission failed. Please try again.');
            console.error(err);
        }
    };

    if (status === 'success') {
        return (
            <div className="auth-container">
                <div className="card success-message">
                    <div className="success-icon">✓</div>
                    <h2 className="card-title">Submission Successful</h2>
                    <button
                        onClick={() => setStatus('idle')}
                        className="btn-primary"
                        style={{
                            width: 'auto',
                            padding: '0.75rem 2rem',
                            display: 'block',
                            margin: '0 auto'
                        }}
                    >
                        Submit Another Record
                    </button>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return <div className="app-container"><p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading questions...</p></div>;
    }

    return (
        <div className="survey-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="card-title" style={{ margin: 0 }}>Digital Census Form</h2>
                <span style={{ color: '#666', fontWeight: 500 }}>
                    Page {currentPage + 1} of {totalPages}
                </span>
            </div>

            <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '2rem' }}>
                <div style={{
                    width: `${((currentPage + 1) / totalPages) * 100}%`,
                    height: '100%',
                    background: '#2563eb',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                }}></div>
            </div>

            {errorMsg && (
                <div className="error-message">
                    ⚠ {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                <div className="section dynamic-section">
                    {currentQuestions.map((q, index) => (
                        <div key={q.id} className="form-group">
                            <label className="label">
                                <span style={{ color: '#6b7280', marginRight: '0.5rem' }}>
                                    #{startIdx + index + 1}
                                </span>
                                {q.text} <span style={{ color: 'red' }}>*</span>
                            </label>

                            {q.field_type === 'text' && (
                                <input
                                    type="text"
                                    value={answers[q.text] || ''}
                                    onChange={(e) => handleDynamicChange(q.text, e.target.value)}
                                    className="input"
                                    onKeyDown={handleKeyDown}
                                />
                            )}

                            {q.field_type === 'number' && (
                                <input
                                    type="number"
                                    value={answers[q.text] || ''}
                                    onChange={(e) => handleDynamicChange(q.text, e.target.value)}
                                    className="input"
                                    onKeyDown={handleKeyDown}
                                />
                            )}

                            {q.field_type === 'dropdown' && (
                                <select
                                    value={answers[q.text] || ''}
                                    onChange={(e) => handleDynamicChange(q.text, e.target.value)}
                                    className="input"
                                    onKeyDown={handleKeyDown}
                                >
                                    <option value="">Select...</option>
                                    {q.options.split(',').map((opt) => (
                                        <option key={opt} value={opt.trim()}>{opt.trim()}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <button
                        type="button"
                        onClick={handlePrev}
                        disabled={currentPage === 0}
                        className="btn-primary"
                        style={{ width: 'auto', backgroundColor: currentPage === 0 ? '#9ca3af' : '#4b5563' }}
                    >
                        ← Previous
                    </button>

                    {currentPage < totalPages - 1 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="btn-primary"
                            style={{ width: 'auto' }}
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="btn-primary"
                            style={{ width: 'auto', backgroundColor: '#059669' }}
                        >
                            {status === 'submitting' ? 'Submitting...' : 'Submit Declaration'}
                        </button>
                    )}
                </div>

            </form>
        </div>
    );
};

export default SurveyForm;
