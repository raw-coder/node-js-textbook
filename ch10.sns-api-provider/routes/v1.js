const express = require('express');
const jwt = require('jsonwebtoken');

const {verifyToken} = require('./middlewares');
const {Domain, User, Post, Hashtag} = require('../models');

const router = express.Router();

router.post('/token', async (req, res) => {
  const {clientSecret} = req.body;
  try {
    const domain = await Domain.findOne({
      where: {clientSecret},
      include: {
        model: User,
        attribute: ['nick', 'id'],
      },
    });
    if (!domain) {
      return res.status(401).json({
        code: 401,
        message: 'Unregistered Domain',
      });
    }
    const token = jwt.sign({
      id: domain.user.id,
      nick: domain.user.nick,
    }, process.env.JWT_SECRET, {
      expiresIn: '1m',
      issuer: 'rawcoder',
    });
    return res.json({
      code: 200,
      message: 'Token Published',
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: 'Server Error',
    });
  }
});

router.get('/test', verifyToken, (req, res) => {
  res.json(req.decoded);
});

router.get('/posts/my', verifyToken, (req, res) => {
  Post.findAll({
    where: {userId: req.decoded.id},
  })
    .then(posts => {
      console.log(posts);
      res.json({
        code: 200,
        payload: posts,
      });
    })
    .catch(error => {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: 'Internal Server Error',
      });
    });
});

router.get('/posts/hashtag/:title', verifyToken, async (req, res) => {
  try {
    const hashtag = await Hashtag.findOne({
      where: {
        title: req.params.title,
      },
    });
    if (!hashtag) {
      return res.status(404).json({
        code: 404,
        message: 'No Hashtags',
      });
    }
    const posts = await hashtag.getPosts();
    return res.json({
      code: 200,
      payloads: posts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: 'Server Error',
    });
  }
});

module.exports = router;