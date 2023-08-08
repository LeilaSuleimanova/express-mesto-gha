const { default: mongoose } = require('mongoose');
const Card = require('../models/card');
const {
  CastError,
  DocumentNotFoundError,
  ServerError,
} = require('../utils/constants');

module.exports.addCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      Card.findById(card._id)
        .populate('owner')
        .then((data) => res.send(data))
        .catch(() => res.status(DocumentNotFoundError).send({ message: 'Карточка по id не найдена.' }));
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(CastError).send({ message: err.message });
      } else {
        res.status(ServerError).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.getCards = (req, res) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.send(cards))
    .catch(() => res.status(ServerError).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail()
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        res.status(CastError).send({ message: 'Некорректный id карточки.' });
      } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(DocumentNotFoundError).send({ message: 'Карточка с указанным id не найдена.' });
      } else {
        res.status(ServerError).send({ message: 'Произошла ошибка.' });
      }
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .populate(['owner', 'likes'])
    .orFail()
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        res.status(CastError).send({ message: 'Некорректный id карточки.' });
      } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(DocumentNotFoundError).send({ message: 'Карточка с указанным id не найдена.' });
      } else {
        res.status(ServerError).send({ message: 'Произошла ошибка.' });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .populate(['owner', 'likes'])
    .orFail()
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        res.status(CastError).send({ message: 'Некорректный id карточки.' });
      } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(DocumentNotFoundError).send({ message: 'Карточка с указанным id не найдена.' });
      } else {
        res.status(ServerError).send({ message: 'Произошла ошибка.' });
      }
    });
};
