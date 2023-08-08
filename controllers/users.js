const { default: mongoose } = require('mongoose');
const {
  Created,
  CastError,
  DocumentNotFoundError,
  ServerError,
} = require('../utils/constants');
const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ users }))
    .catch(() => res.status(ServerError).send({ message: 'Произошла ошибка' }));
};

module.exports.getUserId = (req, res) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        res.status(CastError).send({ message: `Некорректный id ${req.params.userId}.` });
      } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(DocumentNotFoundError).send({ message: `Пользователь по id ${req.params.userId} не найден.` });
      } else {
        res.status(ServerError).send({ message: 'Произошла ошибка.' });
      }
    });
};

module.exports.addUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(Created).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(CastError).send({ message: err.message });
      } else {
        res.status(ServerError).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.editUserAvatar = (req, res) => {
  User.findByIdAndUpdate(req.user._id, { avatar: req.body.avatar }, { new: 'true', runValidators: true })
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(CastError).send({ message: err.message });
      } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(DocumentNotFoundError).send({ message: 'Пользователь по id не найден.' });
      } else {
        res.status(ServerError).send({ message: 'Произошла ошибка.' });
      }
    });
};

module.exports.editUserInfo = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: 'true', runValidators: true })
    .orFail()
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(CastError).send({ message: 'Некорректный id.' });
      } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(DocumentNotFoundError).send({ message: 'Пользователь по id не найден.' });
      } else {
        res.status(ServerError).send({ message: 'Произошла ошибка.' });
      }
    });
};
