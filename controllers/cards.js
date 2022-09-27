const Card = require('../models/cards');

const ERR_400 = 400;
const ERR_404 = 404;
const ERR_500 = 500;

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const { _id } = req.user;

  Card.create({ name, link, owner: _id })
    .then((card) => res.send({ data: card }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res.status(ERR_400).send({ message: 'Переданы некорректные данные при создании карточки.' });
      }
      return res.status(ERR_500).send({ message: `Произошла ошибка: ${error.name}` });
    });
};

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((error) => res.status(ERR_500).send({ message: `Произошла ошибка: ${error.name}` }));
};

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndDelete(cardId)
    .orFail(new Error('NotFound'))
    .then((card) => res.send({ data: card }))
    .catch((error) => {
      if (error.name === 'CastError') {
        return res.status(ERR_400).send({ message: 'Передан некорректный _id карточки' });
      }
      if (error.message === 'NotFound') {
        return res.status(ERR_404).send({ message: 'Пользователь по указанному _id не найден.' });
      }
      return res.status(ERR_500).send({ message: `Произошла ошибка: ${error.name}` });
    });
};

module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail(new Error('NotFound'))
    .then((card) => res.send({ data: card }))
    .catch((error) => {
      if (error.name === 'CastError') {
        return res.status(ERR_400).send({ message: 'Передан некорректный _id карточки' });
      }
      if (error.message === 'NotFound') {
        return res.status(ERR_404).send({ message: 'Пользователь по указанному _id не найден.' });
      }
      return res.status(ERR_500).send({ message: `Произошла ошибка: ${error.name}` });
    });
};

module.exports.dislikeCard = (req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndUpdate(cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => res.send({ data: card }))
    .catch((error) => {
      if (error.name === 'CastError') {
        return res.status(ERR_400).send({ message: 'Передан некорректный _id карточки' });
      }
      if (error.message === 'NotFound') {
        return res.status(ERR_404).send({ message: 'Пользователь по указанному _id не найден.' });
      }
      return res.status(ERR_500).send({ message: `Произошла ошибка: ${error.name}` });
    });
};
