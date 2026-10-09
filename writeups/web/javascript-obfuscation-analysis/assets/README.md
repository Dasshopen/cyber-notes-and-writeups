# Screenshot plan

No screenshots are included yet. Add only images captured during your own analysis, with captions stating whether they show the original workflow or a later demonstration using the educational reconstruction.

| Suggested filename | What to capture | Caption guidance |
| --- | --- | --- |
| `01-tool-versions.png` | `node --version`, `npm --version`, and `webcrack --version` | Record the environment and actual versions, not invented historical versions. |
| `02-reconstructed-source.png` | The anonymized source in an editor | Label it **Educational reconstruction — not the original challenge source.** |
| `03-syntax-check.png` | `node --check challenge.js` and its exit status | A successful check normally has no output; show the command and `echo $?` together. |
| `04-webcrack-comparison.png` | Actual tool output and `diff -u challenge.js clean.js` | Name the Webcrack version. Do not present the manually normalized example as tool output. |
| `05-variable-trace.png` | An annotation showing `o` overwritten by `tab2[i]` | Identify the input read, replacement value, and effect on `p`. |
| `06-browser-debugging.png` | A breakpoint and variable values in the reconstructed local example | Label as a later optional debugging demonstration, not part of the original analysis. |

Before adding images, remove the original platform name, URL, password, account details, tokens, unrelated browser tabs, and sensitive terminal history. Do not include an original challenge solution screenshot. Crop carefully without changing the meaning of the evidence.

Embed a real image in the main README only after the file exists, for example `![Actual Webcrack comparison](assets/04-webcrack-comparison.png)`, followed by an accurate caption. Until then, keep the write-up understandable through its code and trace tables.
