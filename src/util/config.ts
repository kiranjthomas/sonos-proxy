import config from "config";

interface ConfigInterface {
  sonos: {
    id: string;
    secret: string;
    livingRoomGroupId: string;
    play3GroupId: string;
  };
  auth: {
    tokenHost: string;
    tokenPath: string;
    authorizePath: string;
  };
}

class Config {
  public readonly config: ConfigInterface = {
    sonos: {
      id: config.get("sonos.clientId"),
      secret: config.get("sonos.clientSecret"),
      livingRoomGroupId: config.get("sonos.livingRoomGroupId"),
      play3GroupId: config.get("sonos.play3GroupId"),
    },
    auth: {
      tokenHost: config.get("auth.tokenHost"),
      tokenPath: config.get("auth.tokenPath"),
      authorizePath: config.get("auth.authorizePath"),
    },
  };
  static instance: Config;

  constructor() {
    if (Config.instance === null) {
      this.config = {
        sonos: {
          id: config.get("sonos.clientId"),
          secret: config.get("sonos.clientSecret"),
          livingRoomGroupId: config.get("sonos.livingRoomGroupId"),
          play3GroupId: config.get("sonos.play3GroupId"),
        },
        auth: {
          tokenHost: config.get("auth.tokenHost"),
          tokenPath: config.get("auth.tokenPath"),
          authorizePath: config.get("auth.authorizePath"),
        },
      };
      Config.instance = this;
    }
    return Config.instance;
  }
}

const appConfig = new Config();
Object.freeze(appConfig);

export default appConfig.config;
