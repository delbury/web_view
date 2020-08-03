/**
 * @description webaudio 音频分析处理器
 * @author delbury
 * @version 1.0
 */

export default class AudioProcessor {
  constructor(audio, options) {
    this.audio = audio;
    this.playing = !audio.paused;
    this.actx = new AudioContext();
    this.nodes = [];

    this.init(options);
  }

  // 初始化
  init(options = {}) {
    this.bindAudioEvents();
    this.createSourceNode(this.audio);
    this.createAnalyserNode(options.analyser);
    this.connectNodes(this.nodes);
  }

  // 绑定audio事件
  bindAudioEvents() {
    this._eventAudioPlay = ev => {
      this.playing = true;
    };
    this._eventAudioPause = ev => {
      this.playing = false;
    };

    this.audio.addEventListener('play', this._eventAudioPlay);
    this.audio.addEventListener('pasue', this._eventAudioPause);
  }

  // 解绑audio事件
  unbindAudioEvents() {
    this.audio.removeEventListener('play', this._eventAudioPlay);
    this.audio.removeEventListener('pasue', this._eventAudioPause);
  }

  // 创建源节点
  createSourceNode(audio) {
    this.nodes.push(this.actx.createMediaElementSource(audio));
  }

  // 播放
  play() {
    this.audio.play();
  }

  // 暂停
  pause() {
    this.audio.pause();
  }

  // 创建分析节点
  createAnalyserNode({
    fftSize = 2048,
    maxDecibels = -30,
    minDecibels = -100,
    smoothingTimeConstant = 0.8,
  } = {}) {
    const analyser = this.actx.createAnalyser({
      fftSize,
      maxDecibels,
      minDecibels,
      smoothingTimeConstant,
    });

    const fbc = analyser.frequencyBinCount;
    this._analyserNode = analyser;
    this._analyserDataArrayFloat32 = new Float32Array(fbc);
    this._analyserDataArrayUnit8 = new Uint8Array(fbc);

    this.nodes.push(analyser);
  }

  /**
   * 获取获取数据的方法
   * @param {String} type time | freq // 时域 | 频域
   * @param {Number} bit 8 | 32 // 位数
   */
  getAnalyserDataHandler(type, bit = 8) {
    if ((type !== 'time' && type !== 'freq') || (bit !== 8 && bit !== 32)) {
      throw TypeError('params type error')
    }

    const typeFlag = type === 'time' ? 0b10 : 0b00;
    const bitFlag = bit === 8 ? 0b01 : 0b00;
    const flag = typeFlag | bitFlag;
    switch (flag) {
      // 时域8位
      // 时域数据：x[k] = b[k] / 128 - 1
      case 0b11:
        return {
          handler: () => {
            this._analyserNode.getByteTimeDomainData(this._analyserDataArrayUnit8);
            return this._analyserDataArrayUnit8;
          },
          params: {
            frequencyBinCount: this._analyserNode.frequencyBinCount
          }
        };

      // 时域32位
      case 0b10:
        return {
          handler: () => {
            this._analyserNode.getFloatTimeDomainData(this._analyserDataArrayFloat32);
            return this._analyserDataArrayFloat32;
          },
          params: {
            frequencyBinCount: this._analyserNode.frequencyBinCount
          }
        };

      // 频域8位
      case 0b01:
        return {
          handler: () => {
            this._analyserNode.getByteFrequencyData(this._analyserDataArrayUnit8);
            return this._analyserDataArrayUnit8;
          },
          params: {
            freqMin: 0,
            freqMax: 22050,
            dbMin: this._analyserNode.minDecibels,
            dbMax: this._analyserNode.maxDecibels,
            dbRange: this._analyserNode.maxDecibels - this._analyserNode.minDecibels,
            frequencyBinCount: this._analyserNode.frequencyBinCount
          }
        };

      // 频域32位
      case 0b00:
        return {
          handler: () => {
            this._analyserNode.getFloatFrequencyData(this._analyserDataArrayFloat32);

            return this._analyserDataArrayFloat32;
          },
          params: {
            freqMin: 0,
            freqMax: 22050,
            dbMin: this._analyserNode.minDecibels,
            dbMax: this._analyserNode.maxDecibels,
            dbRange: this._analyserNode.maxDecibels - this._analyserNode.minDecibels,
            frequencyBinCount: this._analyserNode.frequencyBinCount
          }
        };

      default:
        return null;
    }
  }

  // 节点连接
  connectNodes(nodes) {
    let np = null;
    for (let node of nodes) {
      if (!np) {
        np = node;
      } else {
        np = np.connect(node);
      }
    }
    np.connect(this.actx.destination);
  }

  // 关闭节点连接
}