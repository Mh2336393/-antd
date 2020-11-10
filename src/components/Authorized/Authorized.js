import CheckPermissions from './CheckPermissions';

const Authorized = ({ children, authority, noMatch = null }) => {
  // console.log("Authorized==方法执行==参数打印==start")

  // console.log("children:",children)
  // console.log("authority:",authority)
  // console.log("noMatch:",noMatch)
  
  // console.log("Authorized==方法执行==参数打印==end")
  const childrenRender = typeof children === 'undefined' ? null : children;
  return CheckPermissions(authority, childrenRender, noMatch);
};

export default Authorized;
