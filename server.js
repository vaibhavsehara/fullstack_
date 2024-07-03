const express = require('express');
const session = require('express-session');
const pool = require('./db');
const poolPromise = require('./db');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();

app.use(session({
    secret: 'SECRET_KEY',
    resave: false,
    saveUninitialized: true
}));

app.use(cors());
app.use(express.json());


app.get('/users', (req, res) => {
    pool.query('SELECT * FROM Users', (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(results);
    });
});






app.post('/add-to-cart', (req, res) => {
    const { productId, quantity, username } = req.body;
    if (!username) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch product details to get the price and Stock_Quantity
    pool.query('SELECT Price, Stock_Quantity FROM Products WHERE Product_ID = ?', [productId], (err, results) => {
        if (err) {
            console.error('Error fetching product details:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const productPrice = parseInt(results[0].Price);
        const productStockQuantity = parseInt(results[0].Stock_Quantity);

        if (productStockQuantity < quantity) {
            return res.status(400).json({ error: 'Not enough product in stock' });
        }

        // Check if the product is already in the user's cart
        pool.query('SELECT * FROM Cart WHERE Username = ? AND Product_ID = ?', [username, productId], (err, results) => {
            if (err) {
                console.error('Error checking cart:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (results.length === 0) {
                // If the product is not in the cart, insert a new row
                pool.query('INSERT INTO Cart (Username, Product_ID, QUANTITY, Price, Total_Price) VALUES (?, ?, ?, ?, ?)', [username, productId, quantity, productPrice, productPrice * quantity], (err, result) => {
                    if (err) {
                        console.error('Error adding item to cart:', err);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }

                    // Update the Stock_Quantity in the Products table
                    pool.query('UPDATE Products SET Stock_Quantity = Stock_Quantity - ? WHERE Product_ID = ?', [quantity, productId], (err, result) => {
                        if (err) {
                            console.error('Error updating product Stock_Quantity:', err);
                            return res.status(500).json({ error: 'Internal Server Error' });
                        }

                        res.json({ message: 'Item added to cart successfully' });
                    });
                });
            } else {                // If the product is already in the cart, update the QUANTITY
                const newQuantity = results[0].Quantity + quantity;
                const newTotalPrice = productPrice * newQuantity;
                pool.query('UPDATE Cart SET QUANTITY = ?, Total_Price = ? WHERE Username = ? AND Product_ID = ?', [newQuantity, newTotalPrice, username, productId], (err, result) => {
                    if (err) {
                        console.error('Error updating item in cart:', err);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }

                    // Update the Stock_Quantity in the Products table
                    pool.query('UPDATE Products SET Stock_Quantity = Stock_Quantity - ? WHERE Product_ID = ?', [quantity, productId], (err, result) => {
                        if (err) {
                            console.error('Error updating product Stock_Quantity:', err);
                            return res.status(500).json({ error: 'Internal Server Error' });
                        }

                        res.json({ message: 'Item quantity updated in cart successfully' });
                    });
                });
            }
        });
    });
});

app.post('/remove-from-cart', (req, res) => {
    const { productId, username } = req.body;

    // Validate input
    if (!productId || !username) {
        return res.status(400).json({ error: 'Missing productId or username in request body' });
    }

    // Check if the product is in the user's cart
    pool.query('SELECT * FROM Cart WHERE Username = ? AND Product_ID = ?', [username, productId], (err, results) => {
        if (err) {
            console.error('Error checking cart:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found in cart' });
        }

        const cartItem = results[0];

        // Remove the item from the cart
        pool.query('DELETE FROM Cart WHERE Username = ? AND Product_ID = ?', [username, productId], (err, result) => {
            if (err) {
                console.error('Error removing item from cart:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Add the quantity back to the product inventory
            pool.query('UPDATE Products SET Stock_Quantity = Stock_Quantity + ? WHERE Product_ID = ?', [cartItem.Quantity, productId], (err, result) => {
                if (err) {
                    console.error('Error updating product Stock_Quantity:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                res.json({ message: 'Item removed from cart successfully' });
            });
        });
    });
});


pool.query(`CREATE TRIGGER check_cart_quantity_trigger
           BEFORE INSERT ON Cart
           FOR EACH ROW
           BEGIN
               DECLARE product_stock INT;
               SELECT Stock_Quantity INTO product_stock FROM Products WHERE Product_ID = NEW.Product_ID;
               IF product_stock < NEW.Quantity THEN
                   SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Quantity exceeds available stock';
               END IF;
           END`);

// 2. Log Order Changes Trigger
// AFTER INSERT, UPDATE, DELETE ON Orders
// This trigger logs any changes made to the orders table, including insertions, updates, and deletions.
pool.query(`CREATE TRIGGER log_order_changes_trigger
           AFTER INSERT OR UPDATE OR DELETE ON Orders
           FOR EACH ROW
           BEGIN
               IF INSERTING THEN
                   INSERT INTO Order_Log (Order_ID, Action, Timestamp) VALUES (NEW.Order_ID, 'Insert', NOW());
               ELSIF UPDATING THEN
                   INSERT INTO Order_Log (Order_ID, Action, Timestamp) VALUES (NEW.Order_ID, 'Update', NOW());
               ELSE
                   INSERT INTO Order_Log (Order_ID, Action, Timestamp) VALUES (OLD.Order_ID, 'Delete', NOW());
               END IF;
           END`);

// 3. Update Cart Trigger
// AFTER INSERT ON Order_Item
// This trigger updates the cart when a new item is added to the orders table.
// It either inserts a new row into the cart or updates the quantity of an existing item.
pool.query(`CREATE TRIGGER update_cart_trigger
           AFTER INSERT ON Order_Item
           FOR EACH ROW
           BEGIN
               DECLARE product_quantity INT;
               SELECT Quantity INTO product_quantity FROM Cart WHERE Username = NEW.Username AND Product_ID = NEW.Product_ID;
               IF product_quantity IS NULL THEN
                   INSERT INTO Cart (Username, Product_ID, Quantity) VALUES (NEW.Username, NEW.Product_ID, NEW.Quantity);
               ELSE
                   UPDATE Cart SET Quantity = product_quantity + NEW.Quantity WHERE Username = NEW.Username AND Product_ID = NEW.Product_ID;
               END IF;
           END`);


// Fetch cart items for the logged-in user

app.get('/cart-items', (req, res) => {
    const { username } = req.query; // Get username from query parameter

    if (!username) {
        // If the username is not provided, return an error
        return res.status(400).json({ error: 'Username is required' });
    }

    // Fetch cart items for the provided username from the database
    pool.query('SELECT * FROM Cart WHERE Username = ?', [username], (err, results) => {
        if (err) {
            console.error('Error fetching cart items:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        
        // Return the cart items as JSON response
        res.json(results);
    });
});


app.post('/cart', (req, res) => {
    // Check credentials and authenticate user...
    const { username } = req.body;
    // TODO: Add code here to validate the username
    req.session.username = username; // Store username in the session
    res.send('Login successful');
});

// Fetch cart items for the logged-in user
app.get('/cart', (req, res) => {
    const { username } = req.query; // Get username from query parameter
    if (!username) {
        // If the username is not provided, return an error
        return res.status(400).json({ error: 'Username is required' });
    }

    // Fetch cart items for the provided username, including the product name
    pool.query('SELECT p.Product_Name, c.Quantity, c.Total_Price FROM Cart c INNER JOIN Products p ON c.Product_ID = p.Product_ID WHERE c.Username = ?', [username], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        // Send the cart items as JSON response
        res.json(results);
    });
});



app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.send('Logout successful');
        }
    });
});



app.get('/login', (req, res) => {
   // Example query
   pool.query('SELECT * FROM users', (err, results, fields) => {
       if (err) {
           console.error('Error executing query:', err);
           res.status(500).send('Internal Server Error');
           return;
       }
       // Send the query results as JSON to the client
       res.json(results);
   });
 });

 app.get('/products', (req, res) => {
   // Query the database to retrieve the list of products
   pool.query('SELECT Product_Name, Stock_Quantity, Product_ID  FROM Products', (err, results) => {
       if (err) {
           console.error('Error executing query:', err);
           res.status(500).json({ error: 'Internal Server Error' });
           return;
       }
       // Send the list of products as JSON response
       res.json(results);
   });
});

app.post('/products', (req, res) => {
   // Query the database to retrieve the list of products
   pool.query('SELECT Product_Name, Stock_Quantity, Product_ID FROM Products', (err, results) => {
       if (err) {
           console.error('Error executing query:', err);
           res.status(500).json({ error: 'Internal Server Error' });
           return;
       }
       // Send the list of products as JSON response
       res.json(results);
   });
});

app.get('/protected', (req, res) => {
    const { username } = req.session;
    if (username) {
        res.send(`Welcome, ${username}`);
    } else {
        res.status(401).send('Unauthorized');
    }
});



app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Query the database to check if the username and password match
    pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results, fields) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Check if any rows were returned from the query
        if (results.length > 0) {
            // Username and password match, store username in the session
            req.session.username = username;
            console.log('Username stored in session:', req.session.username); // Debug statement
            res.json({ success: true });
        } else {
            // Username and password do not match, send an error response
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    });
});



