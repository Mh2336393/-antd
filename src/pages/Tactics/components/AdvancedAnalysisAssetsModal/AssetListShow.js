/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { Card, Table, Switch } from 'antd';
import styles from './AssetListShow.less';

class AssetListShow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isChecked: true
        };


        this.columnsRight = [
            {
                title: '资产名称',
                dataIndex: 'Fasset_name',
                width: "25%"
            },
            {
                title: '资产ip',
                dataIndex: 'Fip',
                width: "25%"
            },
            {
                title: '资产组',
                dataIndex: 'Fgroup_name',
                width: "25%"
            },
            {
                title: '资产类型',
                dataIndex: 'Fcategory_name',
                width: "25%"
            }
        ];
    };


    onChange = (checked) => {
        console.log(`switch to ${checked}`);
        this.setState({
            isChecked: checked
        })
    }


    render() {
        const { isChecked } = this.state
        const { selectedRows } = this.props

        const sceneNameArr = []
        selectedRows.forEach(element => {
            const {
                "GROUP_CONCAT(t_ai_ip_scene_config.Fscene_name)": Fscene_names
            } = element
            const scene_name_arr = Fscene_names.split(",")
            scene_name_arr.forEach(item => {
                if (!sceneNameArr.includes(item)) sceneNameArr.push(item)
            })
        });

        return (
            <Card
                style={{ width: "100%" }}
                title={`正在为 ${selectedRows.length} 个资产编辑测算模式`}
                extra={<Switch checkedChildren="展开" unCheckedChildren="收起" checked={isChecked} onChange={this.onChange} />}
            >
                {/* 添加资产 */}
                <div style={{ display: (isChecked? "block" : "none") }}>
                    <Table
                        columns={this.columnsRight}
                        rowKey={record => record.Fip}
                        dataSource={selectedRows}
                        pagination={false}
                        scroll={{ y: 400 }}
                    />
                    <p className='texta'>当前已开启 <span className="textb">{sceneNameArr.includes("observation") ? 0 : sceneNameArr.length}</span> 项场景进行测算</p>
                </div>

            </Card>
        );
    }
}

export default AssetListShow
