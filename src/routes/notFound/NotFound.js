import React from 'react';
import PropTypes from 'prop-types';
//import { FormattedMessage, injectIntl } from 'react-intl';
//import {connect} from 'react-redux';
// import {
//   Grid,
//   Row,
//   Col } from 'react-bootstrap';
//import cx from 'classnames';
//import withStyles from 'isomorphic-style-loader/withStyles';
// import s from './NotFound.css';
// import bt from '../../../src/components/commonStyle.css';

// // Components
// import Link from '../../components/Link';

// // Locale
// import messages from '../../locale/messages';

class NotFound extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    siteName: PropTypes.string.isRequired,
    formatMessage: PropTypes.func,
  };

  render() {
    const {siteName} = this.props;
    
    return (
         <div>Not Found</div>
    );
  }
}

const mapState = (state) => ({
    siteName: ""
  //siteName: state.siteSettings.data.siteName
});

const mapDispatch = {};

export default NotFound;
