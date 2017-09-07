#!/bin/bash

MONGO_DATA_DIRECTORY="mongoDB/data"
MONGO_PORT=27017

if ! mkdir -p $MONGO_DATA_DIRECTORY; then
    echo "Data directory was not created => mongo not started"
else
mongod --port $MONGO_PORT  --dbpath $MONGO_DATA_DIRECTORY &>/dev/null &

if ! [ -z "$(lsof -i :$MONGO_PORT | grep mongo)" ]; then

if [ ! -f private/development.settings.json ]; then
    echo "-------------------------------------------------------------------------------------"
    echo "File development.settings.json not found, meteor will be started without --settings"
    echo "----------------------------------k---------------------------------------------------"
    MONGO_URL=mongodb://localhost:$MONGO_PORT/meteor  meteor run
else
MONGO_URL=mongodb://localhost:$MONGO_PORT/meteor  meteor run --settings private/development.settings.json
fi

else
    echo "-------------------------------------------------------"
    echo "External mongo is not running, run script run-mongo.sh"
    echo "-------------------------------------------------------"
fi

fi