app.post('/signup', (req, res) => {
    const { username, password, Address, District, City, Pincode } = req.body;

    // Check if the username already exists in the database
    pool.query('SELECT * FROM Users WHERE Username = ?', [username], (error, existingUser) => {
        if (error) {
            console.error('Error signing up:', error);
            return res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash the password before storing it in the database
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                console.error('Error signing up:', err);
                return res.status(500).json({ error: 'Internal Server Error', details: err.message });
            }

            bcrypt.hash(password, salt, (err, hashedPassword) => {
                if (err) {
                    console.error('Error signing up:', err);
                    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
                }

                const PincodeNumber = Number(Pincode);

                // Insert the new user into the database
                pool.query('INSERT INTO Users (Username, Password, Address, District, City, Pincode) VALUES (?, ?, ?, ?, ?, ?)', 
                [username, password, Address, District, City, PincodeNumber], (error, results) => {
                    if (error) {
                        console.error('Error signing up:', error);
                        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
                    }

                    res.status(201).json({ message: 'User registered successfully' });
                });
            });
        });
    });
});

app.post('/checkout', (req, res) => {
    const { username, cartItems } = req.body;

    // Update order history
    cartItems.forEach((item, index) => {
        const query = 'INSERT INTO OrderHistory (Username, Product_ID, Quantity, Total_Price) VALUES (?, ?, ?, ?)';
        const params = [username, item.Product_ID, item.Quantity, item.Total_Price];

        pool.query(query, params, (err, results) => {
            if (err) {
                console.error('Error updating order history:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Check if this is the last item in the cartItems array
            if (index === cartItems.length - 1) {
                // If it's the last item, proceed to update product quantities and clear cart
                updateProductQuantitiesAndClearCart(username, cartItems, res);
            }
        });
    });
});

function updateProductQuantitiesAndClearCart(username, cartItems, res) {
    // Update product quantities
    cartItems.forEach((item, index) => {
        const query = 'UPDATE Products SET Stock_Quantity = Stock_Quantity - ? WHERE Product_ID = ?';
        const params = [item.Quantity, item.Product_ID];

        pool.query(query, params, (err, results) => {
            if (err) {
                console.error('Error updating product quantities:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Check if this is the last item in the cartItems array
            if (index === cartItems.length - 1) {
                // If it's the last item, proceed to clear cart
                clearCart(username, res);
            }
        });
    });
}

function clearCart(username, res) {
    // Clear cart
    const query = 'DELETE FROM Cart WHERE Username = ?';
    const params = [username];

    pool.query(query, params, (err, results) => {
        if (err) {
            console.error('Error clearing cart:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Send response after all operations are completed
        res.send('Checkout successful');
    });
}



// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
