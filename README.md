# toaster

Small, dependency-free toast notifications for websites.

It supports:

- `top-left`
- `top-right` (default)
- `bottom-left`
- `bottom-right`

You can configure the message, colors, icon, duration, spacing, and close behavior.

Default timeout: `4000ms` (4 seconds). Set `duration: 0` to keep a toast open until it is dismissed.

## Preview

Use it for UI feedback such as:

- `Thread updated successfully.`
- `We could not save your changes.`
- `A new version is available.`
- `Your session expires soon.`

## Install as a package

```bash
npm install @handyjskit/toaster
```

### ESM usage

```js
import toaster, { createToaster } from "@handyjskit/toaster";

toaster.success("Thread updated successfully.");

const adminToaster = createToaster({
  position: "bottom-left",
  duration: 6000
});

adminToaster.show({
  message: "New moderation event received.",
  type: "info"
});
```

### CommonJS usage

```js
const toaster = require("@handyjskit/toaster");

toaster.error("Something went wrong.");
```

## Embed the minified version

Use the generated `dist/toaster.min.js` directly:

```html
<script src="./dist/toaster.min.js"></script>
<script>
  Toaster.success("Saved");
  Toaster.warning("Careful", { position: "bottom-right" });
</script>
```

If you publish to npm or a CDN, point to `dist/toaster.min.js`.

### Browser embed sample

```html
<!doctype html>
<html lang="en">
  <body>
    <button id="notify">Show toast</button>

    <script src="https://unpkg.com/@handyjskit/toaster/dist/toaster.min.js"></script>
    <script>
      document.getElementById("notify").addEventListener("click", function () {
        Toaster.success("Profile updated successfully.");
      });
    </script>
  </body>
</html>
```

## API

### Default singleton

```js
import toaster from "@handyjskit/toaster";

toaster.show("Plain message");
toaster.success("Saved");
toaster.error("Failed");
toaster.info("Heads up");
toaster.warning("Check this");
```

### Quick samples

```js
import toaster from "@handyjskit/toaster";

toaster.success("Saved successfully.");
toaster.error("Upload failed.");
toaster.info("New message received.");
toaster.warning("Storage is almost full.");
```

### Custom instance

```js
import { createToaster } from "@handyjskit/toaster";

const customToaster = createToaster({
  position: "top-left",
  duration: 5000,
  closeButton: true,
  pauseOnHover: true,
  maxVisible: 4,
  offset: {
    edge: 24,
    gap: 12
  }
});

customToaster.show({
  message: "Deployment completed.",
  type: "success"
});
```

### Position samples

```js
import toaster from "@handyjskit/toaster";

toaster.show("Top right is the default.");
toaster.show("Top left toast", { position: "top-left" });
toaster.show("Bottom left toast", { position: "bottom-left" });
toaster.show("Bottom right toast", { position: "bottom-right" });
```

### `show(message, options)` or `show({ ...options })`

Options:

- `message`: string
- `type`: `success`, `error`, `info`, `warning`, `neutral`
- `position`: `top-left`, `top-right`, `bottom-left`, `bottom-right`
- `duration`: number in milliseconds, use `0` to keep the toast open
- `icon`: custom HTML string, or `false` to hide it
- `color`: text/icon color
- `background`: background color
- `borderColor`: border color
- `closeButton`: boolean

### Custom color and icon sample

```js
import toaster from "@handyjskit/toaster";

toaster.show({
  message: "Custom branded notification.",
  position: "top-left",
  color: "#1d4ed8",
  background: "#eff6ff",
  borderColor: "#93c5fd",
  icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 2 7l10 5 10-5zm0 7L2 14l10 5 10-5z"/></svg>'
});
```

### Persistent toast sample

```js
import toaster from "@handyjskit/toaster";

const notice = toaster.warning("Connection looks unstable.", {
  duration: 0
});

setTimeout(() => {
  notice.dismiss();
}, 5000);
```

### Change the timeout

```js
import toaster, { createToaster } from "@handyjskit/toaster";

toaster.success("Saved with a 6 second timeout.", {
  duration: 6000
});

const slowToaster = createToaster({
  duration: 8000
});

slowToaster.info("This instance uses an 8 second default timeout.");
```

## Custom type colors

```js
const toaster = createToaster({
  types: {
    success: {
      color: "#065f46",
      background: "#ecfdf5",
      borderColor: "#6ee7b7"
    }
  }
});
```

## Browser global

When loaded from `dist/toaster.js` or `dist/toaster.min.js`, a global `Toaster` object is available:

```js
Toaster.toast("Hello");
Toaster.success("Saved");
Toaster.createToaster({ position: "bottom-left" });
```

## Local demo

Use the built-in demo script to rebuild the package and serve the example page automatically:

```bash
npm run demo
```

Then open `http://127.0.0.1:4173/demo/` in your browser.

The demo page lives at `demo/index.html`, and `npm run demo` will rebuild `dist/` before starting the local server.

## Publish

```bash
npm run build
npm publish --access public
```
