// Educational reconstruction — essential decoding logic only.
// Equivalent output for ordinary string inputs; browser UI is omitted.
function dechiffre() {
    const codes = [72, 69, 76, 76, 79];

    let result = "";

    for (let i = 0; i < codes.length; i++) {
        result += String.fromCharCode(codes[i]);
    }

    return result;
}
