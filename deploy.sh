#!/bin/sh

# # install dependencies
# sudo npm i

# # create new build folder
# npm run build

# stop nginx  server
sudo systemctl stop nginx

# clear old assets
rm -rf /var/www/gene-density-map/

# copy new assets
cp -a src/. /var/www/gene-density-map/

# restart nginx server
sudo systemctl start nginx

echo "Deploy complete successfully"