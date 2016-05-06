function findC(a1, b1, a2, b2) {
    return Math.sqrt(Math.pow(a2 - a1, 2) + Math.pow(b2 - b1, 2))
}

function findA(a1, a2, c) {
    return Math.sqrt(Math.pow(c, 2) + Math.pow(a2 - a1, 2))
}