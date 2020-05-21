# Coordinadora Scraping

## Running the build

All the different build steps are orchestrated via [npm scripts](https://docs.npmjs.com/misc/scripts).
Npm scripts basically allow us to call (and chain) terminal commands via npm.
This is nice because most JavaScript tools have easy to use command line utilities allowing us to not need grunt or gulp to manage our builds.
If you open `package.json`, you will see a `scripts` section with all the different scripts you can call.
To call a script, simply run `npm run <script-name>` from the command line.
You'll notice that npm scripts can call each other which makes it easy to compose complex builds out of simple individual build scripts.
Below is a list of all the scripts this template has available:

| Npm Script | Description |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| `start`                   | Does the same as 'npm run serve'. Can be invoked with `npm start`                                         |
| `start:dev`               | Does the same as 'npm run start' but the [pino](http://getpino.io) logs on the terminal are being transformed by [pino-colada](https://www.npmjs.com/package/pino-colada).  |
| `build`                   | Full build. Runs ALL build tasks (`build-sass`, `build-ts`, `lint`, `copy-static-assets`)                 |
| `serve`                   | Runs node on `dist/server.js` which is the apps entry point                                               |
| `watch-node`              | Runs node with nodemon so the process restarts if it crashes. Used in the main watch task                 |
| `watch-node:pretty`       | Does the same as 'npm run watch-node' but the [pino](http://getpino.io) logs on the terminal are being transformed by [pino-colada](https://www.npmjs.com/package/pino-colada).  |
| `watch`                   | Runs all watch tasks (TypeScript, Sass, Node). Use this if you're not touching static assets.             |
| `test`                    | Runs tests using Jest test runner                                                                         |
| `watch-test`              | Runs tests in watch mode                                                                                  |
| `build-ts`                | Compiles all source `.ts` files to `.js` files in the `dist` folder                                       |
| `watch-ts`                | Same as `build-ts` but continuously watches `.ts` files and re-compiles when needed                       |
| `build-sass`              | Compiles all `.scss` files to `.css` files                                                                |
| `watch-sass`              | Same as `build-sass` but continuously watches `.scss` files and re-compiles when needed                   |
| `lint`                    | Runs ESLint on project files                                                                              |
| `copy-static-assets`      | Calls script that copies JS libs, fonts, and images to dist directory                                     |
| `debug`                   | Performs a full build and then serves the app in watch mode                                               |
| `serve-debug`             | Runs the app with the --inspect flag                                                                      |
| `watch-debug`             | The same as `watch` but includes the --inspect flag so you can attach a debugger                          |
