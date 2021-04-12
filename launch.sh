#!/bin/sh
cd /www
bundle install
/usr/bin/rails s -b '0.0.0.0' -p 80