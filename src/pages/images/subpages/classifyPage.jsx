import React, { Component } from 'react';
import { Flex, Accordion, List, WhiteSpace } from 'antd-mobile';
import { Icon } from 'antd';
import { connect } from 'react-redux';
import './style.scss';
import { setSelectedImagesFolder } from '../../../store/action';
import Video from '../components/video';
import Audio from '../components/audio';

const AccordionPanel = Accordion.Panel;
const ListItem = List.Item;


class ComputedAccordion extends Component {
  constructor() {
    super();
    this.state = {
      hasVideoOpened: false,
      videos: [],
      hasAudioOpened: false,
      audios: [],
      showVideo: false,
      video: null,
      showAudio: false,
      audio: null
    };
  }

  // 计算size字符串
  sizeFormatter(size) {
    const kb = size / (2 ** 10);
    const mb = size / (2 ** 20);
    const gb = size / (2 ** 30);
    let text = '';
    if(gb >= 1) {
      text = gb.toFixed(2) + 'GB';
    } else if(mb >= 1) {
      text = mb.toFixed(2) + 'MB';
    } else if(kb >= 1) {
      text = kb.toFixed(2) + 'KB';
    } else {
      text = size + 'B';
    }
    return text;
  }

  render() {
    const props = this.props;
    const treeNode = props.treeNode || [];
    const str = Array(props.level).fill('-').join('') + ' ';
    const paddingDiv = 10;
    const k = props.level >= 1 ? 1 : 0;
    const gapValue = k * paddingDiv + 'px';
    const style = { paddingLeft: gapValue };
    const listStyle = { paddingLeft: '10px' };

    return (
      <Accordion accordion style={style}>
        {
          treeNode.map(item => {
            const images = [];
            const videos = []; 
            const audios = [];
            let imagesSize = 0;
            item.files.forEach(it => {
              if(it.type === 'image') {
                imagesSize += +it.size;
                images.push(it)
              } else if(it.type === 'video') {
                videos.push(it)
              } else if(it.type === 'audio') {
                audios.push(it)
              }
            });
            const imagesLen = images.length;
            const videosLen = videos.length;
            const audiosLen = audios.length;
            const isEmpty = !item.files.length && !item.children.length; // 过滤空文件夹
            
            let currentItem = item; // 子文件夹
            let dirname = '/' + item.dirname;

            const textArr = [];
            textArr[0] = imagesLen ? `images: ${imagesLen}` : '';
            textArr[1] = videosLen ? `videos: ${videosLen}` : '';
            textArr[2] = audiosLen ? `audios: ${audiosLen}` : '';
            textArr[3] = currentItem.children.length ? `dirs: ${currentItem.children.length}` : '';
            const subTitle = textArr.filter(item => item).join(', ');
            return (
              !isEmpty ? <AccordionPanel
                header={
                  <div className="accordion-dirlist-header">
                    <div className="accordion-dirlist-header-title">
                      <span>{str + dirname}</span>
                    </div>
                    <div className="accordion-dirlist-header-sub">{subTitle}</div>
                  </div>
                }
                key={item.id}
                className="accordion-dirlist"
              >
                <List style={listStyle}>
                  {
                    imagesLen ?
                    (
                      <ListItem
                        className={imagesLen ? 'images' : 'empty'}
                        onClick={() => props.onClickImages(item)}                    
                      >
                        {/* {`${str}Images: ${imagesLen}`} */}
                        <div className="accordion-dirlist-header">
                          <div className="accordion-dirlist-header-title">
                            <span>{`${str}Images: ${imagesLen}`}</span>
                          </div>
                          <div className="accordion-dirlist-header-sub">
                            {`size: ${this.sizeFormatter(imagesSize)}`}
                          </div>
                        </div>
                      </ListItem>
                    ) : ''
                  }
                  {
                    audiosLen ?
                    (
                      <Accordion accordion onChange={ev => {
                        if(ev === undefined) {
                          this.setState({ hasAudioOpened: false });
                          window.setTimeout(() => {
                            this.setState({ audios: [] });
                          }, 220);
                        } else {
                          this.setState({ hasAudioOpened: true, audios });
                        }
                      }}>
                        <AccordionPanel
                          header={`${str}Audios: ${audiosLen}`}
                          className="accordion-audiolist"
                        >
                          {
                            <List style={listStyle}>
                              {
                                this.state.audios.map((item, index) => (
                                  <ListItem
                                    className="audio-item"
                                    key={index}
                                    onClick={() => props.onClickAudios(item)}
                                  >
                                    <div className="audio-item-info">
                                      <div className="accordion-dirlist-header">
                                        <div className="accordion-dirlist-header-title">
                                          <span>{item.alt}</span>
                                        </div>
                                        <div className="accordion-dirlist-header-sub">
                                          {`size: ${this.sizeFormatter(item.size)}`}
                                        </div>
                                      </div>
                                      <Icon type="play-circle" />
                                    </div>
                                  </ListItem>
                                ))
                              }
                            </List>
                          }
                        </AccordionPanel>
                      </Accordion>
                    ) : ''
                  }
                  {
                    videosLen ?
                    (
                      <Accordion accordion onChange={ev => {
                        if(ev === undefined) {
                          this.setState({ hasVideoOpened: false });
                          window.setTimeout(() => {
                            this.setState({ videos: [] });
                          }, 220);
                        } else {
                          this.setState({ hasVideoOpened: true, videos });
                        }
                      }}>
                        <AccordionPanel
                          header={`${str}Videos: ${videosLen}`}
                          className="accordion-videolist"
                        >
                          {
                            // this.state.hasVideoOpened ?
                            // (
                              <List style={listStyle}>
                                {
                                  this.state.videos.map((item, index, arr) => (
                                    <ListItem
                                      className="video-item"
                                      key={index}
                                      onClick={() => props.onClickVideos(item, index, arr)}
                                    >
                                      <div className="video-item-info">
                                        <div className="accordion-dirlist-header">
                                          <div className="accordion-dirlist-header-title">
                                            <span>{item.alt}</span>
                                          </div>
                                          <div className="accordion-dirlist-header-sub">
                                            {`size: ${this.sizeFormatter(item.size)}`}
                                          </div>
                                        </div>
                                        <Icon type="play-circle" />
                                      </div>
                                      <div className="video-item-img">
                                        <img
                                          src={window.API_BASE_URL + item.posterPath + `/${item.sourceIndex}`}
                                          alt={item.alt}
                                        />
                                      </div>
                                    </ListItem>
                                  ))
                                }
                              </List>
                          //   ) : ''
                          }
                        </AccordionPanel>
                      </Accordion>
                    ) : ''
                  }
                </List>
                {
                  item.children.length !== 0 ? (
                    <ComputedAccordion
                      treeNode={currentItem.children}
                      level={props.level + 1}
                      onClickImages={props.onClickImages}
                      onClickVideos={props.onClickVideos}
                      onClickAudios={props.onClickAudios}
                    />
                  ) : ''
                }
                {
                  // <ListItem
                  //   className="list-actived-close"
                  //   onClick={() => null}                    
                  // >
                  //   {str}
                  //   <Icon style={{marginRight: '5px'}} type="to-top" />
                  //   {item.dirname}
                  // </ListItem>
                }
              </AccordionPanel> : ''
            )
          })
        }
      </Accordion>
    );
  }
}

