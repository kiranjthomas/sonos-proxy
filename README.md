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

## Redis Commands for Important Keys

### Access / Refresh Tokens

```sh
dc exec redis redis-cli set accessToken "{\"access_token\": \"<insert-access-token>>\",\"token_type\": \"Bearer\",\"expires_in\": 86399,\"refresh_token\": \"<insert-refresh-token>>\",\"scope\": \"playback-control-all\"}"
```

### Household

<https://docs.sonos.com/docs/seg-households>

```sh
dc exec redis redis-cli set householdsId "{\"householdsId\": \"Sonos_ADGZIALs7FnNsIeY7mpcxKxkr9.spbf2NRpJyAR5FV2L4Dz\"}"
```
