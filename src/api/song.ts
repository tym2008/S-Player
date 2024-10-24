import { songLevelData } from "@/utils/meta";
import request from "@/utils/request";
import { encryptQuery } from "./kwDES";
import { SongUrlResult } from "./unblock";
import axios from "axios";

// 获取歌曲详情
export const songDetail = (ids: number | number[]) => {
  return request({
    url: "/song/detail",
    method: "post",
    params: { timestamp: Date.now() },
    data: { ids: Array.isArray(ids) ? ids.join(",") : ids.toString() },
  });
};

/**
 * 歌曲音质详情
 * @param id 歌曲 id
 */
export const songQuality = (id: number) => {
  return request({
    url: "/song/music/detail",
    params: { id },
  });
};

// 获取歌曲 URL
export const songUrl = (
  id: number,
  level:
    | "standard"
    | "higher"
    | "exhigh"
    | "lossless"
    | "hires"
    | "jyeffect"
    | "sky"
    | "jymaster" = "exhigh",
) => {
  return request({
    url: "/song/url/v1",
    params: {
      id,
      level,
      timestamp: Date.now(),
    },
  });
};

// 获取解锁歌曲 URL
export const unlockSongUrl = async (
  id: number,
  keyword: string,
  server: "netease" | "kuwo"
): Promise<any> => {
  // 创建错误响应对象
  const createErrorResponse = () => {
    return {
      size: 0,
      br: 320.001,
      url: "",
    };
  };

  if (server === "netease") {
    try {
      const response = await axios.get(
        `https://gd-api.tym.us.kg/api.php?types=url&source=netease&id=${id}&br=128`
      );
      const songUrl = response.data?.url;
      if (songUrl) {
        return songUrl;
      } else {
        console.error("Netease API Error: Song URL not found.");
        return createErrorResponse();
      }
    } catch (error) {
      console.error("Netease API Error:", error);
      return createErrorResponse();
    }
  } else if (server === "kuwo") {
    try {
      const songId = await getKuwoSongId(keyword);
      if (!songId) {
        return createErrorResponse();
      }
      const songUrl = await getKuwoSongUrl(songId);
      if (songUrl) {
        return songUrl;
      } else {
        console.error("Kuwo API Error: Song URL not found.");
        return createErrorResponse();
      }
    } catch (error) {
      console.error("Kuwo API Error:", error);
      return createErrorResponse();
    }
  } else {
    return createErrorResponse();
  }
};

const getKuwoSongId = async (keyword: string): Promise<string | null> => {
  const response = await axios.get(
    `https://kw-api.tym.us.kg/r.s?all=${keyword}&rformat=json&encoding=utf8&show_copyright_off=1&mobi=1&correct=1&searchapi=6`
  );
  return (
    response.data?.content?.[1]?.musicpage?.abslist?.[0]?.MUSICRID?.slice(
      "MUSIC_".length
    ) || null
  );
};
const getKuwoSongUrl = async (keyword: string): Promise<SongUrlResult> => {
  try {
    if (!keyword) return { code: 404, url: null };
    const songId = await getKuwoSongId(keyword);
    if (!songId) return { code: 404, url: null };

    // 请求地址
    const PackageName = "kwplayer_ar_5.1.0.0_B_jiakong_vh.apk";
    const query = `corp=kuwo&source=${PackageName}&p2p=1&type=convert_url2&sig=0&format=mp3&rid=${songId}`;
    const encryptedQuery = encryptQuery(query);

    const url = `http://mobi.kuwo.cn/mobi.s?f=kuwo&q=${encryptedQuery}`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "okhttp/3.10.0",
      },
    });

    if (response.data) {
      const urlMatch = response.data.match(/http[^\s$"]+/)[0];
      console.log(" KuwoSong URL:", urlMatch);
      return { code: 200, url: urlMatch };
    }

    return { code: 404, url: null };
  } catch (error) {
    console.error(" Get KuwoSong URL Error:", error);
    return { code: 404, url: null };
  }
};

// 获取歌曲歌词
export const songLyric = (id: number) => {
  return request({
    url: "/lyric/new",
    params: {
      id,
    },
  });
};

/**
 * 获取歌曲下载链接
 * @param id 音乐 id
 * @param level 播放音质等级, 分为 standard => 标准,higher => 较高, exhigh=>极高, lossless=>无损, hires=>Hi-Res, jyeffect => 高清环绕声, sky => 沉浸环绕声, `dolby` => `杜比全景声`, jymaster => 超清母带
 * @returns
 */
export const songDownloadUrl = (id: number, level: keyof typeof songLevelData = "h") => {
  // 获取对应音质
  const levelName = songLevelData[level].level;
  return request({
    url: "/song/download/url/v1",
    params: { id, level: levelName, timestamp: Date.now() },
  });
};

// 喜欢歌曲
export const likeSong = (id: number, like: boolean = true) => {
  return request({
    url: "/like",
    params: { id, like, timestamp: Date.now() },
  });
};

/**
 * 本地歌曲文件匹配
 * @param {string} title - 文件的标题信息，是文件属性里的标题属性，并非文件名
 * @param {string} album - 文件的专辑信息
 * @param {string} artist - 文件的艺术家信息
 * @param {number} duration - 文件的时长，单位为秒
 * @param {string} md5 - 文件的 md5
 */

export const matchSong = (
  title: string,
  artist: string,
  album: string,
  duration: number,
  md5: string,
) => {
  return request({
    url: "/search/match",
    params: { title, artist, album, duration, md5 },
  });
};

/**
 * 歌曲动态封面
 * @param {number} id - 歌曲 id
 */

export const songDynamicCover = (id: number) => {
  return request({
    url: "/song/dynamic/cover",
    params: { id },
  });
};
