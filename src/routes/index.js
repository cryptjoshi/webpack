export default {

    path: '/',
    children:[
        require('./home').default,
       // require('./notFound').default,
    ],
    async action({ next }) {
        // Execute each child route until one of them return the result
        const route = await next();
       
        // Provide default values for title, description etc.
        route.title = `${route.title || 'Untitled Page'} mo by route`;
        route.description = `${route.description || 'Untitled Page'} mo by route`;
    
        return route;
      },
}  