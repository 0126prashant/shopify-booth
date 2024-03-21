// ---------------------------------------Running cod ------------------------------>>>>>
require('dotenv').config();
const express = require('express');
const request = require('request');
const fs = require('fs');
const crypto = require('crypto');
const cors = require('cors');
const path = require("path");
const { connection } = require('./db');
const { Product } = require('./models/data.model');
const axios = require('axios');
const app = express();
app.use(cors());
const port = 8080;

// Utility function to generate a random string for state parameter
function nonce(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("/*",(req,res)=>{
  res.sendFile(
      path.join(__dirname,"../frontend/build/index.html"),
      function(err){

          if(err){
              res.status(500).send(err)
          }
      }
  )

})
// Simulated storage for demonstration
const shopAccessTokens = {};

app.get('/', (req, res) => res.send('Hello Shopify-prashant!'));

app.get('/shopify', (req, res) => {

  const shop = req.query.shop;
  if (shop) {

    const state = nonce();
    shopAccessTokens[shop] = { state }; 
    const redirectUri = `${process.env.REDIRECT_URI}`;
    const scopes = process.env.SCOPES;
    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${scopes}&state=${state}&redirect_uri=${redirectUri}`;

    res.redirect(installUrl);
  } else {
    return res.status(400).send('Missing shop parameter. Please add ?shop=your-development-shop.myshopify.com to your request');
  }
});

app.get('/auth/callback', (req, res) => {
  const { shop, hmac, code, state } = req.query; 

  if (shopAccessTokens[shop] && shopAccessTokens[shop].state === state) {
    const accessTokenRequestUrl = `https://${shop}/admin/oauth/access_token`;
    const accessTokenPayload = {
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    };

    request.post({ url: accessTokenRequestUrl, json: accessTokenPayload }, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(error ? 500 : response.statusCode).send(body);
      }

      const accessToken = body.access_token;
      shopAccessTokens[shop].accessToken = accessToken;
      res.redirect('/');
    });
  } else {
    return res.status(403).send('Invalid state parameter');
  }
});

app.get('/fetch-products', async (req, res) => {
  const { shop } = req.query;
  const accessToken = shopAccessTokens[shop] ? shopAccessTokens[shop].accessToken : null;

  if (!accessToken) {
    return res.status(403).send('No access token available. Please authenticate first.');
  }

  const productsRequestUrl = `https://${shop}/admin/api/2021-01/products.json`;
  const productsRequestHeaders = {
    'X-Shopify-Access-Token': accessToken,
  };

  try {
    const response = await axios.get(productsRequestUrl, { headers: productsRequestHeaders });
    const shopifyProducts = response.data.products;

    await Product.insertMany(shopifyProducts);

    fs.appendFile('shopify_products.json', JSON.stringify(shopifyProducts), (err) => {
      if (err) {
        console.error('Error appending product data to file:', err);
        return res.status(500).send('Failed to append product data to file');
      }
      console.log('Products appended to shopify_products.json');
    });

    res.send('Products fetched successfully and saved to the database and JSON file');
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Failed to fetch products');
  }
});

// Fetch products from Shopify and log them to a file
// app.get('/fetch-products', (req, res) => {
//   const { shop } = req.query;
//   const accessToken = shopAccessTokens[shop] ? shopAccessTokens[shop].accessToken : null;

//   if (!accessToken) {
//     return res.status(403).send('No access token available. Please authenticate first.');
//   }

//   const productsRequestUrl = `https://${shop}/admin/api/2021-01/products.json`;
//   const productsRequestHeaders = {
//     'X-Shopify-Access-Token': accessToken,
//   };

//   request.get({ url: productsRequestUrl, headers: productsRequestHeaders }, (error, response, body) => {
//     if (error || response.statusCode !== 200) {
//       return res.status(error ? 500 : response.statusCode).send('Failed to fetch products');
//     }

//     // Log data to console and write to a file

//     fs.writeFile('shopify_products.json', body, (err) => {
//       if (err) {
//         console.error('Error writing product data to file:', err);
//         return res.status(500).send('Failed to write product data to file');
//       }

//       res.send('Products fetched successfully and logged to shopify_products.json');
//     });
//   });
// });

app.listen(port,async()=>{
 
  try {
      await connection;
      console.log(`Server is running at Port ${port} and also connected to DataBase`)
  } catch (error) {
      console.log(error.message)
  }
})