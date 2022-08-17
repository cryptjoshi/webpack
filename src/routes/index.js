export default {

    path: '/',
    children:[
        require('./home').default,
        require('./notFound').default,
    ],
    async action({ next }) {
        // Execute each child route until one of them return the result
        const route = await next();
        console.log(route)
        // Provide default values for title, description etc.
        route.title = `${route.title || 'Untitled Page'}`;
        route.description = route.description || '';
    
        return route;
      },
}  