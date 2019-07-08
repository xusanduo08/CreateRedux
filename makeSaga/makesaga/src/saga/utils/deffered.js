export default function deffered(){
  let def = {};
  def.promise = new Promise((resolve, reject) =>{
    def.resolve = resolve;
    def.reject = reject;
  })
  return def;
}