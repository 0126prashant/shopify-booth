import React, { useState } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [shopUrl, setShopUrl] = useState('');

  const fetchProducts = () => {
    // Make sure to encode the shop URL
    const encodedShopUrl = encodeURIComponent(shopUrl);
    fetch(`http://localhost:8080/api/products?shopUrl=${encodedShopUrl}`)
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error("There was an error fetching the products:", error));
  };

  return (
    <div className="App">
      <h1>WooCommerce Products</h1>
      <input
        type="text"
        placeholder="Enter shop URL"
        value={shopUrl}
        onChange={(e) => setShopUrl(e.target.value)}
      />
      <button onClick={fetchProducts}>Fetch Products</button>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            {product.name} - ${product.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
