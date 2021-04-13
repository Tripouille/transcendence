FROM alpine
RUN apk -U upgrade && apk add build-base ruby-full ruby-dev zlib-dev postgresql-dev nodejs yarn tzdata postgresql
RUN gem install pg rails
COPY launch.sh /