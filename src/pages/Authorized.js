import React from 'react';
import RenderAuthorized from '@/components/Authorized';
import authority from '@/utils/authority';
const { getAuthority } = authority;
import Redirect from 'umi/redirect';

const Authority = getAuthority();
const Authorized = RenderAuthorized(Authority);

export default ({ children }) => (
  <Authorized authority={children.props.route.authority} noMatch={<Redirect to="/user/login" />}>
    {children}
  </Authorized>
);
