require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

// Normally we would store data in database
const posts = [
    {
        username: 'David',
        title: 'Post 1'
    },
    {
        username: 'Tim',
        title: 'Post 2'
    }
]

// JWT used to permit only specific people to access these posts

// Allow only user with correct access token to access their posts
app.get('/posts', authenticateToken, (req, res) => {
    console.log(req.user); //got the req.user from authenticateToken function
    res.json(posts.filter(post => post.username == req.user.name));
});

// Create a middleware to authenticate user
function authenticateToken(req, res, next) {
    // Use Authentication Bearer to send JWT

    // Work with Bearer Token
    console.log('Authenticating token...');
    const authHeader = req.headers['authorization'];
    console.log('Auth header:', authHeader);

    const token = authHeader && authHeader.split(' ')[1]; // Token section or underfined
    if(token == null) return res.sendStatus(401); // No token, end with 401

    // If have token, verify it
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token
        req.user = user; // If valid token, set user to req.user on request
        next(); // move on from middleware
    })

    // Bearer TOKEN
}

// For debugging to see what the app is being cllaed for
app.use((req, res, next) => {
    console.log(`Received ${req.method} request on ${req.url}`);
    next();
});


app.listen(4057, () => console.log('Listening on port 4057...'));