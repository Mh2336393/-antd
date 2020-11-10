/* eslint-disable consistent-return */

import React, { Component } from 'react';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Input, message, Select } from 'antd';
import styles from './XFFIPPolicy.less';

const { Option } = Select;

const domainNameReg = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
/**
 * XFF ip 策略组件
 */
class XFFIPPolicy extends Component {
    constructor(props) {
        super(props);
        this.state = {
            "按序替换ip序号": 1,
            "策略替换": [{
                "域名": '',
                "ip序号": 1
            }]
        };
    };

    componentDidMount() {
        // 把实例给到父组件
        this.props.onRef(this);
        this.initState();
    };



    componentDidUpdate(prevProps) {
        // 典型用法（不要忘记比较 props）：
        if (this.props.deployment !== prevProps.deployment) {
            this.initState();
        }
    }

    /** 按序替换InputNumber发生改变 */
    accordingToTheSequenceToReplaceInputChange = (value) => {
        const oldNum = this.state.按序替换ip序号
        if (value > oldNum && value === 0) this.setState({ "按序替换ip序号": 1 })
        else if (value < oldNum && value === 0) this.setState({ "按序替换ip序号": -1 })
        else this.setState({ "按序替换ip序号": value })
    }

    /** 策略替换 ip序号 发生改变 */
    strategyToReplaceInputChange = (value, index) => {
        const { 策略替换 } = this.state
        const oldNum = 策略替换[index]['ip序号']
        if (value > oldNum && value === 0) {
            策略替换[index]['ip序号'] = 1
        }
        else if (value < oldNum && value === 0) {
            策略替换[index]['ip序号'] = -1
        }
        else {
            策略替换[index]['ip序号'] = value
        }
        this.setState({
            策略替换
        })
    }

    /** 策略替换 域名 发生改变 */
    strategyToReplaceDomainNameChange = (value, index) => {
        const { 策略替换 } = this.state
        策略替换[index]['域名'] = value.trim()
        this.setState({
            策略替换
        })
    }



    /** 添加策略替换元素 */
    addStrategyReplaceItem = (curIndex) => {
        if (!this.checkPartsDetail()) return
        const item = {
            "域名": '',
            "ip序号": 1
        }
        const { 策略替换 } = this.state
        策略替换.splice(curIndex + 1, 0, item)
        this.setState({
            策略替换
        })
    }


    /** 删除策略替换元素 */
    deleteStrategyReplaceItem = (curIndex) => {
        const { 策略替换 } = this.state
        if (策略替换.length <= 1) {
            message.warn('至少得包含一个域名配置！')
            return
        }
        策略替换.splice(curIndex, 1)
        this.setState({
            策略替换
        })
    }

    /** host模式返回 host字段(父组件调用) */
    hostModeReturnsString = () => {
        if (!this.checkPartsDetail()) return
        const { 策略替换 } = this.state
        let host = ""
        for (let i = 0; i < 策略替换.length; i++) {
            const element = 策略替换[i];
            if (i === 策略替换.length - 1) {
                host += `${element.域名} ${element.ip序号}`
            } else {
                host += `${element.域名} ${element.ip序号},`
            }
        }
        return host
    }

    /** forword模式返回 ip序号(父组件调用) */
    forwordModeReturnsAnOrdinalNumber = () => {
        return this.state.按序替换ip序号
    }

    /** 检查 策略替换数组中的元素，数据结构是否正常 */
    checkPartsDetail() {
        const { 策略替换 } = this.state
        for (let r = 0; r < 策略替换.length; r++) {
            const element_wai = 策略替换[r]
            // 检查域名是否为空
            if (!domainNameReg.test(element_wai.域名)) {
                message.warn(`第${r + 1}行，请输入正确得域名。`)
                return false
            }

            for (let c = r + 1; c < 策略替换.length; c++) {
                const element_nei = 策略替换[c]
                // 检查是否有重复得域名
                if (element_wai.域名 === element_nei.域名) {
                    message.warn(`第${r + 1}行，第${c + 1}行，域名不允许重复。`)
                    return false
                }
            }
        }
        return true
    }

    initState() {
        const {
            deployment,
            xffConfig
        } = this.props;
        if (deployment === 'forward') {
            this.setState({
                "按序替换ip序号": Number(xffConfig.item),
            });
        }
        else if (deployment === 'host') {
            const { host } = xffConfig;
            if (host) {
                const arr = host.split(",");
                const 策略替换 = [];
                arr.forEach(element => {
                    策略替换.push({
                        "域名": element.split(" ")[0],
                        "ip序号": element.split(" ")[1]
                    });
                });
                this.setState({ 策略替换 });
            }
        }
    }




    render() {
        const {
            deployment
        } = this.props
        const range = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]
        if (deployment === 'forward') {
            const { 按序替换ip序号 } = this.state
            return (
                <div className={styles.forwordBox}>
                    <span className={styles.begin}>IP序号(负值表示倒序)</span>
                    <Select className={styles.inputNumber} value={按序替换ip序号} onChange={this.accordingToTheSequenceToReplaceInputChange}>
                        {range.map((item, index) => {
                            return (
                                <Option key={index} value={item}>{item}</Option>
                            )
                        })}
                    </Select>
                </div>
            )
        }
        if (deployment === 'host') {
            const { 策略替换 } = this.state
            return (
                <div className={styles.hostBox}>
                    {策略替换.map((item, index) => {
                        return (
                            <div key={index} className={styles.hostItem}>
                                <Input
                                    className={styles.domainName}
                                    addonBefore="域名"
                                    value={item.域名}
                                    onChange={(e) => { this.strategyToReplaceDomainNameChange(e.target.value, index) }}
                                />
                                <span className={styles.begin}>IP序号(负值表示倒序)</span>
                                <Select
                                    className={styles.inputNumber}
                                    value={item.ip序号}
                                    onChange={(val) => { this.strategyToReplaceInputChange(val, index) }} >
                                    {range.map((rangeItem, rangeIndex) => {
                                        return (
                                            <Option key={rangeIndex} value={rangeItem}>{rangeItem}</Option>
                                        )
                                    })}
                                </Select>

                                <div className={styles.end}>
                                    <PlusOutlined
                                        style={{ fontSize: "24px", marginRight: "10px", color: "#1890ff" }}
                                        onClick={() => { this.addStrategyReplaceItem(index) }} />
                                    <MinusOutlined
                                        style={{ fontSize: "24px", color: "#ff4d4f" }}
                                        onClick={() => { this.deleteStrategyReplaceItem(index) }} />
                                </div>

                            </div>
                        );
                    })}

                </div>
            );
        }
        return (
            <div />
        )

    }
}

export default XFFIPPolicy;
