# JavaScript Obfuscation Analysis

An educational study of confusing JavaScript, automated readability improvements, and manual data-flow analysis.

> **Educational reconstruction — not the original challenge source.** All character data below is a public teaching example. This exercise concerns understanding program behavior; it is not a real authentication bypass. The original platform and its password are intentionally omitted.

## 01 — Introduction

JavaScript obfuscation changes the presentation of a program to make its behavior harder to understand. Short variable names, nested assignments, encoded strings, redundant operations, and unusual control flow can hide a simple operation inside confusing syntax. Developers sometimes use it to discourage casual copying, conceal implementation details, or increase the effort needed to inspect shipped code.

Obfuscation is different from encryption. Encryption protects data using a cryptographic construction and a key. An obfuscated browser program still needs to execute on the user's device, where its instructions and embedded data can be inspected. Encoding characters as numbers does not make them cryptographic secrets.

For cybersecurity analysis, readable code is only the starting point. An analyst must distinguish meaningful operations from distractions and trace which values actually reach an output. Obfuscation can conceal network calls or dynamic execution, but it can also make harmless code look more complicated than it is.

My goal in this exercise was to understand deliberately confusing JavaScript. I initially struggled with its variables and loops. Using Webcrack and then tracing the assignments manually helped me see that the script built a fixed message rather than checking a password.

## 02 — Tools and Environment

| Tool | Purpose | Role in this exercise |
| --- | --- | --- |
| Kali Linux | Analysis environment | Used in the original analysis |
| Node.js | JavaScript runtime | Required for the npm/Webcrack workflow; historical version not recorded here |
| npm | JavaScript package manager | Used in the original analysis |
| Webcrack | JavaScript deobfuscation | Used in the original analysis |
| VS Code | Source code inspection | Additional recommended editor; not claimed as originally used |
| Browser DevTools | JavaScript inspection and debugging | Optional future practice |
| Prettier | JavaScript formatting | Optional additional tool |
| Git | Version control | Recommended for maintaining the portfolio; not claimed as part of the original analysis |

The Linux commands below document a reproducible workflow for the reported Kali/npm/Webcrack analysis. They are not a verbatim terminal recording. No historical tool versions, screenshots, or exact Webcrack output have been reconstructed as evidence. The included `deobfuscated.js` is explicitly a **manual normalization**, while `simplified.js` expresses the essential logic.

## 03 — Environment Setup

### Check Node.js and npm

```bash
node --version
npm --version
```

`node --version` prints the installed Node.js version. Node.js executes JavaScript outside the browser. `npm --version` prints the package manager version; npm installs and manages JavaScript packages.

### Install Node.js and npm on Kali if missing

```bash
sudo apt update
sudo apt install nodejs npm
```

`sudo` requests administrative privileges. `apt update` refreshes package metadata; it does not upgrade every installed package. `apt install nodejs npm` installs the named packages and required dependencies.

