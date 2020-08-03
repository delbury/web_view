/**
 * @description audio音频可视化canvas画布
 * @author delbury
 * @version 1.0
 */

export default class AudioVisualization {
  constructor(canvas, ctxOptions) {
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw TypeError('not canvas element');
    }

    this.drawing = false; // 是否绘制中
    this.drawType = 'time'; // 绘图类型： time | freq
    this.drawDataBit = 8; // 绘图数据位数： 8 | 32
    this.aniReq = null; // 动画帧标识

    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.arraybufferCallback = null; // 获取arraybuffer数据的回调
    this.init(ctxOptions);
  }

  // 初始化
  init(options = {}) {
    for (let key in options) {
      this.ctx[key] = options[key];
    }
  }

  /**
   * 设置绘图类型
   * @param {String} type time | freq
   * @param {Function} getter 获取数据回调
   * @param {Number} bit 数据位数
   * @param {Object} params 参数
   */
  setDrawType({ type, getter, bit = 8, params = {} }) {
    this.drawType = type;
    this.drawDataBit = bit;
    this.arraybufferCallback = getter;
    this.drawParams = {
      ...params,
      xDiv: this.canvas.width / params.frequencyBinCount,
      yDiv: this.canvas.height / 255
    };
  }

  // 设置宽高
  setCanvasSize(w, h) {
    this.canvas.width = w;
    this.canvas.height = h;
  }

  // 开始绘制
  startDrawing() {
    this.stopDrawing();
    this.drawing = true;
    this.tick();
  }

  // 结束绘制
  stopDrawing() {
    this.drawing = false;
    if (this.aniReq) {
      cancelAnimationFrame(this.aniReq);
      this.aniReq = null;
    }
  }

  // 绘制时域波形
  drawTime(buffer) {
    this.ctx.save();
    this.ctx.beginPath();

    for (let i = 0, len = buffer.length; i < len; i++) {
      const x = this.drawParams.xDiv * i;
      const y = (() => {
        if (this.drawDataBit === 8) {
          return (255 - buffer[i]) * this.drawParams.yDiv;
        } else if (this.drawDataBit === 32) {
          return (buffer[i] + 1) * this.canvas.height / 2;
        }
      })();
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.stroke();
    this.ctx.restore();
  }

  // 绘制频域波形
  drawFreq(buffer) {
    this.ctx.save();
    this.ctx.beginPath();

    for (let i = 0, len = buffer.length; i < len; i++) {
      const x = this.drawParams.xDiv * i;
      const y = (() => {
        if (this.drawDataBit === 8) {
          return (255 - buffer[i]) * this.drawParams.yDiv;
        } else if (this.drawDataBit === 32) {
          return (1 - (buffer[i] - this.drawParams.dbMin) / this.drawParams.dbRange) * this.canvas.height;
        }
      })();
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.stroke();
    this.ctx.restore();
  }

  // 每一帧
  tick() {
    if (this.drawing) {
      // drawing code
      const buffer = this.arraybufferCallback();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      if (this.drawType === 'time') {
        this.drawTime(buffer);
      } else if (this.drawType === 'freq') {
        this.drawFreq(buffer);
      }

      this.aniReq = requestAnimationFrame(this.tick.bind(this));
    } else {
      this.stopDrawing();
    }
  }
}