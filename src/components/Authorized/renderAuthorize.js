/* eslint-disable import/no-mutable-exports */
let CURRENT = 'NULL';
/**
 * use  authority or getAuthority
 * @param {string|()=>String} currentAuthority
 */
const renderAuthorize = (Authorized) => {
  console.log("Authorized==2222==", Authorized)
  // 去掉箭头连写，看不懂了....，下面其实就是return了一个方法...
  const fun = (currentAuthority) => {
    console.log("currentAuthority==1111==", currentAuthority)
    if (currentAuthority) {
      if (typeof currentAuthority === 'function') {
        CURRENT = currentAuthority();
      }
      if (['String', 'Object'].indexOf(currentAuthority.constructor.name)) {
        CURRENT = currentAuthority;
      }
    } else {
      CURRENT = 'NULL';
    }
    return Authorized;
  }
  return fun
}

export { CURRENT };
const renderAuthorizeOne = Authorized => {
  console.log("Authorized==1111==", Authorized)
  return renderAuthorize(Authorized)
}

export default renderAuthorizeOne;

