const express = require('express');

const mongoose = require('mongoose');

const bodyParser = require('body-parser');

const users = require('./routes/users');
const cards = require('./routes/cards');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(bodyParser.json());

app.use('/users', users);

app.use('/cards', cards);

app.use((req, res, next) => {
  req.user = {
    _id: '632f5f1c2bf40a5b6c8ffd48',
  };

  next();
});

app.listen(PORT);
