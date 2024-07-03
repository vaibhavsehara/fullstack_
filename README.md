# User Interface for Shopping

This project is a full-stack web application that helps users buy and order items from a store. It includes a frontend built with React, and a backend built with Node.js. The application is linked to a database that stores the store's inventory and user information.

## Features
- User Authentication (Login, Logout, Signup)
- View Products
- Add Products to Cart
- View Cart
- Remove Products from Cart

## Technologies Used
- React
- Node.js
- Express.js
- Axios
- CSS
- MySQL (Database)

## Getting Started

### Prerequisites
- Node.js installed
- MySQL installed
- Yarn (optional, you can use npm)

### Setting Up the Project Locally

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```
2. **Navigate to the project directory:**
   ```bash
   cd user-interface-for-shopping
   ```
3. **Set up the database:**
   - Create a MySQL database.
   - Import the database schema provided in the db.js file to set up the tables.
   - Update the database connection details in the db.js file.

4. **Install dependencies for the server:**
     ```bash
      cd server
      npm install
     ```
5. **Start the server:**
   ```bash
   npm run dev
   ```
6. **Install dependencies for the client:**
   ```bash
   cd ../client
   yarn install
    ```
7. **Start the client:**
     ```bash
     yarn start
      ```

8. **Access the application:**
      -Open your web browser and navigate to http://localhost:3000.

### Project Structure

- **Client**: Contains the React frontend
  - `src`: Source files for the React application
    - `components`: React components (e.g., `Dashboard.js`, `Login.js`)
    - `App.js`: Main application component
    - `index.js`: Entry point of the React application
    - `styles`: CSS files

- **Server**: Contains the Node.js backend
  - `server.js`: Main server file
  - `db.js`: Database connection file
  - `routes`: Contains the route handlers for the server

### Database Configuration

Update the `db.js` file with your database credentials:

```javascript
const pool = mysql.createPool({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database_name'
});
```


### API Endpoints

- **User Authentication**
  - `POST /signup`: Signup a new user
  - `POST /login`: Login a user
  - `POST /logout`: Logout a user

- **Products**
  - `GET /products`: Fetch all products

- **Cart**
  - `POST /add-to-cart`: Add a product to the cart
  - `POST /remove-from-cart`: Remove a product from the cart
  - `GET /cart`: Get all cart items for a user

### Contributing
Feel free to contribute to this project by opening a pull request. Please ensure your code follows the project's coding standards and include relevant tests.
