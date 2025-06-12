require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

let refreshTokens = []; // Normally we would have a database of refreshToken, but for simplicity

// JWT used to permit only specific people to access these posts

// Delete refresh token to prevent someone stealing to get access
app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    res.sendStatus(204); // Successfully delete refresh token
});

// Generate a new accessToken when the old one is expired using refresh token
app.post('/token', (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) return res.status(403).send('refreshToken is not in the list'); // See if there is already the refreshToken or not
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err,user) => {
        if (err) return res.status(403).send('Something went wrong');
        const accessToken = generateAccessToken({ name: user.name });
        res.json({ accessToken: accessToken});
    })
});

app.post('/login', (req, res) => {
    // Authenticate User (Assume user is already authenticated)
    // try and catch for detecting error
    try {
        console.log("Request Body:", req.body);
        const username = req.body.username;
        const user = { name: username };

        const accessToken = generateAccessToken(user);
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
        refreshTokens.push(refreshToken); // Add a new refreshToken
        console.log('refreshTokens is ', refreshTokens);
        res.json({ accessToken, refreshToken });
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(403).send("Forbidden");
    }
})

// Generate Access Token that will expire quickly
function generateAccessToken(user) {
   return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '60s'});
}

app.use((req, res, next) => {
    console.log(`Received ${req.method} request on ${req.url}`);
    next();
});

app.listen(4058, () => console.log('Listening on port 4058...'));