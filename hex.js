function hex(i, width) {
    return i.toString(16).toUpperCase().padStart(width, '0')
}

console.log(hex(123, 6))
console.log(now())
console.log(nowAsName())
