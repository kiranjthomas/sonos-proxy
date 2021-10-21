import { AuthorizationCode } from "simple-oauth2";

import appConfig from "../util/config";

const oauthConfig = {
  client: { id: appConfig.sonos.id, secret: appConfig.sonos.secret },
  auth: appConfig.auth,
};

class OauthClient {
  public readonly client: AuthorizationCode = new AuthorizationCode(
    oauthConfig
  );
  static instance: OauthClient;

  constructor() {
    if (OauthClient.instance === null) {
      OauthClient.instance = this;
    }
    return OauthClient.instance;
  }
}

const oauthClient = new OauthClient();
Object.freeze(oauthClient);

export default oauthClient.client;
