    // Login.js

    import React, { useState } from 'react';
    import axios from 'axios';
    import './login.css';
    import { useNavigate } from 'react-router-dom'

    const Login = ({}) => {
        
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [message, setMessage] = useState('');
        const navigate = useNavigate();
        
        const handleLogin = async (username, password) => {
            try {console.log('Logging in with username:', username, 'and password:', password);
            const response = await axios.post('http://localhost:5000/login', { username, password });
                if (response.data.success) {
                    // Store username in local storage or cookie
                    localStorage.setItem('username', username);
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Error logging in:', error);
            }
        };
        
        
        return (
            <div className="container">
                <h2>Login</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(username, password); }}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <button type="submit">Login</button>
                        <p style={{ color: 'grey' }}>New User ?</p>
                        <button onClick={() => navigate('/signup')} type="button">Sign Up</button>
                    </div>
                </form>
                {message && <p id="message">{message}</p>}
            </div>
        );
    };

    export default Login;
