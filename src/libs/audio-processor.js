/**
 * @description webaudio 音频分析处理器
 * @author delbury
 * @version 1.0
 */

 export default class AudioProcessor {
  constructor(audio) {
    this.audio = audio;
    this.actx = new AudioContext();
    this.nodes = []
  }

  // 初始化
  init() {
  }

  // 创建源节点
  createSourceNode(audio) {
    this.nodes.push(this.actx.createMediaElementSource(audio));
  }

  // 创建分析节点

  // 节点连接

  // 关闭节点连接
 }