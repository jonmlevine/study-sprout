# Open guest demo

Study Sprout requires **no account, password, invitation, or sign-in**. Anyone with access to the hosted URL can use the demo.

Choose **Try instant demo** to load sample biology notes and a working study plan immediately. A current sample is reused instead of adding another plan every click. Visitors can also use their own notes. Plans, quizzes, the Learning lab, recovery simulator, time-benefit measurements and pilot console work without a backend. Offline generation is rule-based, not a cloud AI call.

## Publish the ready-to-upload website

1. Open the `demo` folder inside the main `study-sprout` application folder, or extract `study-sprout-guest-demo.zip`.
2. Upload its contents to an HTTPS static website host. `index.html` must be at the published site's root (or the root of its project subdirectory). No build command, environment variables or server are required.
3. Turn off any **hosting-provider** password or team-only preview restriction if enabled. Study Sprout itself has none.
4. Share the resulting public URL. Add `?demo=instant` to open the sample immediately. The judge page is `demo.html`.
5. Verify the URL in a private browser window without being signed into the host. Generate a plan and run the judge page's live checks.

No public URL has been created by preparing this package. A localhost link works only on the computer running the app. Serve the files over HTTP locally or HTTPS publicly rather than double-clicking index.html, because the app uses JavaScript modules and browser cryptography.

## Build the website again

From the application folder:

```sh
node build-static.mjs
```

Publish the resulting `demo` folder inside the main application folder. You can also rebuild it with `npm run build:demo`. The build copies an explicit list of browser assets only; it does not include server code, OCI settings or private keys. To choose a destination, pass it as the first argument.

## Visitor data and OCI

Each browser has its own local progress. Visitors using separate devices or browser profiles do not see each other's records. People sharing one browser profile share that browser's saved plans; use separate profiles for separate demos. There is no cloud account or synchronization.

The static guest build does not expose OCI calls. If live OCI is needed later, run the Node backend with the team's credentials and decide on appropriate usage limits for the public service. Signing keys must remain on that server; the guest website contains none.
