import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './ErrorPage.css';

// Locale
//import messages from '../../locale/messages';

class ErrorPage extends React.Component {
  static propTypes = {
    // formatMessage: PropTypes.func,
    // error: PropTypes.shape({
    //   name: PropTypes.string.isRequired,
    //   message: PropTypes.string.isRequired,
    //   stack: PropTypes.string.isRequired,
    // }).isRequired,
  };

  render() {
    if (__DEV__) {
      const { error } = this.props;
      return (
        <div>
          <h1>{error}</h1>
        </div>
      );
    }

    return (
      <div>
       
      </div>
    );
  }
}

export { ErrorPage as ErrorPageWithoutStyle };
export default withStyles(s)(ErrorPage);
