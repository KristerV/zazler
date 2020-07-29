let esc = v => ("'" + v.replace(/'/g, '\'\'') +  "'");

let t = "fo'o\nba'r"
console.log(t,"\n", esc(t));
