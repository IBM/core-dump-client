#! /bin/bash

program_name=$0

function usage {
    echo "Usage: $program_name [corezipfilename] [runtime]"
    echo "  corezipfilename - the name of the zip file containing the core dump"
    echo "  runtime - the runtime type - nodejs rust currently supported"
    echo "  Example: $program_name file.zip nodejs"
    exit 1
}

if [ $# == 0 ] | [ $# -gt 2 ]; then
 usage
fi

rm -fr 36c0d272-3295-4474-a16e-00885ba04fed-dump-1631477784-crashing-app-848dc79df4-srqkv-node-8-4

filename=$(basename -- "$1")
dirname="${filename%.*}"

unzip -qq $1 -d $dirname

exe=$(jq -r '.exe' $dirname/$dirname-dump-info.json)
img=$(jq -r '.repoTags[0]' $dirname/$dirname-image-info.json)
# img=quay.io/icdh/example-crashing-nodejs-app
# will need a unique id
uuid=$(uuidgen)

nodert=$(kubectl run -it temp-cdc-$uuid --image=$img --restart=Never --rm -- which node | head -n 1)

mountedexe=/coreinfo$nodert

core_container_mount=$(dirname $nodert)

debug_container_mount=$(dirname $mountedexe)

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: node-debugger-$uuid
spec:

  restartPolicy: Never

  volumes:
  - name: shared-data
    emptyDir: {}

  containers:

  - name: core-container
    image: $img
    command: ["/bin/sh"]
    args: ["-c", "cp ${nodert} /shared; sleep infinity"]
    volumeMounts:
    - name: shared-data
      mountPath: /shared

  - name: debug-container
    image: quay.io/icdh/nodejs@sha256:ba165eabdfd63a668f41a47f9ffcc5c7a61ed618bfd0cb1dc65e27cc64308822
    volumeMounts:
    - name: shared-data
      mountPath: ${debug_container_mount}
    command: ["./init.sh"]
    env:
      - name: S3_ACCESS_KEY
        value: ${S3_ACCESS_KEY}
      - name: S3_SECRET
        value: ${S3_SECRET}
      - name: S3_BUCKET_NAME
        value: ${S3_BUCKET_NAME}
      - name: S3_REGION
        value: ${S3_REGION}
      - name: CORE_FILE
        value: ${1}
      - name: EXE_LOCATION
        value: ${mountedexe}
EOF
