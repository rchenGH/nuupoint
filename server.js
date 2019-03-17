const express = require('express');
const mongoose = require('mongoose');
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

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`))

