import React, { Component } from 'react';
import { Flex, Accordion, List, WhiteSpace } from 'antd-mobile';
import { Icon } from 'antd';
import { connect } from 'react-redux';
import './style.scss';
import { setSelectedImagesFolder } from '../../../store/action';
import Video from '../components/video';

const AccordionPanel = Accordion.Panel;
const ListItem = List.Item;

class ComputedAccordion extends Component {
  constructor() {
    super();
    this.state = {
      hasVideoOpened: false,
      videos: []
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
            const imagesLen = item.files.filter(item => item.type === 'image').length;
            const videos = item.files.filter(item => item.type === 'video');
            const videosLen = videos.length;
            return (
              <AccordionPanel
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
                    videosLen ?
                    (
                      <Accordion accordion onChange={ev => {
                        console.log(ev)
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
                    />
                  ) : ''
                }
              </AccordionPanel>
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

  handleClickImagesDir = ev => {
    this.props.setFolder({ data: ev });
    if(ev.files.length !== 0) {
      this.props.onChangePage(2);
    }
  }

  handleClickVideosDir = ev => {
    document.body.style.overflow = 'hidden';
    this.setState({
      video: ev,
      showVideo: true
    });
  }

  handleCloseVideo = ev => {
    document.body.style.overflow = '';
    this.setState({ showVideo: false });
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
          />
        </Flex>
        {
          this.state.showVideo ? (
            <Video onClose={this.handleCloseVideo} video={this.state.video} />
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
