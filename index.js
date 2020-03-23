const fs = require("fs");
const { spawnSync } = require("child_process");
const { join } = require("path");
const flattenDeep = require("lodash/flattenDeep");

const VIDEO_EXTENSIONS = [".mp4", ".mkv", ".avi"];

const join2 = (path1, path2) => (path1 ? join(path1, path2) : path2);

const removeExtension = filename => filename.replace(/\.(\w|\d)+$/);

const isVideo = filename =>
  VIDEO_EXTENSIONS.some(extension => filename.endsWith(extension));

const isDirectory = dirname => fs.statSync(dirname).isDirectory();

const getAllVideos = startDirname => {
  if (isDirectory(startDirname)) {
    const filelist = fs.readdirSync(startDirname);

    return flattenDeep(
      filelist
        .map(fileOrDir => {
          const newFileOrDir = join2(startDirname, fileOrDir);
          if (isDirectory(newFileOrDir)) {
            return getAllVideos(newFileOrDir);
          }

          return isVideo(newFileOrDir) ? newFileOrDir : null;
        })
        .filter(a => a)
    );
  }

  return [startDirname].filter(isVideo);
};

const getUnconvertedVideos = startDirname => {
  const videos = getAllVideos(startDirname);
  const convertedVideoNames = videos
    .filter(v => v.endsWith(".cc.mp4"))
    .map(v => v.replace(/\.cc\.mp4$/, ""));
  return videos.filter(
    video => !convertedVideoNames.includes(removeExtension(video))
  );
};

// console.log(spawnSync("ls", ["-l"]));

console.log(JSON.stringify(getUnconvertedVideos("/home/nickng/gits/encode-for-chromecast/")));
