const MATHCES = [
  {
    // 歌词时间轴
    key: 'timeAxis',
    reg: /^(?<time>\[.*:.*\])(?<lyric>.+)\s*$/,
    oTseparator: '_%ot%_' // 原文译文分割字符串
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
  constructor(file) {
    if(!file || !(file instanceof Blob)) {
      throw new TypeError('error file type')
    }

    this.file = file;
    this.readFile(file);
  }

  // 读取文件
  readFile(file) {
    const reader = new FileReader();
    reader.onload = ev => {
      this.parseLrcText(ev.target.result)
    };
    reader.readAsText(file);
  }

  // 解析歌词文件
  parseLrcText(text) {
    const lines = text.split(/\r+\n+/);
    const tempObj = {
      lyric: []
    };
    for(let line of lines) {
      // 逐行解析
      for(let conf of MATHCES) {
        // 匹配
        console.log(conf.reg, line, conf.reg.test(line))
        if(conf.reg.test(line)) {
          // 匹配成功
          const res = line.match(conf.reg);
          if(conf.key === 'timeAxis') {
            // 时间轴
            if(res.groups) {
              //
              // console.log(res.groups)
            }

          } else {
            // 其他属性
            if(res.groups) {
              tempObj[conf.key] = res.groups.content || ''
            }
          }

          break;
        }
      }
    }

    console.log(tempObj)
  }
}