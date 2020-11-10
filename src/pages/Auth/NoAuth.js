import React, { Component } from 'react';
import { Link } from 'umi';
import { connect } from 'umi';
import { errorReport } from '../../services/api';

@connect(({ global }) => ({
  authMap: global.authMap,
}))
class NoAuth extends Component {
  componentDidMount() {
    window.onerror = (errorMessage, scriptURI, lineNo, columnNo, error) => {
      errorReport({
        errorMessage,
        scriptURI,
        lineNo,
        columnNo,
        message: error.toString(),
        stack: error.stack,
      });
      return false;
    };
    // throw new Error('not defined');
  }

  render() {
    const { authMap } = this.props;
    const routes = Object.keys(authMap);
    const path = routes[0] || '/';
    return (
      <div
        className="container"
        style={{
          backgroundColor: '#fff',
          minHeight: 800,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <p>该页面无授权，请联系管理员开通权限</p>
        <p>
          <Link to={path} type="primary">
            返回首页
          </Link>
        </p>
      </div>
    );
  }
}

export default NoAuth;
