/* eslint-disable react/no-array-index-key */
/* eslint-disable react/destructuring-assignment */
/*
 * File Created: Sunday, 7th July 2019 10:54:45 am
 * Author: fina(<<finazhang@tencent.com>>>)
 * -----
 * Last Modified: Sunday, 7th July 2019 10:55:26 am
 * Modified By: fina (<<finazhang@tencent.com>>>)
 */
import React, { Component, Fragment } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { Row, Col, Layout } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import FilterBar from '@/components/FilterBar';
import styles from './index.less';
import Title from './Title';
import TimeRangeBlock from './TimeRangeBlock';
import CommonTable from '@/components/CommonTable';

const { Sider } = Layout;
class CommonPage extends Component {
  constructor(props) {
    super(props);
    this.state = { siderbarIsOpen: true, sideWidth: 306 };
    this.moving = false;
    this.lastX = null;
  }

  mouseDown = e => {
    e.stopPropagation();
    e.preventDefault();
    this.moving = true;
    window.onmouseup = e => this.onMouseUp(e);
    window.onmousemove = e => this.onMouseMove(e);
  };

  onMouseMove = e => {
    if (this.moving) {
      this.onMove(e);
    }
  };
  
  changeWidth = ()=>{
    if(!this.state.siderbarIsOpen){
      const fdocConcent=document.getElementsByClassName("ant-table-content")[0]
      fdocConcent.style.width="100%"
    }
    
  }

  changeWidth = ()=>{
    if(!this.state.siderbarIsOpen){
      const fdocConcent=document.getElementsByClassName("ant-table-content")[0]
      fdocConcent.style.width="100%"
    }
    
  }

  triggerSiderbar = () => {
    const evt = document.createEvent('HTMLEvents');
    evt.initEvent('resize', false, false);
    window.dispatchEvent(evt);
    const { siderbarIsOpen } = this.state;
    this.setState({ siderbarIsOpen: !siderbarIsOpen },()=>{this.changeWidth()});
  };

  onMouseUp = () => {
    // console.log('up');
    this.moving = false;
    this.lastX = null;
  };

  onMove = e => {
    // console.log('dd');
    const { sideWidth } = this.state;
    if (this.lastX) {
      const dx = e.clientX - this.lastX;
      const newWidth = sideWidth + dx;
      if (newWidth >= 306 && newWidth <= 612) {
        const evt = document.createEvent('HTMLEvents');
        evt.initEvent('resize', false, false);
        window.dispatchEvent(evt);
        this.setState({ sideWidth: newWidth },()=>{
          if( document.getElementsByClassName("ant-layout-sider-children")[0]){
            const  leftmenu= document.getElementsByClassName("ant-layout-sider-children")[0]
           leftmenu.style.width=`${newWidth}px`
          }
       
        });
      }
    }
    this.lastX = e.clientX;
  };

  titleRender = () => {
    const { titleRender } = this.props;
    if (titleRender === false) {
      return null;
    }
    if (titleRender) {
      return titleRender();
    }
    return <Title {...this.props} />;
  };

  timeRangeRender = () => {
    const { timeRangeRender } = this.props;
    if (timeRangeRender === false) {
      return null;
    }
    if (timeRangeRender) {
      return timeRangeRender();
    }
    return <TimeRangeBlock {...this.props} />;
  };

  deleteSelect = (key, value, mode) => {
    const { query } = this.props;
    const { filterObj } = query;
    const newObj = cloneDeep(filterObj);
    newObj[key] = newObj[key].filter(item => item !== value);
    const newQuery = Object.assign({}, query, { filterObj: newObj });
    if (this.props.deleteSelect) {
      this.props.deleteSelect(newQuery, mode);
    }
  };

  selctedItemsRender = () => {
    const {
      selctedItemsRender,
      query: { filterObj },
      pickedFilterList,
      mode,
    } = this.props;
    if (selctedItemsRender === false) {
      return null;
    }
    if (selctedItemsRender) {
      return selctedItemsRender(mode);
    }
    return (
      <Col span={20} className={styles.selectedList}>
        {Object.keys(filterObj).map(key => {
          filterObj[key] = filterObj[key] || [];
          const obj = pickedFilterList.find(item => item.key === key);
          return (
            <Fragment key={key}>
              {filterObj[key].map((select, idx) => (
                <div key={`${select}_${idx}`} className={styles.selectItem}>
                  <span className={styles.selelctName}>
                    {obj.title}:{obj.render ? obj.render(select) : select}
                  </span>
                  <CloseOutlined
                    className={styles.closeStyle}
                    onClick={() => {
                      this.deleteSelect(key, select, mode);
                    }} />
                </div>
              ))}
            </Fragment>
          );
        })}
      </Col>
    );
  };

