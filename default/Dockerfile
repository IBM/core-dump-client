FROM debian:buster-20210816

RUN apt-get update

RUN apt-get install -y lsb-release software-properties-common vim wget gnupg2 unzip

RUN wget https://apt.llvm.org/llvm.sh

RUN chmod +x llvm.sh

RUN ./llvm.sh 9

ENV PATH="/usr/lib/llvm-9/bin:${PATH}"

WORKDIR /usr/bin

RUN wget https://dl.min.io/client/mc/release/linux-amd64/mc

RUN chmod +x mc

RUN useradd -m debugger

WORKDIR /debug 
RUN chown -R debugger:debugger /debug
RUN chmod 755 /debug

COPY --chown=debugger:debugger init.sh init.sh

RUN chmod +x init.sh

USER debugger

CMD [ "./init.sh" ]
