const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { pool } = require('./database-pg');

const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;

const store = new pgSession({
  pool,
  tableName: 'session',
  createTableIfMissing: false
});

module.exports = store;
module.exports.FIFTEEN_DAYS = FIFTEEN_DAYS;
