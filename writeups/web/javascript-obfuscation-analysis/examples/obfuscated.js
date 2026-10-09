// Educational reconstruction — not the original challenge source.
// The character data is a public teaching example, not a challenge secret.
function dechiffre(pass_enc) {
    var pass = "72,69,76,76,79";

    var tab = pass_enc.split(",");
    var tab2 = pass.split(",");

    var i, j, k, l = 0, m, n, o, p = "";

    i = 0;
    j = tab.length;

    k = j + (l) + (n = 0);
    n = tab2.length;

    for (i = (o = 0); i < (k = j = n); i++) {
        o = tab[i - l];

        p += String.fromCharCode((o = tab2[i]));

        if (i == 2) break;
    }

    for (i = (o = 0); i < (k = j = n); i++) {
        o = tab[i - l];

        if (i > 2 && i < k - 1) {
            p += String.fromCharCode((o = tab2[i]));
        }
    }

    p += String.fromCharCode(tab2[4]);

    pass = p;
    return pass;
}

String["fromCharCode"](dechiffre("49,50,51"));

var h = window.prompt("Enter password");

alert(dechiffre(h));
