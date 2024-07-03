import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Cart.css'; // Import the Cart.css file from
const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch cart items when the component mounts
        const fetchCartItems = async () => {
            try {
                const username = localStorage.getItem('username');
                const response = await axios.get(`http://localhost:5000/cart-items?username=${username}`);
                setCartItems(response.data);
            } catch (error) {
                console.error('Error fetching cart items:', error);
                setError('Error fetching cart items');
            }
        };
        

        fetchCartItems(); // Call fetchCartItems function
    }, []); // Empty dependency array ensures the effect runs only once

    const handleRemoveFromCart = async (item) => {
        try {
            const username = localStorage.getItem('username');
            // Make POST request to remove one piece of the item from cart
            await axios.post('http://localhost:5000/remove-from-cart', {
                productId: item.Product_ID,
                username,
                quantity: 1 // Remove only one piece of the product
            });
            // Refresh cart items after removing item
            // In handleRemoveFromCart
            const response = await axios.get(`http://localhost:5000/cart-items?username=${username}`);
            setCartItems(response.data);
        } catch (error) {
            console.error('Error removing item from cart:', error);
            setError('Error removing item from cart');
        }
    };
    const handleCheckout = async () => {
        try {
            const username = localStorage.getItem('username');
            // Make POST request to checkout
            await axios.post('http://localhost:5000/checkout', {
                username,
                cartItems: cartItems
            });
            // Refresh cart items after checkout
            const response = await axios.get(`http://localhost:5000/cart-items?username=${username}`);
            setCartItems(response.data);
        } catch (error) {
            console.error('Error during checkout:', error);
            setError('Error during checkout');
        }
    };
    
    return (
        <div>
            <h2 style={{ color: 'white' }}>Cart</h2>
            <button className='dashboard-button' onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            {error && <p>{error}</p>}
            <ul>
                {cartItems.map((item, index) => (
                    <div className="cart-item" key={index}>
                        <div className="product-info">
                            <p style={{ color: 'white' }} className="product-name">Product Name: {item.Product_Name}</p>
                            <p style={{ color: 'white' }}>Quantity: {item.Quantity}</p>
                            <p style={{ color: 'white' }}>Total Price: {item.Total_Price}</p>
                            <p style={{ color: 'white' }}> product_id: {item.Product_ID} </p>
                        </div>
                        <button className="remove-button" onClick={() => handleRemoveFromCart(item)}>Remove from Cart</button>
                    </div>
                ))}
            </ul>
            <button className='dashboard-button' onClick={handleCheckout}>CheckOut</button>

        </div>
    );
};

export default Cart;
