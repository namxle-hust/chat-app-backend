#!/bin/bash

while ! mysqladmin ping -h "${MYSQL_HOST}" -uroot --password="${MYSQL_ROOT_PASSWORD}" --silent; do
  >&2 echo "Mysql is unavailable - sleeping"
  sleep 1
done

>&2 echo "Mysql is up - executing command"

/bin/bash ./start.sh

