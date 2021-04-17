var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const multer = require('multer');
const fs = require('fs');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const {ipList, router:homeRouter} = require('./routes/home');
const fileHandleRouter = require('./routes/uphandle');

const storage = multer.diskStorage({
  // destination: `${__dirname}/uploads`,
  destination:(req, file, cb) => {
    let reqIp = req.ip.split(':').pop();
    cb(null, `${__dirname}/uploads/${reqIp}/`); 
  },
  filename: (req, file, cb) => cb(null,file.originalname)
})
// const upload = multer({ dest: 'uploads/' });
const upload = multer({storage: storage});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/index', indexRouter);
app.use('/users', usersRouter);
app.post('/upload', upload.array('file', 100), (req, res, next) => {
  if (!req.files) {
    res.json({
      status: false,
      message: 'no file recieved'
    })
  }
 

  res.json({
    status: true
  })

  next();

})
app.post('/upload', fileHandleRouter);

app.use('/', homeRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
