const processFood =(arr)=>{
  for(let i in arr) {
    arr[i].show=false;
    arr[i].food=foodMake(arr[i])
  }

  return arr
}
//将食材数据进行处理 
const foodMake=(data)=>{
  let food=[];
  data.food.forEach(item=>{
    food.push(item.foodName)
  })
  return food.toString();
}

module.exports={
  processFood
}