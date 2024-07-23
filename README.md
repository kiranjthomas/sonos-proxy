# Sonos Proxy

A service for interacting with the [Sonos API] to playback content with a Sonos speaker.

## Sonos API

Sonos allows users to play music on a Sonos speaker using the [Control API]. You must pass an access token in the authorization header with any request.

### Prerequisites

- The Sonos API requires that you register a developer integration to work.

### Authorization [WIP]

Sonos leverages three legged oauth to [authorize] requests.

### Development Environment

Requirements:

- Node.js >= 12
- Docker

[sonos api]: https://developer.sonos.com/reference/
[authorize]: https://developer.sonos.com/build/direct-control/authorize/
[control api]: https://developer.sonos.com/reference/control-api/

## Docker

My [Raspberry Pi](https://www.raspberrypi.com/products/raspberry-pi-3-model-b/) is unable to build the necessary image from the [Dockerfile](./Dockerfile) due to hardware constraints.

At the moment, my workaround is to

1. build the image with the platform argument on a system that is capable

    ```sh
    # To avoid platform mismatch issues, I build the image using the following command
    docker build \
    -t letmeupgradeya/sonos-proxy:server \
    --platform linux/arm/v7 \
    .
    ```

1. login to dockerhub via `docker login`
1. push the image to dockerhub
1. pull the image from Raspberry PI

## Redis Commands for Important Keys

### Set Access / Refresh Tokens

```sh
dc \
exec \
redis \
redis-cli \
set \
accessToken \
"{\"access_token\": \"<insert-access-token>>\",\"token_type\": \"Bearer\",\"expires_in\": 86399,\"refresh_token\": \"<insert-refresh-token>>\",\"scope\": \"playback-control-all\",\"expires_at\":\"2024-04-20T21:46:56.154Z\"}"
```

### Household

<https://docs.sonos.com/docs/seg-households>

```sh
dc \
exec \
redis \
redis-cli \
set \
householdsId \
"{\"householdsId\": \"<insert-house-hold-id>\"}"
```
