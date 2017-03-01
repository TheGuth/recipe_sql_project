exports.DATABASE_URL = process.env.DATABASE_URL ||
                     global.DATABASE_URL ||
                     'localhost:8080';

exports.PORT = process.env.PORT || 8080;
