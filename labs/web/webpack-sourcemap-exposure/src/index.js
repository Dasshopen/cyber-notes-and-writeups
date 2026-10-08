import { getInternalMessage } from "./internal";

function main() {
  const app = document.createElement("main");

  const title = document.createElement("h1");
  title.textContent = "Webpack Source Map Exposure Lab";

  const text = document.createElement("p");
  text.textContent = "Inspect the generated bundle and its source map.";

  app.appendChild(title);
  app.appendChild(text);

  // Used so internal.js is included in the bundle.
  console.debug(getInternalMessage());

  document.body.appendChild(app);
}

main();
