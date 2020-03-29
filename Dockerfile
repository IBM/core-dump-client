FROM node:lts-buster

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

RUN apt-get update

RUN apt-get install -y lsb-release software-properties-common

RUN wget https://apt.llvm.org/llvm.sh

RUN chmod +x llvm.sh

RUN ./llvm.sh 9

ENV PATH="/usr/lib/llvm-9/bin:${PATH}"

RUN npm install -g llnode --unsafe-perm

USER node