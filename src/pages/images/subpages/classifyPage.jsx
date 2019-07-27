import React, { Component } from 'react';
import { Flex, Accordion, List } from 'antd-mobile';
import { getTreeImages } from '../../../api';

export default class ClassifyPageImages extends Component {
  constructor() {
    super();
  }

  fetchData = async (id) => {
    const res = (await getTreeImages({ id })).data;
  }

  componentWillMount() {
    ;
  }

  render() {
    return (
      <Flex></Flex>
    );
  }
}
