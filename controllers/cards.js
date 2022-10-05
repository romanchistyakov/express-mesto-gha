const Card = require('../models/cards');
const WrongDataError = require('../errors/WrongDataError');
const NotAuthorizedError = require('../errors/NotAuthorizedError');
const NotFoundError = require('../errors/NotFoundError');

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const { _id } = req.user;

  Card.create({ name, link, owner: _id })
    .then((card) => res.send({ data: card }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new WrongDataError('Переданы некорректные данные при создании карточки.'));
      }
      next();
    });
};

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next());
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;

  Card.findById(cardId)
    .orFail(new Error('NotFound'))
    .then((card) => {
      if (card.owner !== req.user._id) {
        next(new NotAuthorizedError('Карточка принадлежит другому пользователю.'));
      }
      return Card.findByIdAndDelete(cardId)
        .then(() => res.send({ data: card }));
    })
    .catch((error) => {
      if (error.message === 'NotFound') {
        next(new NotFoundError('Пользователь по указанному _id не найден.'));
      }
      if (error.name === 'CastError') {
        next(new WrongDataError('Передан некорректный _id карточки'));
      }
      next();
    });
};

module.exports.likeCard = (req, res, next) => {
  const { cardId } = req.params;

  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail(new Error('NotFound'))
    .then((card) => res.send({ data: card }))
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new WrongDataError('Передан некорректный _id карточки'));
      }
      if (error.message === 'NotFound') {
        next(new NotFoundError('Пользователь по указанному _id не найден.'));
      }
      next();
    });
};

module.exports.dislikeCard = (req, res, next) => {
  const { cardId } = req.params;

  Card.findByIdAndUpdate(cardId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail(new Error('NotFound'))
    .then((card) => res.send({ data: card }))
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new WrongDataError('Передан некорректный _id карточки'));
      }
      if (error.message === 'NotFound') {
        next(new NotFoundError('Пользователь по указанному _id не найден.'));
      }
      next();
    });
};
