const mongoose = require('mongoose');
const Card = require('../models/cards');

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const { _id } = req.user;

  Card.create({ name, link, owner: _id })
    .then((card) => res.send({ data: card }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные при создании карточки.' });
      }
      return res.status(500).send({ message: `Произошла ошибка: ${error.name}` });
    });
};

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((error) => res.status(500).send({ message: `Произошла ошибка: ${error.name}` }));
};

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;

  if (!mongoose.isValidObjectId(cardId)) {
    res.status(400).send({ message: 'Передан некорректный _id карточки' });
    return;
  }

  Card.findByIdAndDelete(cardId)
    .then((card) => {
      if (card) {
        return res.send({ data: card });
      }
      return res.status(404).send({ message: 'Карточка с указанным _id не найдена.' });
    })
    .catch((error) => res.status(500).send({ message: `Произошла ошибка: ${error.name}` }));
};

module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;

  if (!mongoose.isValidObjectId(cardId)) {
    res.status(400).send({ message: 'Передан некорректный _id карточки' });
    return;
  }

  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) {
        return res.send({ data: card });
      }
      return res.status(404).send({ message: 'Передан несуществующий _id карточки.' });
    })
    .catch((error) => res.status(500).send({ message: `Произошла ошибка: ${error.name}` }));
};

module.exports.dislikeCard = (req, res) => {
  const { cardId } = req.params;

  if (!mongoose.isValidObjectId(cardId)) {
    res.status(400).send({ message: 'Передан некорректный _id карточки' });
    return;
  }

  Card.findByIdAndUpdate(cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) {
        return res.send({ data: card });
      }
      return res.status(404).send({ message: 'Передан несуществующий _id карточки.' });
    })
    .catch((error) => res.status(500).send({ message: `Произошла ошибка: ${error.name}` }));
};
