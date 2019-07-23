export const enmuCreater = (arr) => {
  const obj = {};
  arr.forEach((item, index) => {
    if(!obj[item]) {
      obj[item] = index;
      obj[index] = item;
    }
  });
  return obj;
};
