const User = require('../models/users');

const ERR_400 = 400;
const ERR_404 = 404;
const ERR_500 = 500;

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res.status(ERR_400).send({ message: 'Переданы некорректные данные при создании пользователя.' });
      }
      return res.status(ERR_500).send({ message: `Произошла ошибка: ${error.name}` });
    });
};

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((error) => res.status(ERR_500).send({ message: `Произошла ошибка: ${error.name}` }));
};

module.exports.getUserById = (req, res) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail(new Error('NotFound'))
    .then((user) => res.send({ data: user }))
    .catch((error) => {
      if (error.name === 'CastError') {
        return res.status(ERR_400).send({ message: 'Передан некорректный _id пользователя' });
      }
      if (error.message === 'NotFound') {
        return res.status(ERR_404).send({ message: 'Пользователь по указанному _id не найден.' });
      }
      return res.status(ERR_500).send({ message: `Произошла ошибка: ${error.name}` });
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { runValidators: true, new: true })
    .orFail(new Error('NotFound'))
    .then((user) => res.send({ data: user }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res.status(ERR_400).send({ message: 'Переданы некорректные данные при обновлении данных пользователя.' });
      }
      if (error.message === 'NotFound') {
        return res.status(ERR_404).send({ message: 'Пользователь по указанному _id не найден.' });
      }
      return res.status(ERR_500).send({ message: `Произошла ошибка: ${error.name}` });
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true })
    .orFail(new Error('NotFound'))
    .then((user) => res.send({ data: user }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res.status(ERR_400).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
      }
      if (error.message === 'NotFound') {
        return res.status(ERR_404).send({ message: 'Пользователь по указанному _id не найден.' });
      }
      return res.status(ERR_500).send({ message: `Произошла ошибка: ${error.name}` });
    });
};
