#!/bin/bash

MONGO_DATA_DIRECTORY="mongoDB/data"
MONGO_PORT=27017

if ! mkdir -p $MONGO_DATA_DIRECTORY; then
    echo "Data directory was not created => mongo not started"
else
mongod --port $MONGO_PORT --dbpath $MONGO_DATA_DIRECTORY
fi
