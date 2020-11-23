
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
const bodyParser = require('body-parser')

// app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));





// 静态资源
app.use(express.static(path.join(__dirname, 'public')))
// post请求
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.header.origin);//需要显示设置来源
  res.header('Access-Control-Allow-Header', 'Origun,x-Requested-With,Content-Type,Accept');
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Credentials', true);//带cookie
  console.log(`${req.url}`);
  next();
})
app.use('/', indexRouter);
app.use('/users', usersRouter);
// -------------------------------------------------------------
const followRouter = require('./routes/follow')
app.use('/users', followRouter)
// -------------------------------------------------------------
var http = require('http');
var server = http.createServer(app);
server.listen('3000')
