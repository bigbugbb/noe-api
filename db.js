var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });

// var esClient = new elasticsearch.Client({host: 'localhost:9200'});
