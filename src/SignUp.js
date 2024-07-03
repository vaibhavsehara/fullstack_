import React, { useState } from 'react';
import axios from 'axios';
import './signup.css';
import { useNavigate } from 'react-router-dom'

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [Address, setAddress] = useState('');
    const [District, setDistrict] = useState('');
    const [City, setCity] = useState('');
    const [Pincode, setPincode] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/signup', {
                username: username,
                password: password,
                Address: Address,
                District: District,
                City: City,
                Pincode: parseInt(Pincode)
            });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response.data.error);
        }
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            <form className="signup-form" onSubmit={handleSubmit}>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <label htmlFor="Address">Address:</label>
                <input
                    type="text"
                    id="Address"
                    value={Address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                />
                <label htmlFor="District">District:</label>
                <input
                    type="text"
                    id="District"
                    value={District}
                    onChange={(e) => setDistrict(e.target.value)}
                    required
                />
                <label htmlFor="City">City:</label>
                <input
                    type="text"
                    id="City"
                    value={City}
                    onChange={(e) => setCity(e.target.value)}
                    required
                /> 
                <label htmlFor="Pincode">Pincode:</label>        
                <input
                    type="tel"
                    id="Pincode"
                    value={Pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    required
                />                                       
                <button type="submit">Sign Up</button>
                <p>Already have an account?</p>
                <button onClick={() => navigate('/Login')} type="back to login"> Back to Login</button>
            </form>
            {message && <p id="message">{message}</p>}
        </div>
    );
};

export default SignUp;
