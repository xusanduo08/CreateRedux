export function counter(m){
    return new Promise((resolve, reject) => {
        setTimeout(()=> {
            resolve(m);
        }, m)
    })
}