## About the Project

This project is an example of how to implement Google Meet transcription using Recall.ai's API. The project contains both server side (transcript-backend) and a client app (transcript-app). 

### Prerequisites

* npm
  ```sh
  npm install npm@latest -g
  ```
* Start postgres locally
  ```sh
  brew services start postgresql
  ```
* Recall.ai API region and key

* Webhook domain: ngrok


### Run transcript-backend

* Install dependencies
  ```sh
  npm install
  ```
* Run migrations
  ```sh
  npx knex migrate:latest
  ```
* Start server
  ```sh
  npx ts-node src/index.ts
  ```

### Run transcript-app
* Install dependencies
  ```sh
  npm install
  ```
* Start
  ```sh
  npm run dev
  ```
