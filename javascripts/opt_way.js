function findA(a1, a2, c) {
    return Math.sqrt(Math.pow(c, 2) + Math.pow(a2 - a1, 2))
}

function findB(a1, a2) {
    return a2 - a1;
}

function findC(p1, p2) {
    var a1= p1.toJSON().lat, b1 = p1.toJSON().lng, a2 = p2.toJSON().lat, b2 = p2.toJSON().lng;
    return Math.sqrt(Math.pow(a2 - a1, 2) + Math.pow(b2 - b1, 2))
}

function optimize() {
    var my_way = [];
    way.forEach(function(e, i) {
        if(i != way.length - 1) {
            var c = findC(e, way[i + 1]);
            if(c > 0.02) {
                // Заменять большие на куски поменьше
                while(c > 0.02) {
                    //var new_step = 
                }
            } else if(c < 0.003) {
                // удалять маленькие куски, но смотреть чтобы со следующим не был слишком большим, мб сделать рекурсивно
            } else {
                my_way.push(e);
            }
        }
    })
}