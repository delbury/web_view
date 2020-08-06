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
    this.drawTypeMethodsMap = {
      'time': this.drawTimeWaveFigure.bind(this),
      'freq': this.drawFreqWaveFigure.bind(this),
      'freq-histogram': this.drawFreqHistogramFigure.bind(this),
    };
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
   * @param {Object} params 参数：columns：20, 直方图的柱状数量
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
    
    // 其他参数
    if(type === 'freq-histogram') {
      const columns = +this.drawParams.columns || 20; // 柱子数量
      const gapScale = 0.2; // 柱状图间隔，相对于柱子的宽度
      const width = this.canvas.width / (columns + (columns - 1) * gapScale);

      const columnRows = +this.drawParams.columnRows || 20;
      const columnRowsGapScale = 0.3; // 柱虚线的间隔。相对于每行虚线的高度
      const height = this.canvas.height / (columnRows + (columnRows - 1) * columnRowsGapScale);

      // const fillStyle = this.ctx.createRadialGradient(
      //   0, this.canvas.height, 0,
      //   0, this.canvas.height, Math.sqrt(this.canvas.height ** 2 + this.canvas.width ** 2)
      // );
      const fillStyle = this.ctx.createLinearGradient(0, this.canvas.height, 0, 0);
      fillStyle.addColorStop(0, '#10239e');
      fillStyle.addColorStop(1, '#597ef7');

      this.drawParams.freqHistogram = {
        // 柱图形参数
        columns,
        columnsScaleFactor: Math.pow(22050, 1 / columns),
        columnsGap: width * gapScale,
        columnsWidth: width,

        // 柱图形虚线参数
        columnRows,
        columnRowsGap: columnRowsGapScale * height,
        columnRowsHeight: height,
        columnRowsDiv: 1 / columnRows, // 每行所占百分比

        fillStyle,
      };
    }
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
  drawTimeWaveFigure(buffer) {
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
  drawFreqWaveFigure(buffer) {
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

  // 频域柱状图
  drawFreqHistogramFigure(buffer) {
    const {
      columns,
      columnsScaleFactor: factor,
      columnsGap: gap,
      columnsWidth: width,
      columnRowsHeight: height,
      columnRowsDiv,
      dbMin,
      dbRange,
      columnRowsGap,
      fillStyle,
    } = this.drawParams.freqHistogram;
    let index = 0;
    let count = 0;
    const len = buffer.length;

    this.ctx.save();
    this.ctx.fillStyle = fillStyle;
    while(index <= len) {
      this.ctx.beginPath();

      const offsetX = count * (width + gap);
      let offsetYCount = 0;
      if(this.drawDataBit === 8) {
        offsetYCount =  Math.ceil(buffer[index] / 255 / columnRowsDiv) ;

      } else if(this.drawDataBit === 32) {
        offsetYCount = Math.ceil((buffer[index] - dbMin) / dbRange / columnRowsDiv);
      }
      
      for(let i = 0; i < offsetYCount; i++) {
        this.ctx.fillRect(
          offsetX,
          this.canvas.height - ((i + 1) * height + i * columnRowsGap),
          width,
          height,
        );
      }
      /** 实时频率直方图
        this.ctx.moveTo(offsetX, this.canvas.height);
        this.ctx.lineTo(offsetX + width, this.canvas.height);
        if(this.drawDataBit === 8) {
          const offsetY = (255 - buffer[index]) * this.drawParams.yDiv;
          this.ctx.lineTo(offsetX + width, offsetY);
          this.ctx.lineTo(offsetX, offsetY);

        } else if (this.drawDataBit === 32) {
          const offsetY = (1 - (buffer[index] - this.drawParams.dbMin) / this.drawParams.dbRange) * this.canvas.height;
          this.ctx.lineTo(offsetX + width, offsetY);
          this.ctx.lineTo(offsetX, offsetY);
        }
        this.ctx.closePath();
        this.ctx.fill();
       */

      count++;
      index = Math.round(Math.pow(factor, count));
    }
    this.ctx.restore();
  }

  // 每一帧
  tick() {
    if (this.drawing) {
      // drawing code
      const buffer = this.arraybufferCallback();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const drawFn = this.drawTypeMethodsMap[this.drawType];
      if (drawFn) {
        drawFn(buffer);
      }

      this.aniReq = requestAnimationFrame(this.tick.bind(this));
    } else {
      this.stopDrawing();
    }
  }
}
