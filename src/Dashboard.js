import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:5000/logout');
            // Redirect to login page after successful logout
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    useEffect(() => {
        // Fetch products from the backend when the component mounts
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleAddToCart = async (productId) => {
        try {
            // Get the username from localStorage
            const username = localStorage.getItem('username');
            if (!username) {
                // Handle the case where the user is not logged in
                console.log('User is not logged in');
                return;
            }

            // Send a request to add the product to the cart
            await axios.post('http://localhost:5000/add-to-cart', {
                productId: productId,
                quantity: 1, // Assuming you're adding one item to the cart
                username: username // Pass the username to the server
            });

            // Optionally, you can display a success message to the user
            console.log('Product added to cart successfully');
        } catch (error) {
            console.error('Error adding product to cart:', error);
        }
    };

    const handleViewCart = () => {
        navigate('/cart'); // Redirect to the cart page
    };

    return (
        <div className="dashboard-container">
            <h2 style={{ color: 'white' }}>Products List</h2>
            <button className='view-cart-btn' onClick={handleLogout}>
                Logout
            </button>
            <button className="view-cart-btn" onClick={handleViewCart}>
                View Cart
            </button>
            <ul className="product-list">
                {products.map((product) => (
                    <li key={product.Product_ID} className="product-item">
                        <div className="product-details">
                            <br />
                            <span className="product-name">{product.Product_Name}</span>
                            <br />
                            <span className="product-quantity">Stock: {product.Stock_Quantity}</span>
                            <br />
                        </div>
                        <button className="add-to-cart-btn" onClick={() => handleAddToCart(product.Product_ID)}>
                            Add to Cart
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;
