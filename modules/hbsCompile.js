let hbs = require('hbs');

let render = function (text, data) {
    let h = hbs.handlebars;
    const template = h.compile(text);


    let a = template(data);
    return a;

}

module.exports = render;