import React, { Component } from 'react';
import ReactDOM from 'react-dom/server';
import path from 'path';
import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import requestLanguage from 'express-request-language';
//import { renderToStringWithData } from 'react-apollo';
import { renderToStringWithData } from "@apollo/client/react/ssr";
import UniversalRouterSync from 'universal-router/sync';
import PrettyError from 'pretty-error';
import bodyParser from 'body-parser';
import { port, auth, locales } from './config';
import App from './components/App';
import Html from './components/Html';
import { ErrorPageWithoutStyle } from './routes/error/ErrorPage';
import errorPageStyle from './routes/error/ErrorPage.css';
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
    { 
      
      const context = {
        insertCss: {},
        store: {
          subscribe:{},
          dispatch:{},
          getState:{}
        },
        client: {}
      }
      const locale = "en"
      const css = new Set();
      const router = new UniversalRouterSync(routes,{...context,  path: req.path,
        query: req.query,
        pathname: req.path,
        locale})
      const result = await router.resolve({path:req.path,pathname:req.path})
     
      if (result.redirect) {
        res.redirect(result.status || 302, result.redirect);
        return;
      }
      const data = {...result}
      data.children = await renderToStringWithData(<App context={context}>{result.component}</App>);
      data.styles = [
        { id: 'css', cssText: [...css].join('') },
      ];
      data.scripts = [
       // client.js
      ];
    
      if (result.chunks) {
        data.scripts.push(...route.chunks.map(chunk => assets[chunk].js));
      }
     // data.scripts.push(assets.client.js);
  
      data.lang = locale;
  
      const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
      res.status(200);
      res.send(`<!doctype html>${html}`);
      //context.route.action 
      // router.resolve(path).then(component => {
      //   ReactDOM.render(component,document.body)
      // })
     // res.send('server running!')
    }
    catch(err) {
      next(err);
    }
})
//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.log(pe.render(err)); // eslint-disable-line no-console
  const locale = req.language;
  const html = ReactDOM.renderToStaticMarkup(
    <Html
      title="Internal Server Error"
      description={err.message}
      styles={[{ id: 'css', cssText: errorPageStyle._getCss() }]} // eslint-disable-line no-underscore-dangle
      lang={locale}
    >
      {/* {ReactDOM.renderToString(
        <IntlProvider locale={locale}>
          <ErrorPageWithoutStyle error={err} />
        </IntlProvider>,
      )} */}
    </Html>,
  );
  res.status(err.status || 500);
  res.send(`<!doctype html>${html}`);
});

app.listen(port, () => {
    console.log(`The server is running at http://localhost:${port}/`);
  });
//  });
/* eslint-enable no-console */
 