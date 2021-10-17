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

interface Data {
  playlistId?: string;
  playOnCompletion?: boolean;
  action?: string;
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

export async function loadPlaylist(
  token: string,
  room: string
): Promise<AxiosResponse | undefined> {
  const loadPlaylist = `groups/${room}/playlists`;
  let result;

  const data = {
    playlistId: "4",
    playOnCompletion: true,
    action: "replace",
  };

  try {
    result = await postAxios(
      `https://${host}/${path}/${loadPlaylist}`,
      token,
      data
    );
  } catch (err) {
    const cause = err as SonosError;
    throw new VError(
      { name: "loadPlaylist", cause },
      "Error loading playlist Sonos play"
    );
  }

  return result;
}

async function postAxios(
  url: string,
  token: string,
  data?: Data
): Promise<AxiosResponse | undefined> {
  let result;

  try {
    result = await axios(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data,
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