class ClassifyPageImages extends Component {
  constructor() {
    super();
    this.state = {
      showVideo: false,
      showAudio: false,
      video: {},
      audio: {},
      isLast: false,
      isFirst: false,
      currentVideos: [],
      currentVideoIndex: 0
    };
  }

  // 点击图片header
  handleClickImagesDir = ev => {
    this.props.setFolder({ data: ev });
    if(ev.files.length !== 0) {
      this.props.onChangePage(2);
    }
  }

  // 点击视频header
  handleClickVideosDir = (video, index, arr) => {
    document.body.style.overflow = 'hidden';
    this.setState({
      video,
      showVideo: true,
      isFirst: index === 0,
      isLast: index === arr.length - 1,
      currentVideos: arr,
      currentVideoIndex: index
    });
  }

  // 点击音频header
  handleClickAudiosDir = ev => {
    document.body.style.overflow = 'hidden';
    this.setState({
      audio: ev,
      showAudio: true
    });
  }

  // 前一个
  handleBackwardMedia = (cb) => {
    if(this.state.currentVideoIndex > 0) {
      const videos = this.state.currentVideos;
      const index = this.state.currentVideoIndex - 1;
      this.setState({
        video: videos[index],
        isFirst: index === 0,
        isLast: index === videos.length - 1,
        currentVideoIndex: index
      }, () => cb && cb());
    } 
  }

  // 下一个
  handleForwardMedia = (cb) => {
    if(this.state.currentVideoIndex < this.state.currentVideos.length - 1) {
      const videos = this.state.currentVideos;
      const index = this.state.currentVideoIndex + 1;
      this.setState({
        video: videos[index],
        isFirst: index === 0,
        isLast: index === videos.length - 1,
        currentVideoIndex: index
      }, () => cb && cb());
    }
  }

  // 当前视频播放结束
  handleVideoEnded = () => {
    this.handleForwardMedia();
  }

  // 关闭
  handleCloseMedia = ev => {
    document.body.style.overflow = '';
    this.setState({
      video: null,
      audio: null,
      showVideo: false,
      showAudio: false
    });
  }

  render() {
    return (
      <div className="image-classify">
        <WhiteSpace/>
        {
          this.props.loadingTree ? 
            <Flex justify="center" direction="column">
              <Icon type="loading" style={{ fontSize: '40px', marginTop: '1em' }} />
            </Flex> :
            <Flex>
              <ComputedAccordion
                treeNode={this.props.tree}
                level={0}
                onClickImages={this.handleClickImagesDir}
                onClickVideos={this.handleClickVideosDir}
                onClickAudios={this.handleClickAudiosDir}
              />
            </Flex>
        }
        {
          this.state.showVideo ? (
            <Video
              onBackward={this.handleBackwardMedia}
              onForward={this.handleForwardMedia}
              onClose={this.handleCloseMedia}
              onEnded={this.handleVideoEnded}
              video={this.state.video}
              isFirst={this.state.isFirst}
              isLast={this.state.isLast}
            />
          ) :
          this.state.showAudio ? (
            <Audio onClose={this.handleCloseMedia} audio={this.state.audio} />
          ) : ''
        }
      </div>
    );
  }
}

export default connect(
  state => ({ tree: state.tree, loadingTree: state.loadingTree }),
  { setFolder: setSelectedImagesFolder }
)(ClassifyPageImages);
