String.prototype.toCamelCase = function(){
  var a = this.split(" ");
  for (i=0; i<a.length; i++){
    a[i] = a[i].charAt(0).toUpperCase() + a[i].substring(1,a[i].length).toLowerCase();
  }
  return a.join("");
};
Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}

function cloneObject(obj){
  var copy = {};
  for(var attr in obj){
    if(obj.hasOwnProperty(attr)){
      copy[attr]=obj[attr];
    }
  }
  return copy;
}
