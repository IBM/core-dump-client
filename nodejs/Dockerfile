FROM node:16.9-buster

RUN apt-get update

RUN apt-get install -y lsb-release software-properties-common vim

RUN wget https://apt.llvm.org/llvm.sh

RUN chmod +x llvm.sh

RUN ./llvm.sh 9

ENV PATH="/usr/lib/llvm-9/bin:${PATH}"

RUN npm install -g llnode --unsafe-perm

WORKDIR /usr/bin

RUN wget https://dl.min.io/client/mc/release/linux-amd64/mc

RUN chmod +x mc

WORKDIR /debug 
RUN chown -R node:node /debug
RUN chmod 755 /debug

COPY --chown=node:node init.sh init.sh
COPY --chown=node:node rundebug.sh rundebug.sh
RUN chmod +x init.sh

USER node

RUN echo "plugin load /usr/local/lib/node_modules/llnode/llnode.so" > ~/.lldbinit

CMD [ "./init.sh" ]
