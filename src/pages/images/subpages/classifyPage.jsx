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
  render() {
    const props = this.props;
    const treeNode = props.treeNode || [];
    const str = Array(props.level).fill('-').join('') + ' ';
    const gapValue = props.level * 5 + 'px';
    const style = { paddingLeft: gapValue };
    return (
      <Accordion accordion style={style}>
        {
          treeNode.map(item => {
            const images = [];
            const videos = []; 
            const audios = [];
            item.files.forEach(it => {
              if(it.type === 'image') {
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
            const isEmpty = !imagesLen && !videosLen && !audiosLen && !item.children.length; // 过滤空文件夹
            return (
              !isEmpty ? <AccordionPanel
                header={str + item.dirname}
                key={item.id}
              >
                <List>
                  {
                    imagesLen ?
                    (
                      <ListItem
                        className={imagesLen ? 'images' : 'empty'}
                        onClick={() => props.onClickImages(item)}                    
                      >
                        {`${str}Images: ${imagesLen}`}
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
                            <List style={{ paddingLeft: (props.level + 1) * 5 + 'px' }}>
                              {
                                this.state.audios.map((item, index) => (
                                  <ListItem
                                    className="audio-item"
                                    key={index}
                                    onClick={() => props.onClickAudios(item)}
                                  >
                                    <div className="audio-item-info">
                                      {item.alt}
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
                              <List style={{ paddingLeft: (props.level + 1) * 5 + 'px' }}>
                                {
                                  this.state.videos.map((item, index) => (
                                    <ListItem
                                      className="video-item"
                                      key={index}
                                      onClick={() => props.onClickVideos(item)}
                                    >
                                      <div className="video-item-info">
                                        {item.alt}
                                        <Icon type="play-circle" />
                                      </div>
                                      <div className="video-item-img">
                                        <img
                                          src={window.API_BASE_URL + item.posterPath}
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
                      treeNode={item.children}
                      level={props.level + 1}
                      onClickImages={props.onClickImages}
                      onClickVideos={props.onClickVideos}
                      onClickAudios={props.onClickAudios}
                    />
                  ) : ''
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
      video: {}
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
  handleClickVideosDir = ev => {
    document.body.style.overflow = 'hidden';
    this.setState({
      video: ev,
      showVideo: true
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
        <Flex>
          <ComputedAccordion
            treeNode={this.props.tree}
            level={0}
            onClickImages={this.handleClickImagesDir}
            onClickVideos={this.handleClickVideosDir}
            onClickAudios={this.handleClickAudiosDir}
          />
        </Flex>
        {
          this.state.showVideo ? (
            <Video onClose={this.handleCloseMedia} video={this.state.video} />
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
  state => ({ tree: state.tree }),
  { setFolder: setSelectedImagesFolder }
)(ClassifyPageImages);
