import crypto from "crypto";
import { IncomingHttpHeaders } from "http";

import appConfig from "./config";

// https://docs.sonos.com/docs/subscribe#verify-x-sonos-event-signature
export function isEventAuthentic(headers: IncomingHttpHeaders) {
  const concatenatedString = [
    headers["x-sonos-event-seq-id"],
    headers["x-sonos-namespace"],
    headers["x-sonos-type"],
    headers["x-sonos-target-type"],
    headers["x-sonos-target-value"],
    appConfig.sonos.id,
    appConfig.sonos.secret,
  ].join("");

  // Create SHA-256 hash of the concatenated string
  const hash = crypto
    .createHash("sha256")
    .update(concatenatedString, "utf8")
    .digest();

  const base64UrlSafe = hash
    .toString("base64")
    .replace(/\+/g, "-") // Replace '+' with '-'
    .replace(/\//g, "_") // Replace '/' with '_'
    .replace(/=+$/, ""); // Remove any trailing '='

  return base64UrlSafe === headers["x-sonos-event-signature"];
}
