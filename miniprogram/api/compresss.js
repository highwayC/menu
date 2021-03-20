/*
只上传文件路径是不能把本地文件成功上传到云存储的，
但是我们可以将本地文件进行 进制 编码 转化为字节流上传到云函数中，
再在云函数的操作中把字节或文件转化为相对应的格式
  1. 利用图片的临时路径判断是否是图片
  2. 将该图片转成base64编码
  3. 用转化好的base64文件大小判断该图片的大小决定是否进行压缩
  4. 若需要，则将该图片的临时路径，画在canvas上，利用canvas进行压缩
  5. 计算图片的宽高比，将图片按比例压缩，压缩后又转化为base64文件，继续判断该图片的大小决定是否进行压缩
  6. 重复进行压缩，直至压缩图片的大小小于自定义大小（这里是200kb）
  7. 返回压缩后的base64编码文件
 */
const urlTobase64Fn = async function(arr) {
  let imgFiles=[];
  for(let i=0;i<arr.length;i++){
    //this的指向很重要
    let fileobj={path:arr[i],fileFile:'jpg'}
    let base64=await urlTobase64(fileobj);
    imgFiles.push(base64);
  }
  return imgFiles;
}
 //base64
const urlTobase64=async (fileObj)=>{
  // console.log(fileObj)
  //截取文件类型，转换为base64
  let type=fileObj.type || fileObj.path.substring(fileObj.path.lastIndexOf('.')+1);
  let obj={
    path:fileObj.path,
    type
  }
  let base64  = await getFileSystemManagerFn(obj);
  //将换行清除
  base64 = base64.replace(/[\r\n]/g, "");

  //如果是视频
  if(type =='mp4'){
    console.log('是视频，直接输出base64')
    //如果上传不是获取视频，则返回空
    return fileObj.fileType =='video'?base64 : ''
    // return base64;
  }
  let imgSize = await getBase64SizeFn(base64);
  // console.log(imgSize,'是图片，判断图片大小');
  //自定义图片大小限制、默认为 200kb
  fileObj.limitNum = fileObj.limitNum ||  1024 *0.2;
  if(imgSize >fileObj.limitNum && type !='gif'){
    // console.log(imgSize,'需要压缩')
    let imgInfo = await getImageInfoFn (fileObj.path);
    console.log("原来的大小：高："+imgInfo.height+"===="+imgInfo.width)
    fileObj.canvasId = fileObj.canvasId || 'canvasId';
    
    return  await convertImgToBase64Fn({
      ...fileObj,
      oldH : imgInfo.height,
      oldW : imgInfo.width,
      // path : base64, //用微信临时地址，不要用base64  这里很重要，千万不要打开
      type : imgInfo.type
    });
  } else {
    console.log(imgSize,'可以直接使用');
    //在限制大小之下，直接返回base64值
    return base64
  }
}
 //将图片转 base64
 const getFileSystemManagerFn=async (obj)=>{
	// console.log(obj.path,'图片地址')
	return new Promise(async (resolve,reject)=>{
		let path = obj.path;
		//微信图片，先去下载
		if(path.indexOf('https://wx.qlogo.cn') >=0){
			path = await downloadFileFn(path);
		}
		// console.log(path,'地址')

		wx.getFileSystemManager().readFile({
			filePath:path,
			encoding:'base64',
			success: async res=>{ 
				// console.log(obj.type,'图片类型')
				let base64=`data:image/${obj.type};base64,${res.data}`;
				resolve(base64)
			}
		});
	})
}
//将图片下载到本地
const downloadFileFn=(url)=>{
	return new Promise ((resolve,reject)=>{
		wx.downloadFile({
			url,
			success(res) {
			  resolve(res.tempFilePath)
			},
			fail:err=>{
				reject(err)
			}
		})
	})
}
//canvas  压缩
const convertImgToBase64Fn=async (obj) =>{ 
  obj.minW     = obj.minW || 750,
  obj.minH     = obj.minH || 1334;
  obj.num 	   = obj.num || 1;
  var cvsw,cvsh;

  //横向 图
  if(obj.oldW > obj.oldH){
    cvsh = obj.oldH > obj.minH ? obj.minH : obj.oldH;
    cvsw = cvsh / obj.oldH * obj.oldW
  } //纵向图
  else if(obj.oldW < obj.oldH){
    cvsw = obj.oldW > obj.minW ? obj.minW : obj.oldW;
    cvsh = cvsw / obj.oldW * obj.oldH
  } //正方形
  else if(obj.oldW == obj.oldH && obj.oldW > obj.minW){
    cvsw = obj.minW;
    cvsh = obj.minH;
  } //不必重置宽高
  else {
    cvsw = obj.oldW;
    cvsh = obj.oldH;
  }
  //对宽高 进行取整
  cvsw = parseInt(cvsw);
  cvsh = parseInt(cvsh);

  //设置canvas画布大小
  // console.log(cvsw,cvsh,'设置canvas画布大小');

  let dataURL = await canvasToTempFilePathFn({...obj,cvsw,cvsh});
  console.log(dataURL.substring(0,50),'输出压缩后最终地址')
  return dataURL;
}
//将base64 判断大小
const getBase64SizeFn=(base64url) =>{
  //获取base64图片大小，返回KB数字
  var strLength =base64url.length;
  var fileLength = parseInt(strLength - (strLength / 8) * 2);
  // 由字节转换为KB
  var size = "";
  size = (fileLength / 1024).toFixed(2);
  return parseInt(size) *1;
}
//获取图片信息
const getImageInfoFn=(url)=>{
  // console.log(url,'去获取图片信息')
  return new Promise((resolve)=>{
    wx.getImageInfo({
      src: url,
      success:  (res)=> {
        // console.log(res.path,'图片信息')
        resolve(res)
      }
    });
  })
}
//绘制画布，并返回图片地址
const canvasToTempFilePathFn=(obj)=>{
  return new Promise((resolve,reject)=>{
    const ctx = wx.createCanvasContext(obj.canvasId);
    // console.log(obj.num,obj.type,'压缩开始')
    console.log("现在的大小：高："+obj.oldH+"===="+obj.oldW)
    ctx.drawImage(obj.path, 0, 0, obj.oldW, obj.oldH);
    ctx.draw(false, setTimeout(()=>{
      wx.canvasToTempFilePath({
        canvasId	:obj.canvasId,
        fileType	:obj.type,
        quality		:obj.num,
        width		:obj.oldW,
        height		:obj.oldH,
        destWidth	:obj.cvsw,
        destHeight	:obj.cvsh,
        success: async (res1) =>{
          //转换为base64
          // console.log('去将压缩后的地址转base64')
          let base64  = await getFileSystemManagerFn({
            path:res1.tempFilePath,
            type:obj.type
          });
          base64 = base64.replace(/[\r\n]/g, "");
          // console.log('去后去压缩后的base64大小')
          let imgSize = getBase64SizeFn(base64);
          
          if( imgSize >= obj.limitNum  && obj.num >0.6){
            // console.log(imgSize,'图片过大，继续压缩')
            obj.num = obj.num  - 0.2 ;
            obj.num = obj.num.toFixed(2) *1;
            //重置图片格式
            if(obj.type =='png' || obj.type =='PNG'){
              obj.type  ='png'
            } else{
              obj.type  ='jpg'
            }
            //继续压缩
            canvasToTempFilePathFn({...obj}).then((res2)=>{
            resolve(res2)
            });
          } else{
            // console.log(imgSize,'最终压缩后图片大小')
            resolve(base64)
          }
        }, 
        fail: function (e) {
          // console.log('失败')
          reject(e)
        }
      })
    },200));
  })
}

module.exports={
  urlTobase64Fn
}
