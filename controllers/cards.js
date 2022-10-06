const Card = require('../models/cards');
const WrongDataError = require('../errors/WrongDataError');
const NotFoundError = require('../errors/NotFoundError');
const NotAuthorizedCardError = require('../errors/NotAuthorizedCardError');

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

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }));
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;

  Card.findById(cardId)
    .orFail(new Error('NotFound'))
    .then((card) => {
      if (card.owner.toString() !== req.user._id) {
        next(new NotAuthorizedCardError('Карточка принадлежит другому пользователю.'));
      }
      Card.findByIdAndDelete(cardId)
        .then(() => res.status(200).send(`Карточка c id "${card._id}" удалена!`));
    })
    .catch((error) => {
      if (error.message === 'NotFound') {
        next(new NotFoundError('Карточка по указанному _id не найдена.'));
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
