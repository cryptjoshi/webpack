import React from 'react';
import ReactDOM from 'react-dom/server';
import path from 'path';
import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import requestLanguage from 'express-request-language';
//import { renderToStringWithData } from 'react-apollo';
import { renderToStringWithData } from "@apollo/client/react/ssr";
import UniversalRouter from 'universal-router';
import bodyParser from 'body-parser';
import { port, auth, locales } from './config';
import App from './components/App';
import Html from './components/Html';
import routes from './routes';
import assets from './assets.json'; 
//import models from './data/models';
const app = express();
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use('/.well-known', express.static(path.join(__dirname, '../well-known')));
app.use(cookieParser());
app.use(requestLanguage({
  languages: locales,
  queryName: 'lang',
  cookie: {
    name: 'lang',
    options: {
      path: '/',
      maxAge: 3650 * 24 * 3600 * 1000, // 10 years in miliseconds
    },
    url: '/lang/{language}',
  },
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//
// Authentication
// -----------------------------------------------------------------------------
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});


if (__DEV__) {
    app.enable('trust proxy');
  }
  app.get('*', async (req, res, next) => {
    try 
    { res.send('server running!')}
    catch {

    }
})
app.listen(port, () => {
    console.log(`The server is running at http://localhost:${port}/`);
  });
//  });
/* eslint-enable no-console */
console.log('Server')