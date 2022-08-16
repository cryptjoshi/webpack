import React from 'react';
import ReactDOM from 'react-dom';
//import { addLocaleData } from 'react-intl';
import { IntlProvider } from 'react-intl';
// import en from 'react-intl/locale-data/en';
// import cs from 'react-intl/locale-data/cs';
// import es from 'react-intl/locale-data/es';
// import it from 'react-intl/locale-data/it';
// import fr from 'react-intl/locale-data/fr';
// import pt from 'react-intl/locale-data/pt';
// import ar from 'react-intl/locale-data/ar';
import history from './core/history';
 
//[en, es, it, fr, pt, ar].forEach(addLocaleData);
const container = document.getElementById('app');
let currentLocation = history.location;
let appInstance;
const context = {}
async function onLocationChange(location, action) {
try {
 
    let locale = "en";
    const route = await UniversalRouter.resolve(routes, {
      ...context,
      path: location.pathname,
      query: queryString.parse(location.search),
      locale,
    });

    // Prevent multiple page renders during the routing process
    if (currentLocation.key !== location.key) {
      return;
    }

    if (route.redirect) {
      history.replace(route.redirect);
      return;
    }
    const renderReactApp = isInitialRender ? ReactDOM.hydrate : ReactDOM.render;
    appInstance = renderReactApp(
      <App>{route.component}</App>
       /* <IntlProvider locale ={locale}>*/
        // <App locale={locale} context={context}>{route.component}</App>
        /*</IntlProvider>*/,
        container,
        () => {
          //onRenderComplete(route, location)
          if (isInitialRender) {
            const elem = document.getElementById('css');
            if (elem) elem.parentNode.removeChild(elem);
            return;
          }
  
          document.title = route.title;
         // updateMeta('description', route.description);
  
          let scrollX = 0;
          let scrollY = 0;
          const pos = scrollPositionsHistory[location.key];
          if (pos) {
            scrollX = pos.scrollX;
            scrollY = pos.scrollY;
          } else {
            const targetHash = location.hash.substr(1);
            if (targetHash) {
              const target = document.getElementById(targetHash);
              if (target) {
                scrollY = window.pageYOffset + target.getBoundingClientRect().top;
              }
            }
          }
  
          // Restore the scroll position if it was saved into the state
          // or scroll to the given #hash anchor
          // or scroll to top of the page
          window.scrollTo(scrollX, scrollY);
          // Google Analytics tracking. Don't send 'pageview' event after
          // the initial rendering, as it was already sent
          if (window.ga) {
            window.ga('send', 'pageview', createPath(location));
          }
  
        },
      );
}
catch (error) {
    // Display the error in full-screen for development mode
    if (__DEV__) {
      appInstance = null;
      document.title = `Error: ${error.message}`;
      ReactDOM.render(<ErrorReporter error={error} />, container);
      throw error;
    }

    console.error(error); // eslint-disable-line no-console

    // Do a full page reload if error occurs during client-side navigation
    if (!isInitialRender && currentLocation.key === location.key) {
      window.location.reload();
    }
  }
}
// Handle client-side navigation by using HTML5 History API
// For more information visit https://github.com/mjackson/history#readme
history.listen(onLocationChange);
onLocationChange(currentLocation);

// export default function main() {
//   // Handle client-side navigation by using HTML5 History API
//   // For more information visit https://github.com/mjackson/history#readme
//   currentLocation = history.location;
//   history.listen(onLocationChange);
//   onLocationChange(currentLocation);
// }

// Handle errors that might happen after rendering
// Display the error in full-screen for development mode
if (__DEV__) {
  window.addEventListener('error', (event) => {
    appInstance = null;
    document.title = `Runtime Error: ${event.error.message}`;
    ReactDOM.render(<ErrorReporter error={event.error} />, container);
  });
}

// Enable Hot Module Replacement (HMR)
if (module.hot) {
  module.hot.accept('./routes', async () => {
    routes = require('./routes').default; // eslint-disable-line global-require

    currentLocation = history.location;

    // if (appInstance) {
    //   try {
    //     // Force-update the whole tree, including components that refuse to update
    //     deepForceUpdate(appInstance);
    //   } catch (error) {
    //     appInstance = null;
    //     document.title = `Hot Update Error: ${error.message}`;
    //     ReactDOM.render(<ErrorReporter error={error} />, container);
    //   }
    // }
    if (appInstance && appInstance.updater.isMounted(appInstance)) {
      // Force-update the whole tree, including components that refuse to update
      deepForceUpdate(appInstance);
    }

    await onLocationChange(currentLocation);
  });
}