The Kali repository versions may not satisfy the current Webcrack release. Check the [official Webcrack installation requirements](https://github.com/j4k0xb/webcrack#readme) before installing it; its native `isolated-vm` dependency also constrains runtime compatibility. Do not treat an unrecorded historical version as a current recommendation.

### Install Webcrack

```bash
npm install -g webcrack@latest
```

| Part | Meaning |
| --- | --- |
| `npm` | Invoke the package manager |
| `install` | Install a package |
| `-g` | Install globally, outside this project's dependency list |
| `webcrack@latest` | Select the release carrying the `latest` tag at installation time |

Global installation needs a writable npm global prefix and an appropriate permissions configuration. Avoid using elevated installation privileges as a default workaround. `@latest` changes over time: record `webcrack --version` for repeatable comparisons.

Some npm versions or configurations may warn that an installation script for `isolated-vm` was blocked. That dependency can need native compilation. Review the package, dependency provenance, install/build scripts, runtime compatibility, and applicable npm permission policy before selectively allowing a required script. Do not blindly allow all installation scripts or copy another package manager's approval flags into npm. See [npm's installation documentation](https://docs.npmjs.com/cli/install/).

### Check the installation

```bash
webcrack --version
webcrack --help
```

The first command prints the installed version. The second lists supported options and usage. Consult it when a flag or behavior differs between releases.

## 04 — Preparing the JavaScript File

### Create a working directory

```bash
mkdir -p ~/js-analysis
cd ~/js-analysis
```

`mkdir` creates a directory. `-p` creates missing parent directories and accepts an existing directory. `~` refers to the current user's home directory. `cd` changes the shell's working directory.

### Create and inspect the file

```bash
nano challenge.js
cat challenge.js
node --check challenge.js
```

`nano` opens a terminal editor. Copy only the relevant JavaScript into `challenge.js`, without HTML `<script>` tags. For a public reproduction, use the anonymized example in Section 05. Save with Ctrl+O, confirm the filename, and exit with Ctrl+X.

`cat` prints the file. `node --check` checks JavaScript syntax **without executing the program**, as documented in the [Node.js CLI reference](https://nodejs.org/api/cli.html#-c---check). A successful check normally prints nothing; a syntax error produces a diagnostic and a nonzero exit status.

Do not directly execute untrusted JavaScript just because its syntax is valid. It may perform filesystem operations, start processes, or contact remote services. Deobfuscation tools can also evaluate supported patterns internally, so unknown samples should be processed in a disposable environment without sensitive files or credentials.

The exercise includes browser functions, `window.prompt()` and `alert()`. Node.js does not provide them natively. A successful syntax check does not mean that `node challenge.js` will work: it reaches `window` and fails in an ordinary Node.js environment.

## 05 — Initial Obfuscated JavaScript

**Educational reconstruction — not the original challenge source.** This is also available in [`examples/obfuscated.js`](examples/obfuscated.js).

```javascript
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
```

The names suggest decoding a submitted password, but names are not evidence of what the function does. Its output must be established by following the assignments.

## 06 — Deobfuscation Using Webcrack

```bash
webcrack challenge.js
webcrack challenge.js > clean.js
cat clean.js
diff -u challenge.js clean.js
```

The first command attempts to deobfuscate and unminify the script, printing readable code. The second redirects standard output into `clean.js`; `>` creates the file or overwrites an existing file. It does not mean “append.” Webcrack's diagnostics use standard error, which is separate from the redirected code. `cat` displays the result and `diff -u` produces a unified comparison with context and added/removed lines. A `diff` exit status of 1 means differences were found, not necessarily a tool failure. These invocation forms follow the [official CLI documentation](https://webcrack.netlify.app/docs/guide/cli).

In a comparison, look for removed unnecessary parentheses, reformatted variable declarations, improved indentation, and simplified expressions. The exact transformations depend on the tool version and input. These are interpretation guides, not a fabricated list of changes from a preserved historical run.

Webcrack does not explain every misleading assignment or automatically recover the author's intent. Even readable output can retain pointless reads and confusing loop logic. The file [`examples/deobfuscated.js`](examples/deobfuscated.js) is a manually normalized intermediate example, **not a captured Webcrack result**. For example, it makes the reassignment explicit:

```javascript
o = tab[i - l];
o = tab2[i];
p += String.fromCharCode(o);
```

### Additional technique: unpack supported bundles

```bash
webcrack --help
webcrack bundle.js -o unpacked
```

`-o` selects an output directory for unpacked files. This is useful for supported Webpack or Browserify bundles, where one generated file contains multiple modules. It is an additional technique, not a step performed in the original exercise. Use a fresh directory and inspect the extracted files rather than assuming every bundle format is supported.

## 07 — Manual JavaScript Analysis

### Variables and initial values

```javascript
var i, j, k, l = 0, m, n, o, p = "";
```

This declares function-scoped variables. Only `l` and `p` are initialized in this statement: `l` is the number `0`, and `p` is an empty string. `i`, `j`, `k`, `m`, `n`, and `o` initially contain `undefined`. The initializer following one name does not initialize every preceding name. During analysis, note each value's type and first meaningful assignment. Here `m` is never used.

### Function parameters and arguments

```javascript
function dechiffre(pass_enc) {
    // Function body
}
```

`pass_enc` is a **parameter**, a local name receiving a supplied value. In `dechiffre("49,50,51")`, the string is an **argument**. At execution, the function binds that argument to `pass_enc`. Its name does not establish encryption or password validation; the body determines how the input is used.

### Splitting strings

```javascript
var tab = pass_enc.split(",");
var tab2 = pass.split(",");
```

`split` returns an array of substrings separated at commas. For the example argument, `tab` becomes `["49", "50", "51"]`. The hardcoded `pass` becomes `["72", "69", "76", "76", "79"]` in `tab2`. These are strings, not numbers yet. Distinguishing the user-derived array from the hardcoded array is essential to tracing input influence.

### Array lengths and indexes

```javascript
j = tab.length;
n = tab2.length;
```

With the example argument, `j` initially becomes `3` and `n` becomes `5`. Array indexes start at zero, so a five-element array has indexes `0` through `4`. Reading an absent index in these ordinary arrays yields `undefined`; it does not itself throw an out-of-bounds exception. Later assignments overwrite `j`, so its initial value does not remain the loop bound.

### Chained assignments

```javascript
i = o = 0;
k = j = n;
```

Assignments group from right to left: `o` receives `0`, then `i` receives that value. In the second statement, `j` receives the current value of `n`, and `k` receives the same value. Assignment expressions also evaluate to their assigned value. Thus `k = j = n` can be embedded in a comparison while changing two variables.

The preparatory expression also hides an assignment:

```javascript
k = j + (l) + (n = 0);
n = tab2.length;
```

First, `n` is assigned `0`; with `l = 0`, `k` temporarily receives the input array length. Then `n` becomes `5`. Before the first loop body, the condition replaces both `j` and `k` with `5`. Their earlier values do not determine the produced message.

### Loop control

```javascript
for (i = o = 0; i < (k = j = n); i++) {
    // Loop body
}
```

The initializer runs once, setting `i` and `o` to zero. Before each iteration, the condition assigns `n` to `j` and `k`, then compares `i` with that value. If true, the body runs; afterward, `i++` increments the index by one. In this reconstruction the bound is `5`, determined by the hardcoded array. Tracking the index, the assignment inside the condition, and early exits is more reliable than reading the loop as a conventional input-length loop.

### Character conversion

```javascript
String.fromCharCode(tab2[i]);
```

The function converts supplied values to UTF-16 code units and returns a string. Numeric strings such as `"72"` are converted to numbers; code unit `72` is `H`. The safe example uses ASCII values, which are also the corresponding Unicode/UTF-16 values. This is not a general decoder for every Unicode code point: supplementary characters require surrogate pairs or `String.fromCodePoint()`. Recognizing coercion explains why the string entries work. See [MDN's character conversion reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCharCode).

### Concatenating the result

```javascript
p += String.fromCharCode(tab2[i]);
```

Because `p` is a string, `+=` appends the returned character. It is equivalent here to assigning `p = p + character`. Following the accumulated value reveals the output:

| Stage | Index supplying a character | Decimal code | Character | Accumulated `p` |
| --- | --- | --- | --- | --- |
| First loop | 0 | 72 | H | `H` |
| First loop | 1 | 69 | E | `HE` |
| First loop, then `break` | 2 | 76 | L | `HEL` |
| Second loop, condition true | 3 | 76 | L | `HELL` |
| Final append | 4 | 79 | O | `HELLO` |

### Conditions and logical AND

```javascript
if (i > 2 && i < k - 1) {
    p += String.fromCharCode(tab2[i]);
}
```

`&&` evaluates its right operand only if the left is truthy. Both comparisons must be true to enter this body. With `k = 5`, the condition is `i > 2 && i < 4`, so only `i = 3` appends a character. The second loop still visits indexes `0` through `4`; most visits append nothing. This separates loop iterations from meaningful output operations.

### Exiting a loop

```javascript
for (i = 0; i < 5; i++) {
    // Output-producing statements precede this condition in the example.
    if (i == 2) break;
}
```

After appending index `2`, `break` terminates the current loop. It does not exit the whole function, and the second loop still runs. `==` permits type coercion, although `i` is already numeric here; `===` would produce the same comparison result for this trace.

### Returning a value

```javascript
function returnConstructedMessage(p) {
    var pass = p;
    return pass;
}
```

This standalone teaching wrapper illustrates the original function's final `pass = p; return pass;` statements. In the original, the assignment replaces the encoded string in `pass` with the constructed message. `return` exits the function and gives that value to its caller. These statements are equivalent to `return p` for this function. No comparison with the submitted input occurs.

## 08 — Identifying Misleading Operations

```javascript
o = tab[i - l];
p += String.fromCharCode((o = tab2[i]));
```

The first statement reads the user-derived array. Since `l = 0`, it reads `tab[i]`. Immediately afterward, the assignment inside `fromCharCode` overwrites `o` with `tab2[i]`. The value from `tab` never reaches the conversion. In the second loop, only the iteration passing its condition performs the replacement and append; the other reads still contribute nothing to `p`.

| Category | Example | Effect in this reconstruction |
| --- | --- | --- |
| Input read | `o = tab[i - l]` | Reads input-derived data, then discards it or leaves it unused |
| Output dependency | `o = tab2[i]` | Supplies the hardcoded value used by conversion |
| Redundant state | Initial values of `j` and `k` | Overwritten before controlling an output-producing iteration |
| Unused declaration | `m` | No effect on the message |

Data being read is different from data influencing the result. This is a useful form of data-flow reasoning: work backward from `p` to the values used to construct it, then determine whether any of those values depend on the input.

There is an important limit to calling the input “ignored”: the original still calls `pass_enc.split`. Ordinary string inputs reach the fixed message, including an empty string. Canceling `window.prompt()` returns `null`, which causes a `TypeError` at `.split` before the alert. Input can therefore affect successful execution without determining the message's characters.

### The additional misleading conversion

```javascript
String["fromCharCode"](dechiffre("49,50,51"));
```

Bracket access selects the same method as `String.fromCharCode`. The inner function returns `"HELLO"`, which the outer conversion treats as a numeric argument, not as text to pass through. Numeric conversion yields `NaN`, which becomes code unit zero here, producing a one-character `"\u0000"` string. The expression's result is discarded. It is not the alert's output and does not check a password. Later, `alert(dechiffre(h))` displays the function's returned message directly.

## 09 — Understanding the Hidden Character Encoding

```javascript
const codes = [72, 69, 76, 76, 79];
const message = codes.map(code => String.fromCharCode(code)).join("");
```

Each decimal value specifies a character code unit. Conversion and joining produce `HELLO`. The hardcoded number sequence is an encoding of the teaching message, not encryption.

The same message can be written using hexadecimal string escapes:

```javascript
"\x48\x45\x4c\x4c\x4f";
```

Decimal `72` and hexadecimal `48` represent the same number. In the array example, runtime code converts numeric values. In the string literal, the JavaScript parser interprets each `\xHH` escape, so the resulting string already contains the characters. `\x` takes two hexadecimal digits; it is not a general arbitrary-length Unicode escape.

### Optional CyberChef method

1. Open the [official CyberChef application](https://gchq.github.io/CyberChef/).
2. Paste the public comma-separated sequence `72,69,76,76,79`.
3. Select a decimal character decoding operation, such as **From Charcode**, and configure decimal input and comma delimiters as appropriate for the interface version.
4. Verify that the result is `HELLO`, checking individual codes manually.

CyberChef was not used in the original analysis. Do not paste private challenge data or credentials into a hosted tool merely to obtain a demonstration screenshot.

## 10 — Simplified JavaScript

**Educational reconstruction — essential logic only.** Also available in [`examples/simplified.js`](examples/simplified.js).

```javascript
function dechiffre() {
    const codes = [72, 69, 76, 76, 79];

    let result = "";

    for (let i = 0; i < codes.length; i++) {
        result += String.fromCharCode(codes[i]);
    }

    return result;
}
```

One loop replaces two loops and a final append. Clear names replace temporary variables; unnecessary conditions, overwritten assignments, and the unused parameter are removed. The function simply returns `HELLO`. It performs no authentication.

For ordinary string inputs, all three example functions return the same message. The simplified version is an explanation of the essential decoding, not complete behavioral equivalence for all possible JavaScript values: it no longer calls `.split`, so it does not reproduce the `null`/non-string error. It also omits the prompt, alert, and discarded outer conversion.

## 11 — Optional Tools and Commands

Everything in this section is additional practice, not an activity claimed as performed during the original analysis.

### Prettier

```bash
npm install --save-dev prettier
npx prettier challenge.js > formatted.js
```

The first command adds Prettier as a development dependency in the working project. The second invokes the installed formatter and redirects formatted code into a separate file. Prettier standardizes whitespace and presentation; it does not perform advanced deobfuscation or prove what a program does. See the [official Prettier CLI documentation](https://prettier.io/docs/cli).

### Search with grep

```bash
grep -n "fromCharCode" challenge.js
grep -n "eval" challenge.js
grep -n "atob" challenge.js
grep -n "fetch" challenge.js
```

`-n` prints matching line numbers. `fromCharCode` suggests character transformations; `eval` can execute JavaScript from a string; `atob` decodes Base64 into a binary string; `fetch` can make HTTP requests. Matches may be comments or substrings, and aliases can hide calls from simple searches. These are investigation clues, not proof of malicious behavior. A no-match `grep` normally exits with status 1.

### Inspect the file

```bash
file challenge.js
wc -l challenge.js
head -n 20 challenge.js
tail -n 20 challenge.js
```

| Command | Purpose |
| --- | --- |
| `file` | Infer file type from its content; not a security verdict |
| `wc -l` | Count newline characters, commonly used as a line count |
| `head -n 20` | Display the first 20 lines |
| `tail -n 20` | Display the last 20 lines |

### Browser DevTools: recommended future practice

For a reviewed, local reconstruction, open developer tools with F12, open the **Sources** tab (or the browser's equivalent), locate the JavaScript, and inspect it. Set a breakpoint before an assignment, observe `tab`, `tab2`, `o`, and `p`, then step through the function calls. Compare the observed values with the static trace table.

Debugging complements static analysis by showing a particular execution path. One observed run does not prove behavior for every input. I did not perform DevTools debugging during the original exercise; this is a recommended next method.

## 12 — Security Findings

| Finding | Observation | Interpretation |
| --- | --- | --- |
| 1 — Misleading user input | The prompt accepts input, but output-producing conversions use `tab2` | Ordinary string input does not determine the displayed message; invalid input can still cause an error |
| 2 — Hardcoded character data | Codes are embedded directly in the source | The message is recoverable through static inspection |
| 3 — Redundant operations | Input reads and several temporary assignments do not contribute to `p` | Trace dependencies rather than assuming every line matters |
| 4 — No real authentication | No submitted-password comparison or server validation exists | A password prompt is not evidence of authentication |
| 5 — Insufficient client-side protection | The browser receives the encoded data and reconstruction logic | Obfuscation cannot reliably protect embedded secrets; real authorization must be enforced on a trusted server |

No vulnerability severity score is assigned. This is intentionally confusing educational code, not a claim of compromising a production system.

## 13 — Lessons Learned

At first, I found the code difficult to follow because several variables changed inside expressions, and the loops looked as if they depended on the submitted input. Webcrack helped make the structure easier to inspect, but I still needed to reason through the values manually.

I learned to follow variables through a function, distinguish parameters from arguments, read array indexes, and analyze loop initialization, conditions, increments, and early exits. Tracking the reassignment of `o` was the key step: the value read from the user-derived array was overwritten before conversion.

Character-code conversion then explained how the result was constructed. Simplifying the function helped me check my understanding rather than merely produce prettier code. This exercise moved me from recognizing JavaScript syntax toward explaining its behavior. It does not establish expertise in every obfuscation technique, but it gave me a method I can reuse: improve readability, trace data dependencies, and check conclusions against concrete values.

## Validation and Evidence Boundaries

The published examples are reconstructions created for this write-up. Local validation of these files is separate from the original Kali analysis. Syntax checking can include the browser-oriented examples without executing their UI; behavior checks require either an actual browser or explicitly supplied prompt/alert stand-ins. Such stand-ins are test fixtures, not a recreation of browser security behavior.

Representative string inputs are `"49,50,51"`, `""`, `"1"`, `"abc"`, and `"72,69,76,76,79"`. Their expected result is `HELLO` in all three functions. The original and normalized browser scripts should each display that same result when a stand-in prompt supplies those strings. Cancel behavior is deliberately outside the simplified function's equivalence claim.

Publication checks performed on October 9, 2026, using Node.js `v24.18.0`:

| Check | Result |
| --- | --- |
| Three example files, `node --check` | Passed |
| Nineteen JavaScript code blocks, syntax parsing | Passed |
| Five ordinary string inputs across three functions | All 15 cases returned `HELLO` |
| Browser-oriented examples with prompt/alert stand-ins | Each displayed `HELLO` for the five strings |
| Cancel input in the two browser-oriented examples | Both threw at `.split`, as documented |
| Discarded outer character conversion | Returned a string containing code unit zero |
| Eleven Bash blocks, `bash -n` | Parsed successfully; installation commands were not executed |
| Main README and screenshot plan | Rendered to HTML with Markdown-it; tables, fences, and local links checked |

These checks validate the reconstruction and documentation. They are not historical results from the original exercise, a visual browser review, or a rerun of Webcrack.

Commands have been checked against their intended shell semantics and official documentation where appropriate. Installing Kali packages and rerunning the original Webcrack session are not claimed as part of this publication validation. No screenshot or original tool transcript is included. Only the supplied public teaching data is reproduced; no original challenge source or password is imported.

## Official Resources

- [Webcrack documentation](https://webcrack.netlify.app/docs/guide/) and [CLI reference](https://webcrack.netlify.app/docs/guide/cli)
- [MDN JavaScript documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Node.js documentation](https://nodejs.org/docs/latest/api/)
- [npm documentation](https://docs.npmjs.com/)
- [Prettier documentation](https://prettier.io/docs/)
- [CyberChef](https://gchq.github.io/CyberChef/)

## 14 — Quick Reference — Cheat Sheet

| Syntax / Command | Meaning |
| --- | --- |
| `var` | Function-scoped variable declaration in this example |
| `let` | Block-scoped variable declaration |
| `const` | Binding that cannot be reassigned; referenced objects can still be mutable |
| `function` | Function declaration |
| `.split(",")` | Split a string into an array of substrings |
| `.length` | Number of array elements, not the last index |
| `i++` | Increment by one |
| `+=` | Add or concatenate, then assign |
| `===` | Strict equality without coercion |
| `&&` | Logical AND with short-circuit evaluation |
| `break` | Exit the current loop |
| `return` | Exit the function and return a result |
| `String.fromCharCode()` | Convert values to UTF-16 code units and return their string |
| `webcrack input.js` | Attempt deobfuscation and readability improvements |
| `node --check file.js` | Check syntax without executing the program |
| `diff -u` | Compare files using a unified diff |
| `grep -n` | Search text and print matching line numbers |
