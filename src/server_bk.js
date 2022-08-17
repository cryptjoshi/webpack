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
    {
   //   const router = new UniversalRouter(routes)
      const locale = req.language;
    // await store.dispatch(setLocale({
    //   locale,
    // }));
    // const store = configureStore({
    //   user: req.user || null,
    // }, {
    //   cookie: req.headers.cookie,
    //  // apolloClient,
    // });
    const store= {
      subscribe:{},
      dispatch:{}
    }
    const css = new Set();

    // // Global (context) variables that can be easily accessed from any React component
    // // https://facebook.github.io/react/docs/context.html
     const context = {
      // Enables critical path CSS rendering
      // https://github.com/kriasoft/isomorphic-style-loader
      insertCss: (...styles) => {
        // eslint-disable-next-line no-underscore-dangle
        styles.forEach(style => css.add(style._getCss()));
      },
      // Initialize a new Redux store
      // http://redux.js.org/docs/basics/UsageWithReact.html
      store,
      // Apollo Client for use with react-apollo
      client: {} //apolloClient,
     };

  
    const options = {
      ...context,
      path: req.path,
      query: req.query,
      resolveRoute(context, params) {
        if (typeof context.route.action === 'function') {
          return context.route.action(context, params)
        }
        return undefined
      },
      errorHandler(error, context) {
        console.error(error)
        console.info(context)
        return error.status === 404
          ? '<h1>Page Not Found</h1>'
          : '<h1>Oops! Something went wrong</h1>'
      }
    }
    //const router = new UniversalRouter(routes,options)
    // const routes = [
    //   { path: '/one', action: () => <h1>Page One</h1> },
    //   { path: '/two', action: () => <h1>Page Two</h1> },
    //   { path: '(.*)', action: () => <h1>Not Found</h1> }
    // ]
    
    const route = new UniversalRouter(routes,options)
    
    // router.resolve({ pathname: '/' }).then(component => {
    //   ReactDOM.render(component, document.body)
    //   // renders: <h1>Page One</h1>
    // })
    // // router.resolve('/posts').then(html => {
    // //   document.body.innerHTML = html // renders: <h1>Posts</h1>
    // // })

    // const route = await router.resolve(routes, {
    //   ...context,
    //   path: req.path,
    //   query: req.query,
    //   locale,
    // });

    // let currentLocation = req.path;
    // if (router.redirect) {
    //   res.redirect(router.status || 302, router.redirect);
    //   return;
    // }

    const data = { ...route };

    
    data.children = await renderToStringWithData(<App locale={locale} context={context}>{route.component}</App>);
    data.styles = [
      { id: 'css', cssText: [...css].join('') },
    ];
    data.scripts = [
      assets.vendor.js
    ];
  
    if (route.chunks) {
      data.scripts.push(...route.chunks.map(chunk => assets[chunk].js));
    }
    data.scripts.push(assets.client.js);

     data.lang = locale;

    const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
    res.status(route.status || 200);
    res.send(`<!doctype html>${html}`);
  } catch (err) {
    next(err);
  }
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('Serializing store...');
    }
  })
//
// Launch the server
// -----------------------------------------------------------------------------
/* eslint-disable no-console */
//models.sync().catch(err => console.error(err.stack)).then(() => {
    app.listen(port, () => {
      console.log(`The server is running at http://localhost:${port}/`);
    });
//  });
  /* eslint-enable no-console */
  console.log('Server')