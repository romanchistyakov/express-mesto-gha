const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');

const users = require('./routes/users');
const cards = require('./routes/cards');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');

const { PORT = 3000 } = process.env;

const ERR_404 = 404;

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(bodyParser.json());

app.use('/users', auth, users);
app.use('/cards', auth, cards);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(/https?:\/\/w?w?w?\.?[a-z0-9-]+\.[a-z]+[a-z0-9\-._~:/?#[\]@!$&'()*+,;=]+/gm),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({ message: statusCode === 500 ? 'Ошибка на сервере' : message });

  next();
});

app.use('/', (req, res) => res.status(ERR_404).send({ message: 'Страница не найдена' }));

app.listen(PORT);
