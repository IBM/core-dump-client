#!/bin/bash

mc alias set storage $S3_REGION $S3_ACCESS_KEY $S3_SECRET

mc cp storage/$S3_BUCKET_NAME/$CORE_FILE .

#filename=$(basename -- "$CORE_FILE")
dirname="${CORE_FILE%.*}"
unzip $1 -d $dirname

exe=$EXE_LOCATION

core=$dirname/$dirname.core

llnode $exe -c $core
