# node-redis
Run action


#update read me with  # node-redis

## Run action

### How to Run Redis Stack in Standalone Docker

To run the Redis stack using Docker, use the following command:

```sh
docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```
For more information, refer to the Redis Quick Start Guide.

You can access the Redis stack browser at: http://localhost:8001/redis-stack/browser

How to Access the Application
The application runs on port 8080 by default.
To access the application, navigate to http://localhost:8080 in your web browser.
To fetch GitHub repository data for a user, use the endpoint http://localhost:8080/repos/:username.
How to Push Docker Images
Build the Docker image:

Log in to Docker Hub:

Tag the Docker image:

Push the Docker image to Docker Hub:

Replace your-dockerhub-username with your actual Docker Hub username.

Environment Variables
ADD_HOSTNAME: Set to true to include the hostname in the response.
PORT: The port on which the application runs (default is 8080).
REDIS_SERVER: The Redis server address (default is 127.0.0.1).
REDIS_PORT: The Redis server port (default is 6379).
Example Commands
Set environment variables and run the application:

docker run -d --name node-redis \
  -e ADD_HOSTNAME=true \
  -e PORT=8080 \
  -e REDIS_SERVER=127.0.0.1 \
  -e REDIS_PORT=6379 \
  -p 8080:8080 \
  romitsutariya/node_redis:master-6704f97


To create a Docker network and join both the Redis stack container and your node-redis container to the same network, you can follow these steps:

1.Create a Docker network:
```sh
docker network create node-redis-nw
```

Run Redis
```sh
docker run -d --name redis-stack --network node-redis-nw -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

```sh
docker run -d --name node-redis --network node-redis-nw \
  -e ADD_HOSTNAME=true \
  -e PORT=8080 \
  -e REDIS_SERVER=redis-stack \
  -e REDIS_PORT=6379 \
  -p 8080:8080 \
  romitsutariya/node_redis:master-6704f97
```