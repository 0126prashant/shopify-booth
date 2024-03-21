import React, { useState } from 'react';
import axios from 'axios';

export const Shopify = () => {
  const [products, setProducts] = useState([]);

  const handleAuth = () => {
    const shopUrl = prompt("Please enter your shop URL (e.g., your-shop-name.myshopify.com)", "");
    if (shopUrl) {
      window.location.href = `http://localhost:8080/shopify?shop=${shopUrl}`;
    }
  };

  const fetchProducts = () => {
    const shop = prompt("Enter your shop name to fetch products (e.g., your-shop-name.myshopify.com)", "");
    if (shop) {
      axios.get(`http://localhost:8080/fetch-products?shop=${shop}`)
        .then(response => {
          console.log(response.data);
          setProducts(response.data)
          alert('Products fetched successfully. Check the server console or shopify_products.json file.');
        })
        .catch(error => {
          console.error('Error fetching products:', error);
          alert('Failed to fetch products. Make sure you are authenticated and entered the correct shop name.');
        });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Shopify App Integration</h1>
        <button onClick={handleAuth}>
          Authorize Shopify Store
        </button>
        <button onClick={fetchProducts}>
          Fetch Products
        </button>
        {products && (
          <div>
            <h2>Products:</h2>
            <pre>{JSON.stringify(products, null, 2)}</pre>
          </div>
        )}
      </header>
    </div>
  );
};