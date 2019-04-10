export function softmax(arr: number[]) {
    return arr.map(function(value: number, index: number) {
        return Math.exp(value) / arr.map( function(y){ return Math.exp(y) } ).reduce( function(a,b){ return a+b })
    });
}

export function minMaxNormalisation(val: number, min: number, max: number) {
    return (val - min) / (max - min);
}
