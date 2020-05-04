var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use((req,res, next) => {
  console.log(req.url, 'This is first middleware!!');
  next();
}, (req, res, next) => {
  console.log(req.url, 'This is second middleware!!');
  next();
}, (req, res, next) => {
  console.log(req.url, 'This is third middleware!!');
  next();
});

app.use(logger('dev'));

// static file 처리 (다른 middleware 보다 윗쪽이 좋음
app.use(express.static(path.join(__dirname, 'public')));

// body parser 기능 추가
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.raw());
app.use(bodyParser.text());

// cookie parser 기능 추가
app.use(cookieParser('secret code'));

// express-session 기능 추가
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'secret code',
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));

// connect-flash 기능 추가
app.use(flash());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
