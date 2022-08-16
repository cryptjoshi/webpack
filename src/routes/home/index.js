import React from 'react';
import Home from './Home';
///import fetch from '../../core/fetch';
//import HomeLayout from '../../components/Layout/HomeLayout';

//import { getListingFields } from '../../actions/getListingFields';

export default {

  path: '/',

  async action({store}) {
    const title = "React Webpack 5";//store.getState().siteSettings.data.siteTitle;
    const description ="React Webpack5";// store.getState().siteSettings.data.metaDescription;
    const listingFields = {};//store.getState().listingFields.data;
    const layoutType = "";//store.getState().siteSettings.data.homePageType;

    // if (listingFields === undefined) {
    //   store.dispatch(getListingFields());
    // }
    
    return {
      title,
      description,
      listingFields,
      chunk: 'home',
      component: <Home/>,
    };
  },

};
