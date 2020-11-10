/* eslint-disable react/no-multi-comp */
/* eslint-disable camelcase */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable prefer-destructuring */

import React, { Component } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { Table, Popover } from 'antd';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import styles from './index.less';

let dragingIndex = -1;

class BodyRow extends Component {
  render() {
    const { isOver, connectDragSource, connectDropTarget, moveRow, ...restProps } = this.props;
    const style = { ...restProps.style, cursor: 'move' };

    let className = restProps.className;
    if (isOver) {
      if (restProps.index > dragingIndex) {
        className += ' drop-over-downward';
      }
      if (restProps.index < dragingIndex) {
        className += ' drop-over-upward';
      }
    }

    return connectDragSource(connectDropTarget(<tr {...restProps} className={className} style={style} />));
  }
}

const rowSource = {
  beginDrag(props) {
    dragingIndex = props.index;
    return {
      index: props.index,
    };
  },
};

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Time to actually perform the action
    props.moveRow(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};

const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
}))(
  DragSource('row', rowSource, connect => ({
    connectDragSource: connect.dragSource(),
  }))(BodyRow)
);
class DragSortingTable extends Component {
  components = {
    body: {
      row: DragableBodyRow,
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      data: props.dataSource,
    };
    this.columns = [
      {
        key: 'title',
        dataIndex: 'title',
        width: 100,
        render: (text, record) => {
          if (this.props.hasHover) {
            return (
              <Popover placement="bottomLeft" content={this.props.getHoverContent(record)} overlayStyle={{ ...this.props.overlayStyle }}>
                <span style={{ display: 'inline-block', width: '100%' }}>{text}</span>
              </Popover>
            );
          }
          if (this.props.customTitle) {
            return this.props.customTitle(record);
          }
          return text;
        },
      },
      {
        key: 'action',
        dataIndex: 'action',
        width: 20,
        render: (text, record) => (
          <DeleteOutlined
            onClick={() => {
              props.cancelCheck(record.key || record);
            }} />
        ),
      },
    ];
  }

  componentWillReceiveProps = nextProps => {
    const { dataSource } = nextProps;
    this.setState({ data: dataSource });

    // const { dataSource: oldDataSource } = this.props;
    // console.log('xx',dataSource,oldDataSource,isEqual(dataSource,oldDataSource));
    // if(!isEqual(dataSource,oldDataSource)){
    //   this.setState({data:dataSource});
    // }
  };

  moveRow = (dragIndex, hoverIndex) => {
    const { data } = this.state;
    const { onDrag } = this.props;
    const dragRow = data[dragIndex];
    const list = update(this.state, {
      data: {
        $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
      },
    });
    onDrag(list.data);
    this.setState(list);
  };

  render() {
    const { data } = this.state;
    const { rowKey = {} } = this.props;
    return (
      <div className={styles.tableBlock}>
        <Table
          {...rowKey}
          showHeader={false}
          columns={this.columns}
          dataSource={data}
          components={this.components}
          pagination={false}
          onRow={(record, index) => ({
            index,
            moveRow: this.moveRow,
          })}
        />
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(DragSortingTable);
