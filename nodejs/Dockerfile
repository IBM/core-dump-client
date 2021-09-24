FROM registry.access.redhat.com/ubi8/ubi

RUN yum install -y --disableplugin=subscription-manager vim wget llvm-toolset xz git llvm-devel python39 make unzip

RUN wget https://nodejs.org/dist/v14.17.6/node-v14.17.6-linux-x64.tar.xz 

RUN tar -xf node-v14.17.6-linux-x64.tar.xz 

RUN cp -fr node-v14.17.6-linux-x64/* /usr  

RUN git clone --branch use-llvm-project-monorepo https://github.com/trxcllnt/llnode.git /usr/local/lib/llnode \
 && npm install --global --unsafe-perm --no-audit --no-fund /usr/local/lib/llnode 

WORKDIR /usr/bin

RUN wget https://dl.min.io/client/mc/release/linux-amd64/mc

RUN chmod +x mc

RUN useradd -m debugger

WORKDIR /debug 
RUN chown -R debugger:debugger /debug
RUN chmod 755 /debug

COPY --chown=debugger:debugger init.sh init.sh
COPY --chown=debugger:debugger rundebug.sh rundebug.sh
RUN chmod +x init.sh

USER debugger

RUN echo "plugin load /usr/local/lib/llnode/llnode.so" > ~/.lldbinit

CMD [ "./init.sh" ]