  clearRneder = () => {};

  tipsRender = () => {
    const { tipsRender } = this.props;
    if (tipsRender) {
      return tipsRender();
    }
    return null;
  };

  siderRender = () => {
    const {
      siderRender,
      query,
      preQuery,
      actionStatus,
      pickedFilterList,
      mode,
      filterBar: {
        hasManageBtn,
        filterPrefix,
        globalSearch,
        globalSearchChange,
        checkboxOnchange,
        sortAction,
        mustAction,
        filterQuickSelect,
        triggerFilterListManger,
        placeholder,
        changeMode,
        fetchData,
        rwAuth,
      },
    } = this.props;
    const { sideWidth, siderbarIsOpen } = this.state;
    if (siderRender === false) {
      return null;
    }
    if (siderRender) {
      siderRender();
    }
    return (
      <Sider
        width={sideWidth}
        style={{
          overflow: 'auto',
          position: 'relative',
          left: siderbarIsOpen ? 0 : `${-sideWidth}px`,
          margin: '10px 0 0 10px',
          backgroundColor: '#ffffff',
        }}
      >
        <FilterBar
          isOpen={siderbarIsOpen}
          placeholder={placeholder}
          width={sideWidth - 1}
          filterObj={query.filterObj}
          dirObj={query.dirObj}
          mustObj={query.mustObj}
          mode={mode}
          changeMode={changeMode}
          filterList={pickedFilterList}
          sortAction={sortAction}
          mustAction={mustAction}
          partActionStatus={actionStatus}
          globalSearch={globalSearch}
          globalSearchChange={globalSearchChange}
          checkboxOnchange={checkboxOnchange}
          hasManageBtn={hasManageBtn}
          query={query}
          preQuery={preQuery}
          filterPrefix={filterPrefix}
          filterQuickSelect={filterQuickSelect}
          triggerFilterListManger={triggerFilterListManger}
          fetchData={fetchData}
          rwAuth={rwAuth}
        />
      </Sider>
    );
  };

  collapsedBtnRender = () => {
    const { collapsedBtnRender } = this.props;
    const { siderbarIsOpen, sideWidth } = this.state;

    if (collapsedBtnRender === false) {
      return null;
    }
    if (collapsedBtnRender) {
      collapsedBtnRender();
    }
    return (
      <div className={styles.handlebtn} style={{ marginLeft: siderbarIsOpen ? -5 : `${-sideWidth}px` }}>
        <span onClick={this.triggerSiderbar} className={siderbarIsOpen ? styles.switch : styles.switchBlue} />
      </div>
    );
  };

  sliderRender = () => {
    const { sliderRender } = this.props;
    const { siderbarIsOpen } = this.state;
    if (sliderRender === false) {
      return null;
    }
    if (sliderRender) {
      return sliderRender();
    }
    if (siderbarIsOpen) {
      return (
        <div
          style={{
            position: 'relative',
            right: 0,
            width: '5px',
            borderLeft: '1px solid #DBDBDB',
            zIndex: '10',
            height: 'calc(100%-10px)',
            cursor: 'e-resize',
            marginTop: '10px',
          }}
          onMouseDown={e => {
            this.mouseDown(e);
          }}
        />
      );
    }
    return null;
  };

  chartRender = () => {
    const { chartRender } = this.props;
    if (!chartRender) {
      return null;
    }
    return chartRender();
  };

  tableRender = () => {
    const {
      tableRender,
      table: { tableProps, operationProps, wrapperClass },
    } = this.props;
    if (tableRender === false) {
      return null;
    }
    if (tableRender) {
      tableRender();
    }
    return <CommonTable wrapperClass={wrapperClass} tableProps={tableProps} operationProps={operationProps} />;
  };

  render() {
    const { children, showOperationPage, titleName, timeRange, selectedFlag } = this.props;
    return (
      <div className={styles.pageWrapper} style={{ display: showOperationPage === undefined || showOperationPage ? 'flex' : 'none' }}>
        {titleName && (
          <Row className={styles.header} style={{ padding: selectedFlag ? '0' : '10px 0 10px 24px' }}>
            {titleName && this.titleRender()}
            {timeRange && this.timeRangeRender()}
            {!selectedFlag && this.selctedItemsRender()}
            {this.clearRneder()}
          </Row>
        )}
        {selectedFlag && <div>{this.selctedItemsRender()}</div>}
        <Layout className={styles.contentBlock}>
          {this.siderRender()}
          {this.sliderRender()}
          {this.collapsedBtnRender()}
          <Layout>
            {this.tipsRender()}
            {this.chartRender()}
            {this.tableRender()}
            {children}
          </Layout>
        </Layout>
      </div>
    );
  }
}

export default CommonPage;
