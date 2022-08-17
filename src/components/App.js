import React, { Children } from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import deepForceUpdate from 'react-deep-force-update';
 
 
const ContextType = {
  // Enables critical path CSS rendering
  // https://github.com/kriasoft/isomorphic-style-loader
  insertCss: PropTypes.any.isRequired,
  // Integrate Redux
  // http://redux.js.org/docs/basics/UsageWithReact.html
  store: PropTypes.shape({
    subscribe: PropTypes.any.isRequired,
    dispatch: PropTypes.any.isRequired,
    getState: PropTypes.any.isRequired,
  }).isRequired,
  // Apollo Client
  client: PropTypes.object.isRequired,
};

class App extends React.PureComponent {
  
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    children: PropTypes.element.isRequired,
  };

  static childContextTypes = ContextType;

  constructor(props) {
    super(props);
    this.state = {
      load: false
    };
  }
  getChildContext() {
    return this.props.context;
  }
  componentDidMount() {
    const store = this.props.context && this.props.context.store;
    if (store) {
      this.unsubscribe = store.subscribe(() => {
        const state = store.getState();
        const newIntl = state.intl;
        if (this.intl !== newIntl) {
          this.intl = newIntl;
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.log('Intl changed — Force rendering');
          }
          deepForceUpdate(this);
        }
      });
    }

    this.setState({
      load: true
    })
  }
  render(){
    const store = this.props.context && this.props.context.store;
    const state = store //&& store.getState();
    // this.intl = (state && state.intl) || {};
    // const { initialNow, locale, messages } = this.intl;
    // const localeMessages = (messages && messages[locale]) || {};
    const { load } = this.state;
    //let publishableKey = payment.stripe.publishableKey;

    if (load) {
      return (
        // <AsyncStripeProvider apiKey={publishableKey}>
        //   <IntlProvider
        //     initialNow={initialNow}
        //     locale={locale}
        //     messages={localeMessages}
        //     defaultLocale="en-US"
        //   >
        <>
            {Children.only(this.props.children)}
            </>
        //   </IntlProvider>
        // </AsyncStripeProvider>
      );
    } else {
      return (
        // <AsyncStripeProvider apiKey={publishableKey}>
        //   <IntlProvider
        //     initialNow={initialNow}
        //     locale={locale}
        //     messages={localeMessages}
        //     defaultLocale="en-US"
        //   >
          <>  {Children.only(this.props.children)}</>
        //   </IntlProvider>
        // </AsyncStripeProvider>
      );
    }
  }
}
export default App;
