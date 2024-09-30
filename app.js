require("dotenv").config();

const express = require("express"),
  app = express(),
  cors = require('cors'),
  path = require("path"),
  redis = require('redis'),
  logger = require("morgan"),
  env = process.env.NODE_ENV,
  createError = require("http-errors"),
  session = require('express-session'),
  cmsRouter = require("./routes/cms.router"),
  authRouter = require("./routes/auth.router"),
  RedisStore = require('connect-redis')(session),
  commonHelper = require("./utils/common.helper"),
  authMiddleware = require("./middleware/auth.middleware");
/*
|--------------------------------------------------------------------------
| VIEW ENGINE SETUP
|--------------------------------------------------------------------------
*/
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
/*
|--------------------------------------------------------------------------
| DEVELOPMENT ENVIRONMENT USED TO STORE LOGS
|--------------------------------------------------------------------------
*/
app.use(logger("dev"));
/*`
|--------------------------------------------------------------------------
| PARSED INCOMING REQUEST'S TO JSON PAYLOAD
| PARSE INCOMING REQUEST'S WITH URL-ENCODED PAYLOAD'S
|--------------------------------------------------------------------------
*/
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  name: "SLIC-CHATBOT-CMS",
  store: new RedisStore({ 
      client: redis.createClient({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        db: process.env.REDIS_DB,
        ttl: 20 * 60 * 1000
      })
  }),
  cookie: {
    maxAge: 20 * 60 * 1000,
    domain: process.env.SESSION_DOMAIN,
    httpOnly: true
  },
  secret: process.env.SECRET_KEY,
  resave: true,
  saveUninitialized: true
}))
/*
|--------------------------------------------------------------------------
| CONFIGURE CLIENT SIDE DATA FILES USING PUBLIC FOLDER
|--------------------------------------------------------------------------
*/
app.use(express.static(path.join(__dirname, "public")));
/*
|--------------------------------------------------------------------------
| COMMON MIDDLEWARE USING FOR SEND OBJECTS TO PUG FILES
|--------------------------------------------------------------------------
*/
app.use((request, response, next) => {
  response.locals.env = env;
  response.locals.utils = commonHelper;
  next();
});
/*
|--------------------------------------------------------------------------
| BASIC ROUTER
|--------------------------------------------------------------------------
*/
app.get('/chat-bot', (req, res) => {
  res.render('chat-bot');
});
app.get('/real-time-app', (req, res) => {
  res.render('real-time-app');
});
app.get('/websocket', (req, res) => {
  res.render('websocket');
});
app.use("/auth/", authRouter);
app.use("/api/auth/login", authRouter);
app.use('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
});
app.use("/", authMiddleware, cmsRouter);
/*
|--------------------------------------------------------------------------
| CATCH 404 AND FORWARD TO ERROR HANDLER
|--------------------------------------------------------------------------
*/
app.use(function (req, res, next) {
  next(createError(404));
});
/*
|--------------------------------------------------------------------------
| ERROR HANDLER FOR INTERNAL SERVER ERROR & NOT FOUND & OTHER ERRORS
|--------------------------------------------------------------------------
*/
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 404);
  return res.status(404).send({ code: 404, message: err.message });
});

module.exports = app;
