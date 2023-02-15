export default {
   "type": process.env.APP_DB_TYPE,
   "host": process.env.APP_DB_HOST,
   "port": process.env.APP_DB_PORT,
   "username": process.env.APP_DB_USERNAME,
   "password": process.env.APP_DB_PASSWORD,
   "database": process.env.APP_DB_DATABASE,
   "synchronize": true,
   "logging": false,
   "entities": [
      "src/entity/**/*.ts"
   ],
   "migrations": [
      "src/migration/**/*.ts"
   ],
   "subscribers": [
      "src/subscriber/**/*.ts"
   ],
   "cli": {
      "entitiesDir": "src/entity",
      "migrationsDir": "src/migration",
      "subscribersDir": "src/subscriber"
   }
}