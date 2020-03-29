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
$ helm install node-core-tool . --namespace ibm-observe
```

## usage 

Log into the pod
```
$ kubectl exec -it node-core-dump -- /bin/sh
```

List the core dumps
```
$ ls /node/core
```

Untar one of the dumps
```
$ tar xvzf XX-core.tar.gz -C ~/
```

```
$ llnode /usr/local/bin/node -c ~/xx.core
```