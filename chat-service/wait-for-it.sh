#!/bin/bash

while ! mysqladmin ping -h  "${MYSQL_HOST}" -uroot --password="${MYSQL_ROOT_PASSWORD}" --silent; do
  >&2 echo "Mysql is unavailable - sleeping"
  sleep 1
done

>&2 echo "Mysql is up - executing command"

RMQ_HOST=$(echo ${RABBIT_MQ_ADDR} | cut -d ":" -f1)
RMQ_PORT=$(echo ${RABBIT_MQ_ADDR} | cut -d ":" -f2)

cmd="/bin/wait-for-it.sh -h $RMQ_HOST -p $RMQ_PORT --timeout=30 -s -- /bin/bash start.sh"

exec $cmd

