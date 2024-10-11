#! /bin/bash

docker build -f deploy.Dockerfile -t sepomex:latest . && docker run -d --name sepomex -p 8081:80 sepomex:latest