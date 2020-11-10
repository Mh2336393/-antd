import RenderAuthorized from '@/components/Authorized';
import authority from './authority';
const { getAuthority } = authority;

// 返回一个组件
let Authorized = RenderAuthorized(getAuthority()); // eslint-disable-line

// Reload the rights component
const reloadAuthorized = () => {
  Authorized = RenderAuthorized(getAuthority());
};

export { reloadAuthorized };
export default Authorized;
