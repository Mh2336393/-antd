/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-unresolved */
import React, { useEffect, useState, Fragment } from 'react';
import { connect } from 'dva';
import { Button, message, Table, Spin, Tag, Tooltip } from 'antd';
import styles from './index.less';
import authority from '@/utils/authority';
const { getAuth } = authority
import EventDrawerWidget from './components/eventDrawerWidget';
import { Task } from './interface/event';


interface IEventAnalysisProp {
    dispatch?: any;
    sourceAccess?: { sourceData: [] };
    caughtTask?: any;
    fetchSourceLoading?: boolean;
    fetchTaskLoading?: boolean;
    stopTaskLoading?: boolean;
    restartTaskLoading?: boolean;
    delTaskLoading?: boolean;
}
const CaughtTask: React.FC<IEventAnalysisProp> = ({
    dispatch,
    sourceAccess,
    caughtTask,
    fetchSourceLoading,
    fetchTaskLoading,
    stopTaskLoading,
    restartTaskLoading,
    delTaskLoading
}) => {
    const caughtTaskAuth = getAuth('/analysis/caughtTask');
    const [isvisible, setIsvisible] = useState(false);
    const [record, setRecord] = useState<Partial<Task>>({});
    const [title, setTitle] = useState<string>('新建任务');
    const [query, setQuery] = useState({
        pageSize: 20,
        page: 1
    });
    // const [timer, setTimer] = useState(null);
    const columns = [
        {
            title: '任务名称',
            dataIndex: 'name',
        },
        {
            title: '创建人',
            dataIndex: 'user',
        },
        {
            title: '创建时间',
            dataIndex: 'create_time',
        },
        {
            title: '启动时间',
            dataIndex: 'start_time',
        },
        {
            title: '任务状态',
            dataIndex: 'status',
            render: (
                text: string,
                taskItem: Partial<{ reason: string | null }>
            ) => {
                // 等待中（waiting）、运行中（running）、已完成（finished）、已失败（failed）
                return (
                    <Fragment>
                        {text === 'waiting' && (
                            <Tag color="#108ee9">等待中</Tag>
                        )}
                        {(text === 'running' || text === 'download') && (
                            <Tag color="#87d068">运行中</Tag>
                        )}
                        {text === 'finished' && (
                            <Tag>已完成</Tag>
                        )}
                        {text === 'failed' && (
                            <Fragment>
                                <Tooltip title={taskItem?.reason} placement="rightTop">
                                    <Tag color="#ff4d4f">已失败</Tag>
                                </Tooltip>
                            </Fragment>
                        )}
                    </Fragment>
                )
            }
        },
        {
            title: '操作',
            dataIndex: '',
            key: 'action',
            render: (
                text: string,
                taskItem: Partial<{
                    status: string,
                    tid: number
                }>
            ) => {
                if (caughtTaskAuth !== 'rw') {
                    return null;
                }
                return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {/* // 5）下载操作：仅允许 finished 类 */}
                        <Button
                            type="link"
                            disabled={taskItem.status === 'running' || taskItem.status === 'waiting' || taskItem.status === 'failed' || taskItem.status === 'download'}
                            onClick={e => {
                                window.location.href = `/api/captureTask/downloadPCAP?tid=${taskItem.tid}`;
                                e.stopPropagation();
                            }}
                        >
                            PCAP下载
                        </Button>

                        {/* // 3）终止操作：仅允许 waiting / running 类 */}
                        {
                            stopTaskLoading && taskItem.tid === record.tid ? (<Spin style={{ width: 60 }} />) : (
                                <Button
                                    type="link"
                                    disabled={taskItem.status === 'finished' || taskItem.status === 'failed' || taskItem.status === 'download'}
                                    onClick={() => {
                                        stopCaptureTask(taskItem)
                                    }}
                                >
                                    停止
                                </Button>
                            )
                        }

                        {/* // 4）重启操作：仅允许 finished / failed 类 */}
                        {
                            restartTaskLoading && taskItem.tid === record.tid ? (<Spin style={{ width: 88 }} />) : (
                                <Button
                                    type="link"
                                    disabled={taskItem.status === 'running' || taskItem.status === 'waiting' || taskItem.status === 'download'}
                                    onClick={() => {
                                        restartCaptureTask(taskItem)
                                    }}
                                >
                                    重新开始
                                </Button>
                            )
                        }

                        {/* // 2）修改操作：仅允许 waiting / finished / failed 类 */}
                        {
                            <Button
                                type="link"
                                // disabled={taskItem.status === 'running'}
                                onClick={() => {
                                    editTask(taskItem)
                                }}
                            >
                                编辑
                            </Button>
                        }

                        {/* // 1）删除操作：仅允许 waiting / finished / failed 类 */}
                        {
                            delTaskLoading && taskItem.tid === record.tid ? (<Spin style={{ width: 60 }} />) : (
                                <Button
                                    type="link"
                                    disabled={taskItem.status === 'running' || taskItem.status === 'download'}
                                    onClick={() => {
                                        delCaptureTask(taskItem)
                                    }}
                                >
                                    删除
                                </Button>
                            )
                        }

                    </div>
                );
            },
        },
    ]

    useEffect(() => {
        // 获取所有探针信息
        dispatch({ type: 'sourceAccess/fetchSourceData' });
        fetchCaughtTaskList()
        // 定时请求任务状态
        const timer = setInterval(() => {
            fetchCaughtTaskList()
        }, 3000)
        return () => {
            clearInterval(timer);
        }
    }, []);

    function fetchCaughtTaskList(newQuery?: any) {
        const param = newQuery || query;
        dispatch({
            type: 'caughtTask/fetchCaughtTaskList',
            payload: param,
        });
    }



    function handleTableChange(pagination, filters, sorter) {
        const { page, pageSize } = pagination;
        //  如果current,pagesize 发生变化，sort相关不改变，但是排序相关改变，page要变为1
        let newQuery;
        if (page !== query.page || pageSize !== query.pageSize) {
            newQuery = Object.assign({}, query, {
                page,
                pageSize,
            });
        } else {
            const { field, order } = sorter;
            if (!field) return;
            const dir = order?.slice(0, -3);
            newQuery = Object.assign({}, query, {
                dir,
                sort: field,
                page: 1,
            });
        }
        setQuery(newQuery);
        fetchCaughtTaskList(newQuery);
    };

    async function stopCaptureTask(taskItem) {
        const { tid } = taskItem
        setRecord(taskItem)
        await dispatch({
            type: 'caughtTask/stopCaptureTask',
            payload: { tid },
        })
        message.success('停止成功')
        fetchCaughtTaskList()
    }

    async function restartCaptureTask(taskItem) {
        const { tid } = taskItem
        setRecord(taskItem)
        await dispatch({
            type: 'caughtTask/restartCaptureTask',
            payload: { tid },
        })
        message.success('重启成功')
        fetchCaughtTaskList()
    }

    async function delCaptureTask(taskItem) {
        const { tid } = taskItem
        setRecord(taskItem)
        await dispatch({
            type: 'caughtTask/delCaptureTask',
            payload: { tid },
        })
        message.success('删除成功')
        fetchCaughtTaskList()
    }

    function create(obj: Partial<Task>) {
        if (sourceAccess.sourceData.length > 0) {
            setIsvisible(true)
            setRecord({ ...obj })
            setTitle('新建任务')
        } else {
            message.warn('当前没有配置探针。无法新建任务。')
        }
    }

    function editTask(obj: Partial<Task>) {
        setIsvisible(true)
        setRecord({ ...obj })
        setTitle('编辑任务')
    }

    function handleDrawerWidgetClose(isRefresh: boolean) {
        setIsvisible(false)
        console.log('侧边框关闭回调', isRefresh)
        if (isRefresh) {
            fetchCaughtTaskList()
        }
    }

    return (
        <div className="contentWraper">
            <div className="commonHeader" style={{ position: 'relative', display: "flex" }}>
                <span className={styles.headerTitle}>抓包任务</span>
            </div>
            <div className="container">

                <div className="TableTdPaddingWrap">
                    {caughtTaskAuth === 'rw' && (
                        <Button
                            className="smallBlueBtn"
                            style={{ marginBottom: 14 }}
                            disabled={sourceAccess.sourceData.length === 0}
                            onClick={() => { create({}) }}>
                            新建
                        </Button>
                    )}
                    <Table
                        loading={fetchSourceLoading}
                        columns={columns}
                        dataSource={caughtTask?.taskList?.list}
                        rowKey="tid"
                        pagination={{
                            // showSizeChanger: !isAllCheck,
                            defaultPageSize: query.pageSize,
                            pageSizeOptions: ['20', '30', '50'],
                            current: query.page,
                            total: caughtTask?.taskList?.total,
                            showTotal: total => `（${total}项）`,
                        }}
                        onChange={handleTableChange}

                    />
                </div>

                <EventDrawerWidget
                    isvisible={isvisible}
                    title={title}
                    record={record}
                    nodeList={sourceAccess.sourceData}
                    onClose={handleDrawerWidgetClose}
                />

            </div>
        </div>
    );
}

export default connect(({ sourceAccess, caughtTask, loading }) => ({
    sourceAccess,
    caughtTask,
    fetchSourceLoading: loading.effects['sourceAccess/fetchSourceData'],
    fetchTaskLoading: loading.effects['caughtTask/fetchCaughtTaskList'],
    stopTaskLoading: loading.effects['caughtTask/stopCaptureTask'],
    restartTaskLoading: loading.effects['caughtTask/restartCaptureTask'],
    delTaskLoading: loading.effects['caughtTask/delCaptureTask'],
}))(CaughtTask);

