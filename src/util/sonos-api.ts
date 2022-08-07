import axios, { AxiosResponse, AxiosError } from "axios";
import VError from "verror";

const host = "api.ws.sonos.com";
const path = "control/api/v1";

interface SonosError extends Error {
  errorCode?: string;
  httpStatus?: number;
  itemId?: string;
  queueVersion?: string;
  reason?: string;
}

interface PostData {
  playlistId?: string;
  playOnCompletion?: boolean;
  action?: string;
  volume?: string;
}

interface GroupData {
  groups: Group[];
  players: Player[];
  partial: boolean;
}
interface Group {
  id: string;
  name: string;
  coordinatorId: string;
  playbackState: string;
  playerIds: string[];
}

interface Player {
  id: string;
  name: string;
  websocketUrl: string;
  softwareVersion: string;
  apiVersion: string;
  minApiVersion: string;
  isUnregistered: boolean;
  capabilities: string[];
  deviceIds: string[];
}

export async function playPauseSonos(
  token: string,
  roomId: string
): Promise<AxiosResponse> {
  const playPauseEndpoint = `groups/${roomId}/playback/togglePlayPause`;
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
  roomId: string
): Promise<AxiosResponse> {
  const loadPlaylist = `groups/${roomId}/playlists`;
  let result;

  // Revi Button playlist is 4; I assume playListId is stable.
  const data = {
    playlistId: "4",
    playOnCompletion: true,
    action: "replace",
    playModes: { shuffle: true },
  };

  try {
    result = await postAxios(
      `https://${host}/${path}/${loadPlaylist}`,
      token,
      data
    );
  } catch (err) {
    const cause = err as SonosError;
    throw new VError({ name: "loadPlaylist", cause }, "Error loading playlist");
  }

  return result;
}

export async function loadFavorite(
  token: string,
  roomId: string,
  favoriteId: string
): Promise<AxiosResponse> {
  const loadFavorite = `groups/${roomId}/favorites`;
  let result;

  const data = {
    favoriteId,
    playOnCompletion: true,
    action: "replace",
  };

  try {
    result = await postAxios(
      `https://${host}/${path}/${loadFavorite}`,
      token,
      data
    );
  } catch (err) {
    const cause = err as SonosError;
    throw new VError({ name: "loadFavorite", cause }, "Error loading favorite");
  }

  return result;
}

export async function setVolume(
  token: string,
  roomId: string
): Promise<AxiosResponse> {
  const setVolume = `groups/${roomId}/groupVolume`;
  let result;

  const data = {
    volume: "20",
  };

  try {
    result = await postAxios(
      `https://${host}/${path}/${setVolume}`,
      token,
      data
    );
  } catch (err) {
    const cause = err as SonosError;
    throw new VError({ name: "setVolume", cause }, "Error setting volume");
  }

  return result;
}

async function postAxios(
  url: string,
  token: string,
  data?: PostData
): Promise<AxiosResponse> {
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

export async function getGroups(
  token: string,
  houseHoldsId: string
): Promise<AxiosResponse<GroupData>> {
  let result;

  try {
    result = await getAxios(
      `https://${host}/${path}/households/${houseHoldsId}/groups`,
      token
    );
  } catch (err) {
    const cause = err as SonosError;
    throw new VError({ name: "getGroupsError", cause }, "Error getting groups");
  }

  return result;
}

async function getAxios(url: string, token: string): Promise<AxiosResponse> {
  let result;

  try {
    result = await axios(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    const cause = err as AxiosError;
    throw new VError(
      {
        name: "getAxiosError",
        cause,
        info: {
          status: cause?.response?.status,
          statusText: cause?.response?.statusText,
        },
      },
      "Error calling getAxios"
    );
  }

  return result;
}
