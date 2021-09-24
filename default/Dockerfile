FROM registry.access.redhat.com/ubi8/ubi

RUN yum install -y --disableplugin=subscription-manager vim wget llvm-toolset xz git llvm-devel python39 make unzip

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
RUN chmod +x rundebug.sh

USER debugger

CMD [ "./init.sh" ]