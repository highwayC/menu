/*函数节流*/
// 节约触发的频率。单位时间n秒内，第一次触发函数并执行，以后 n秒内不管触发多少次，都不执行。直到下一个单位时间n秒。
//用处：多用于页面scroll滚动，或者窗口resize，或者防止按钮重复点击等情况
const throttle = function(fn, interval){
  let enterTime = 0;//触发的时间
  let gapTime = interval || 300 ;//间隔时间，如果interval不传，则默认300ms
  return function() {
    let context = this;
    let backTime = new Date();//第一次函数return即触发的时间
    if (backTime - enterTime > gapTime) {
      fn.apply(context,[...arguments,this]);
      enterTime = backTime;//赋值给第一次触发的时间，这样就保存了第二次触发的时间
    }
  };
}

/*函数防抖*/
// 函数防抖： 防止重复触发。延迟函数执行。即不管debounce函数触发了多久，只在最后一次触发debounce函数时，才定义setTimeout，到达间隔时间再执行 需要防抖的函数。
//用处：多用于 input 框 输入时，显示匹配的输入内容的情况
const debounce = (fn, interval)=> {
  var timer;
  var gapTime = interval || 200;//间隔时间，如果interval不传，则默认1000ms
  return function() {
    clearTimeout(timer);
    var context = this;
    var args = arguments;//保存此处的arguments，因为setTimeout是全局的，arguments不是防抖函数需要的。
    timer = setTimeout(function() {
      fn.call(context,args);
    }, gapTime);
  };
}

module.exports={
  throttle,
  debounce
}

