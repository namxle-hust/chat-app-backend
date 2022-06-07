#!/bin/bash

# Run db-migrate
npm install
db-migrate up


echo "Starting app"

# Starting app
node app.js

