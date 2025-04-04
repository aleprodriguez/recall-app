import knex from 'knex';
import config from '../knexfile';

const environment = 'development';
const connection = knex(config[environment]);

export default connection;
