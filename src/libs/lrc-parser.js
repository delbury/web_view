const MATHCES = [
  {
    // 歌词时间轴
    key: 'timeAxis',
    reg: /^(?<times>\[.*:.*\])(?<lyric>.+)\s*$/,
    timeReg: /\[(.+?:.+?)\]/, // 时间正则
    lyricReg: '_%ot%_', // 原文译文分割字符串
  },
  {
    // 歌手
    key: 'artist',
    reg: /^\[ar:(?<content>.*)\]\s*$/
  },
  {
    // 歌名,
    key: 'title',
    reg: /^\[ti:(?<content>.*)\]\s*$/,
  },
  {
    // 专辑
    key: 'album',
    reg: /^\[al:(?<content>.*)\]\s*$/,
  },
  {
    // 编辑者
    key: 'by',
    reg: /^\[by:(?<content>.*)\]\s*$/,
  },
  {
    // 时间偏移
    key: 'offset',
    reg: /^\[offset:(?<content>.*)\]\s*$/,
  },
];

export default class LrcParser {
  constructor({ file = null, done = null } = {}) {
    this.file = file;
    this.done = done; // 解析完成回调
    this.result = null;
    this.currentLyricIndex = 0; // 当前的歌词index
    this.prevLyricIndex = -1; // 上一个歌词的index
    // this.readFile(file);
  }

  // 验证文件
  static validateFile(file) {
    if(!file || !(file instanceof Blob)) {
      throw new TypeError('error file type');
    }
  }

  // 读取文件
  readFile(file) {
    LrcParser.validateFile(file);

    const reader = new FileReader();
    reader.onload = ev => {
      this.parseLrcText(ev.target.result);
    };
    reader.readAsText(file);
  }

  /**
   * @description 解析lrc歌词文本
   * @param {*} text 待解析歌词文本
   * @param {*} isLyricMerge 是否合并歌词
   */
  parseLrcText(text, isLyricMerge = false) {
    const lines = text.split(/\r+\n+/).filter(line => !!line);
    const tempObj = {
      lyrics: []
    };
    let count = lines.length; // 统计行
    for(let line of lines) {
      // 逐行解析
      for(let conf of MATHCES) {
        // 匹配
        if(conf.reg.test(line)) {
          // 匹配成功
          const res = line.match(conf.reg);
          if(conf.key === 'timeAxis') {
            // 时间轴
            if(res.groups) {
              const lrcObj = {};
              // 歌词原文、译文分割
              const lrcArr = res.groups.lyric.split(conf.lyricReg);
              lrcObj.originalLyric = lrcArr[0].trim(); // 原文
              lrcObj.translationalLyric = (lrcArr[1] || '').trim(); // 译文

              // 时刻
              const timeArr = res.groups.times.split(conf.timeReg).filter(time => !!time);
              if(isLyricMerge) {
                // 合并相同的歌词
                tempObj.lyrics.push({
                  ...lrcObj,
                  times: timeArr.map(time => {
                    const arr = time.split(':');
                    return +arr[0] * 60 + +arr[1];
                  })
                });
              } else {
                // 拆分不同时刻相同的歌词
                for(let time of timeArr) {
                  const arr = time.split(':');
                  const sec = +arr[0] * 60 + +arr[1];
                  tempObj.lyrics.push({
                    ...lrcObj,
                    time: sec
                  })
                }
              }
            }

          } else {
            // 其他属性
            if(res.groups) {
              tempObj[conf.key] = res.groups.content || '';
            }
          }

          count--;
          break;
        }
      }
    }

    if(!isLyricMerge) {
      // 排序
      tempObj.lyrics.sort((a, b) => a.time - b.time);
    }
    console.log(count === 0 ? `已完成` : `未完成: ${count}`);

    this.result = tempObj;
    this.done && this.done(tempObj);
    this.currentLyricIndex = 0;
    this.prevLyricIndex = -1;
  }

  // 加载并解析远程文件
  async readRemoteFile(url) {
    try {
      const res = await fetch(url, {
        headers: {
          'accept': 'text/plain, */*'
        }
      });
      if(res.status >= 200 && res.status < 300) {
        const text = await res.text();
        this.parseLrcText(text);
        return this.result;
      } else {
        throw Error('http error: ' + res.status);
      }
    } catch(err) {
      console.log(err);
    }
  }

  // 获取当前时间的歌词
  lyricGenerator(sec) {
    if(!this.result) {
      return;
    }
    const time = (sec - +(this.result.offset || 0) / 1000);
    for(let i = 0, len = this.result.lyrics.length; i < len; i++) {
      if(i === 0 && time <= this.result.lyrics[i].time) {
        this.currentLyricIndex = 0;
        break;
      } else if(i === len - 1 && time >= this.result.lyrics[i].time) {
        this.currentLyricIndex = len - 1;
        break;
      } else if(time >= this.result.lyrics[i].time && time <= this.result.lyrics[i + 1].time) {
        if(Math.abs(time - this.result.lyrics[i].time) <= Math.abs(time - this.result.lyrics[i + 1].time)) {
          this.currentLyricIndex = i;
        } else {
          this.currentLyricIndex = i + 1;
        }
        break;
      }
    }
    if(this.currentLyricIndex !== this.prevLyricIndex) {
      this.prevLyricIndex = this.currentLyricIndex;

      // this.lyricFormatter();
      return {
        changed: true,
        index: this.currentLyricIndex
      };
    }
    return {
      changed: false,
      index: this.currentLyricIndex
    };
  }

  // 歌词格式化输出
  lyricFormatter() {
    console.log(
      this.currentLyricIndex,
      this.result.lyrics[this.currentLyricIndex].originalLyric,
      this.result.lyrics[this.currentLyricIndex].translationalLyric
    )
  }
}