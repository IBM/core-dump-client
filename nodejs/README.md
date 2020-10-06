# Node.JS Core Dump Container

This is a container configured with [llnode](https://github.com/nodejs/llnode/) to facilate the debugging of core-dumps.

It is intended to be used with [ibm-core-dump-handler]().

## install

Ensure the Persisent Volume Claim configuration in values is correct.
The bucket name and secret should align with the configuration you used in ibm-core-dump handler.
```
    bucketName: "coredumps-002"
    bucketSecretName: "cos-write-access"
```

Install the helm chart
```
$ cd deploy
$ helm install coretools . --namespace ibm-observe --set pvc.bucketName=UNIQUE_BUCKET
```

## usage 

Log into the pod
```
$ kubectl exec -it coretools-nodejs-core-dump-xxxxx=xxxx -- /bin/bash
```

List the core dumps
```
$ ls /cores
```

Unzip one of the dumps
```
$ cp xx.gz .
$ gunzip xx.gz
```

```
$ llnode /usr/local/bin/node -c xx.core
```