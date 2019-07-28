import React, { Component } from 'react';
import { Flex, Accordion, List, WhiteSpace } from 'antd-mobile';
// import { Collapse } from 'antd';
import { connect } from 'react-redux';
import './style.scss';
import { setSelectedImagesFolder } from '../../../store/action';

const AccordionPanel = Accordion.Panel;
const ListItem = List.Item;

function ComputedAccordion(props) {
  const treeNode = props.treeNode || [];
  const str = Array(props.level).fill('-').join('') + ' ';
  const gapValue = props.level * 5 + 'px';
  const style = { paddingLeft: gapValue };
  return (
    <Accordion accordion style={style}>
      {
        treeNode.map(item => (
          <AccordionPanel
            header={str + item.dirname}
            key={item.id}
            className="accordion-dir"
          >
            <List>
              <ListItem
                className={item.files.filter(item => item.type === 'image').length ? '' : 'images-empty'}
                onClick={() => props.onClick(item)}                    
              >
                {`${str}Images: ${item.files.filter(item => item.type === 'image').length}`}
              </ListItem>
            </List>
            {
              item.children.length !== 0 ? (
                <ComputedAccordion
                  treeNode={item.children}
                  level={props.level + 1}
                  onClick={props.onClick}
                />
              ) : ''
            }
          </AccordionPanel>
        ))
      }
    </Accordion>
  );
}

class ClassifyPageImages extends Component {
  constructor() {
    super();
  }

  handleClickDir = ev => {
    this.props.setFolder({ data: ev });
    if(ev.files.length !== 0) {
      this.props.onChangePage(2);
    }
  }

  render() {
    // const CollapsePanel = Collapse.Panel;
    return (
      <div className="image-classify">
        <WhiteSpace/>
        <Flex>
          <ComputedAccordion
            treeNode={this.props.tree}
            level={0}
            onClick={this.handleClickDir}
          />
        </Flex>
      </div>
    );
  }
}

export default connect(
  state => ({ tree: state.tree }),
  { setFolder: setSelectedImagesFolder }
)(ClassifyPageImages);
