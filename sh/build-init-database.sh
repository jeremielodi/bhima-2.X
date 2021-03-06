#!/bin/bash

# bash script mode
set -uo pipefail

# This script is for building the initial database of bhima application
# this database is supposed to be the starting point of any bhima installation

echo "[ build ] Building BHIMA Database"

set -a
source .env.development
set +a

# set build timeout
TIMEOUT=${BUILD_TIMEOUT:-8}

# build the initial database
mysql -u $DB_USER -p$DB_PASS -e "DROP DATABASE IF EXISTS $DB_NAME ;" &> /dev/null
mysql -u $DB_USER -p$DB_PASS -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8 COLLATE utf8_unicode_ci;" &> /dev/null

echo "[ build ] database schema"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/schema.sql &> /dev/null

echo "[ build ] triggers"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/triggers.sql &> /dev/null

echo "[ build ] functions"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/functions.sql &> /dev/null

echo "[ build ] procedures"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/procedures.sql &> /dev/null
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/admin.sql &> /dev/null

echo "[ build ] default data"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/icd10.sql &> /dev/null
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/bhima.sql &> /dev/null

echo "[ /build ]"
