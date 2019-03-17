const express = require('express');
const mongoose = require('mongoose');

// routes
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();

// DB Config
const db = require('./config/keys').mongoURI;

// connect to mongoDB through mongoose
mongoose
    .connect(db)
    .then(() => 
        console.log('mongoDB connected')
    )
    .catch(err => console.log(err))

app.get('/', (req, res) => 
    res.send('hello world')
);

// use routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.PORT || 5000;

// listen on port 5000 for connections
app.listen(port, () => console.log(`Server running on port ${port}`))

