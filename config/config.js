module.exports.SEED = 'este-es-un-seed-dificil';

// Google
module.exports.GOOGLE_CLIENT_ID = '923516345543-a1apacli5mbs0bm8nqrl4t7po32lb1ic.apps.googleusercontent.com';
module.exports.GOOGLE_SECRET = 'rKqspI9RJDMYiNDyMUoFe5VZ';

const Mysqli = require('mysqli');

// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');

let conn = new Mysqli({
    Host: 'localhost', // IP/domain name 
    post: 3306, // port, default 3306 
    user: 'covid_user', // username 
    passwd: '123456', // password 
    db: 'covidjujuy'
});

let db = conn.emit(false, '');

module.exports = {
    database: db
}