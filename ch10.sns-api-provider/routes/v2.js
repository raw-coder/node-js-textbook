const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const url = require('url');

const { verifyToken, apiLimiter } = require('./middlewares');
const { Domain, User, Post, Hashtag } = require('../models');

const router = express.Router();

router.use(cors);

router.use(async (req, res, next) => {
  const domain = await Domain.find({
    where: { host: url.parse(req.get('origin')).host },
  });
  if (domain) {
    cors({ origin: req.get('origin') })(req, res, next);
  } else {
    next();
  }
});

router.post('/token', apiLimiter, async (req, res) => {
  const { clientSecret } = req.body;
  try {
    const domain = await Domain.findOne({
      where: { clientSecret },
      include: {
        model: User,
        attribute: ['nick', 'id'],
      },
    });
    if (!domain) {
      return res.status(401).json({
        code: 401,
        message: 'Domain is not registerd.',
      });
    }
    const token = jwt.sign({
      id: domain.user.id,
      nick: domain.user.nick,
    }, process.env.JWT_SECRET, {
      expiresIn: '30m',
      issuer: 'rawcoder',
    });
    return res.json({
      code: 200,
      message: 'Token is published',
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

router.get('/test', verifyToken, apiLimiter, (req, res) => {
  res.json(req.decoded);
});

router.get('/posts/my', verifyToken, apiLimiter, (req, res) => {
  Post.findAll({ where: { userId: req.decoded.id }})
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
        message: 'Server Error',
      });
    });
})

router.get('/post/hashtag/:title', verifyToken, apiLimiter, async (req, res) => {
  try {
    const hashtag = await Hashtag.find({ where: { title: req.params.title }});
    if (!hashtag) {
      return res.status(404).json({
        code: 404,
        message: 'No Result',
      });
    }
    const posts = await hashtag.getPosts();
    return res.json({
      code: 200,
      payload: posts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: 'Internal Server Error',
    });
  }
});

module.exports = router;