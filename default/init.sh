#!/bin/bash

if [ -z ${GITPOD_INSTANCE_ID+x} ]; then 
    echo "Running Stand Alone"; 
else 
    export HOME=/workspace
    cd $HOME
fi

mc alias set storage https://$S3_REGION $S3_ACCESS_KEY $S3_SECRET

mc cp storage/$S3_BUCKET_NAME/$CORE_FILE .

dirname="${CORE_FILE%.*}"
unzip $CORE_FILE -d $dirname

if [ -z ${GITPOD_INSTANCE_ID+x} ]; then 
    sleep infinity
fi
