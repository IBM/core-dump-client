#!/bin/bash

mc alias set storage https://$S3_REGION $S3_ACCESS_KEY $S3_SECRET

mc cp storage/$S3_BUCKET_NAME/$CORE_FILE .

dirname="${CORE_FILE%.*}"
unzip $CORE_FILE -d $dirname

sleep infinity
