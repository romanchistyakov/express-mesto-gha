const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const WrongDataError = require('../errors/WrongDataError');
const NotAuthorizedError = require('../errors/NotAuthorizedError');
const NotFoundError = require('../errors/NotFoundError');
const EmailError = require('../errors/EmailError');

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      })
        .then((user) => res.send({ data: user }))
        .catch((error) => {
          if (error.name === 'ValidationError') {
            next(new WrongDataError('Переданы некорректные данные при создании пользователя.'));
          }
          if (error.code === 11000) {
            next(new EmailError('Пользователь с данным email уже существует.'));
          }
          next();
        });
    });
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next());
};

module.exports.getUserById = (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail(new Error('NotFound'))
    .then((user) => res.send({ data: user }))
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new WrongDataError('Передан некорректный _id пользователя'));
      }
      if (error.message === 'NotFound') {
        next(new NotFoundError('Пользователь по указанному _id не найден.'));
      }
      next();
    });
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { runValidators: true, new: true })
    .orFail(new Error('NotFound'))
    .then((user) => res.send({ data: user }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new WrongDataError('Переданы некорректные данные при обновлении данных пользователя.'));
      }
      if (error.message === 'NotFound') {
        next(new NotFoundError('Пользователь по указанному _id не найден.'));
      }
      next();
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { runValidators: true, new: true })
    .orFail(new Error('NotFound'))
    .then((user) => res.send({ data: user }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new WrongDataError('Переданы некорректные данные при обновлении аватара.'));
      }
      if (error.message === 'NotFound') {
        next(new NotFoundError('Пользователь по указанному _id не найден.'));
      }
      next();
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  const { NODE_ENV, JWT_SECRET } = process.env;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'secret-key', { expiresIn: '7d' });

      res.send({ token });
    })
    .catch(() => {
      next(new NotAuthorizedError('Неверные email или пароль'));
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.send({ data: user }))
    .catch(next());
};
