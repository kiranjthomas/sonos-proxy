import axios, { AxiosResponse, AxiosError } from "axios";
import VError from "verror";
import { resourceLimits } from "worker_threads";

const host = "api.ws.sonos.com";
const path = "control/api/v1";

interface SonosError extends Error {
  errorCode?: string;
  httpStatus?: number;
  itemId?: string;
  queueVersion?: string;
  reason?: string;
}

export async function playPauseSonos(
  token: string,
  room: string
): Promise<AxiosResponse | undefined> {
  const playPauseEndpoint = `groups/${room}/playback/togglePlayPause`;
  let result;

  try {
    result = await postAxios(
      `https://${host}/${path}/${playPauseEndpoint}`,
      token
    );
  } catch (err) {
    const cause = err as SonosError;
    throw new VError(
      { name: "togglePlayPauseError", cause },
      "Error toggling Sonos play"
    );
  }

  return result;
}

async function postAxios(
  url: string,
  token: string
): Promise<AxiosResponse | undefined> {
  let result;

  try {
    result = await axios(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    const cause = err as AxiosError;
    throw new VError(
      {
        name: "postAxiosError",
        cause,
        info: {
          status: cause?.response?.status,
          statusText: cause?.response?.statusText,
        },
      },
      "Error calling postAxios"
    );
  }

  return result;
}
