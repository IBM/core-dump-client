FROM node:lts-buster

RUN apt-get update

RUN apt-get install -y lsb-release software-properties-common

RUN wget https://apt.llvm.org/llvm.sh

RUN chmod +x llvm.sh

RUN ./llvm.sh 9

ENV PATH="/usr/lib/llvm-9/bin:${PATH}"

RUN npm install -g llnode --unsafe-perm

USER node