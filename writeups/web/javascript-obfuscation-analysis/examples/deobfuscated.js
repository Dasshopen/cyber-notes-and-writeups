// Educational reconstruction — manually normalized for this write-up.
// This is not captured Webcrack output or the original challenge source.
function dechiffre(pass_enc) {
    var pass = "72,69,76,76,79";
    var tab = pass_enc.split(",");
    var tab2 = pass.split(",");
    var i, j, k, m, n, o;
    var l = 0;
    var p = "";

    i = 0;
    j = tab.length;
    n = 0;
    k = j + l + n;
    n = tab2.length;

    for (i = o = 0; i < (k = j = n); i++) {
        o = tab[i - l];
        o = tab2[i];
        p += String.fromCharCode(o);
        if (i == 2) break;
    }

    for (i = o = 0; i < (k = j = n); i++) {
        o = tab[i - l];
        if (i > 2 && i < k - 1) {
            o = tab2[i];
            p += String.fromCharCode(o);
        }
    }

    p += String.fromCharCode(tab2[4]);
    pass = p;
    return pass;
}

String.fromCharCode(dechiffre("49,50,51"));
var h = window.prompt("Enter password");
alert(dechiffre(h));
