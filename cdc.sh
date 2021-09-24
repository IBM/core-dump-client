#! /bin/bash

program_name=$0

function usage {
    echo "Usage: $program_name [corezipfilename] [runtime] [exename] [image]"
    echo "  corezipfilename - the name of the zip file containing the core dump"
    echo "  runtime - the runtime type - nodejs rust currently supported"
    echo "  exename - the name of the executable to be debugged"
    echo "  image - image of the crashed container"
    echo "  namespace - namespace of core dump handler"
    echo "  Example: $program_name file.zip nodejs node image/crashedapp:latest observe"
    exit 1
}

if [ $# -ne 5 ]; then
 usage
fi


if [ $2 == "nodejs" ]; 
then
  img_debug="quay.io/icdh/nodejs@sha256:ba165eabdfd63a668f41a47f9ffcc5c7a61ed618bfd0cb1dc65e27cc64308822"
else 
  img_debug="quay.io/icdh/default"
fi

filename=$(basename -- "$1")
dirname="${filename%.*}"
core_location=$dirname/$dirname.core
cmd='cp $(which '${3}' | head -n 1) /shared; sleep infinity'

# will need a unique id
uuid=$(uuidgen)

cat <<EOF | kubectl apply -n $5 -f -
apiVersion: v1
kind: Pod
metadata:
  name: debugger-$uuid
spec:

  restartPolicy: Never

  volumes:
  - name: shared-data
    emptyDir: {}

  containers:
  - name: debug-container
    image: $img_debug
    volumeMounts:
    - name: shared-data
      mountPath: /shared
    command: ["./init.sh"]
    env:
      - name: S3_ACCESS_KEY
        valueFrom:
          secretKeyRef:
            name: s3config
            key: s3AccessKey
      - name: S3_SECRET
        valueFrom:
          secretKeyRef:
            name: s3config
            key: s3Secret
      - name: S3_BUCKET_NAME
        valueFrom:
          secretKeyRef:
            name: s3config
            key: s3BucketName
      - name: S3_REGION
        valueFrom:
          secretKeyRef:
            name: s3config
            key: s3Region
      - name: CORE_FILE
        value: ${1}
      - name: EXE_LOCATION
        value: /shared/$3
      - name: CORE_LOCATION
        value: $core_location
  - name: core-container
    image: $4
    command: ["/bin/sh"]
    args: ["-c", $cmd]
    volumeMounts:
    - name: shared-data
      mountPath: /shared
EOF
