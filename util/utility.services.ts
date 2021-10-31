/**
 * ReE
 * @param body
 */
 const errRes = (req:any,res:any) => {
  
    return res.json({ status: false, errMsg: "err" });
  };
  
  /**
   * ReS
   * @param body
   */
  const okRes = (res:any, data:any, code = 200) => {
    // Success Web Response
    let sendData = { status: true, errMsg: "" };
  
    if (typeof data == "object") {
      sendData = Object.assign(data, sendData); //merge the objects
    }
    if (typeof code !== "undefined") res.statusCode = code;
    return res.json(sendData);
  };
  
  const getOtp = () => Math.floor(1000 + Math.random() * 9000);
  
  export { okRes, errRes, getOtp };