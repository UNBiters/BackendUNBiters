const algoliasearch = require('algoliasearch');

// Connect and authenticate with your Algolia app
const client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_ADMIN_API_KEY);

// Create a new index. An index stores the data that you want to make searchable in Algolia.
const index = client.initIndex('chazas');
