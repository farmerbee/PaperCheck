var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const multer = require('multer');


var indexRouter = require('./routes/index');
const { router: homeRouter } = require('./routes/home');
const { router: uploadRouter } = require('./routes/upload');
const { router: processRouter } = require('./routes/process');
const downloadRouter = require('./routes/download');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let reqIp = req.ip.split(':').pop();
    cb(null, `${__dirname}/uploads/${reqIp}/`);
  },
  filename: (req, file, cb) => cb(null, file.originalname)
})
const upload = multer({ storage: storage });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.all("*", function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});
app.get('/index*', indexRouter);
app.use('/upload', upload.array('file', 100), (req, res, next) => {
  next();
})
app.use('/upload', uploadRouter);
app.use('/process', processRouter);
app.use('/download', downloadRouter);

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