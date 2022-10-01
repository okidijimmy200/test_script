const path = require('path')
module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },
  devServer: {
    static: {       
      directory: path.resolve(__dirname, './dist')
    }
  }
}
There are three main keys, entry, output, devServer. When you build, webpack takes your ./src/main.js and generate bundle.js file in ./dist directory.

On the other hand, devServer config is used when you run a dev server.

Actually, you are already ready to bundle js files. Let’s try it. Please make src director and ./src/main.js file. And write this. It must be JavaScript file now because there is no config to transpile TypeScript.

// ./src/main.js
console.log('Hello World');
To complile, let’s add some commands to package.json.

{
  // ...
  "scripts": {
    "dev": "webpack serve",
    "build": "webpack --mode production --progress --hide-modules"
  }
  // ...
}
Finally, create simple html file in /dist with a script tag of bundle.js. Without the script tag, your bundled js file will never be read.

// dist/index.html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>TITLE HERE</title>
  </head>
  <body>
    <script src="./bundle.js"></script>
  </body>
</html>
Back to command line and type yarn dev . Please open http://localhost:8080 and chrome dev tools. If you can see “Hello world”, good job !


Image: Check initial setup with webpack
Introduce React
I know you guys want to create a cool app. So let’s add React.

yarn add react react-dom
react is for defining components and handle Virtual DOM things
react-dom provides some methods to interact with browser DOM.
As you know, just installing React is not enough because it’s impossible to compile React JSX. webpack is just a bundler. There is no function to transpile React JSX. So it’s time to use Babel !

Babel is a compiler that you can transpile codes. For example,

from new JavaScript (ESNext) to old JavaScript (ES5)
from React JSX and Vue SFC to normal JavaScript.
Firstly, let’s create initial setup of babel ! The core library of Babel is @babel/core . To use Babel with webpack, you need to use babel-loader.

yarn add -D @babel/core babel-loader
Then add babel-loader to webpack config. If you would like to add loaders, you must add a config to module.rules .

// webpack.config.js
const path = require('path')
module.exports = {
  ...
  module: {
    rules: [
      {
        test: /\.(js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.jsx', '.js'],
  },
}
That’s it ! From here, it’s possible to write complicated configs.

So let’s add React compilation config. To transpile React JSX, you need @babel/preset-react .

yarn add -D @babel/preset-react
Then create babel.config.json at the root directory.

// babel.config.json
{
  "presets": [
    "@babel/preset-react"
  ]
}
Now react transpilation process is added to your webpack bundle process ! Let’s try react code, rewrite src/main.js.

// src/main.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
createRoot(document.getElementById('app'))
  .render(<App />);
Then add App.jsx !

// src/App.jsx
import React from 'react';
export const App = () => (
  <h1>Hello React</h1>
);
In addition to the first react component, because react try to mount on html tag which has id #app , please add div tag in html.

// dist/index.html
<!DOCTYPE html>
<html>
  <head>
    ...
  </head>
  <body>
    <div id="app" />                       // add here
    <script src="./bundle.js"></script>
  </body>
</html>
In addition to babel config, it’s recommended to write a resolver config of .jsx and .js . With it, you could write write import like import App from "./App"; instead of import App from “./App.jsx”`;

// webpack.config.js
const path = require('path')
module.exports = {
  ...
  resolve: {
    extensions: ['.jsx', '.js'],
  },
}
Now you can use react in your application, check it with yarn dev!


Image: Initial setup of React
Transpile and Polyfill to ES5
So far, your JavaScript file is written in ES6+. For example, arrow function is used in App.jsx . It means that your application does not work in old browsers.

To make application work in old browsers, two things must be done.

Transpile ES6+ code to ES5-
Polyfill
Transpile is easy to understand. Just replace new JavaScript to old JavaScript.

// ES6
const sayHello = () => ("hello")
↓ Transpile// ES5
function sayHello(){
  return "hello";
}
Polyfill is bit different. It recreates missing features which browsers do not have. For example, Array.prototype.find appears from ES6. It means that there is no ES5 version of Array.prototype.find .

With Babel, transpile and polyfill is not so difficult. First of all, please install some modules.

yarn add -D @babel/preset-env core-js regenerator-runtime
The key module is @babel/preset-env and core-js. Because JavaScript evolution is so fast, hundreds of features must be transpiled and polyfilled. But fortunately, @babel/preset-env is a smart transpile preset which covers most of features. And core-jsis polyfill preset. When you use features which@babel/preset-env and core-js does not support, it’s time to think using plugins. regenerator-runtime is for promise.

Although understanding them clearly is time consuming, the configuration is easy.

// babel.config.json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "corejs": 3
      }
    ],
    "@babel/preset-react"
  ],
}
When you use @babel/preset-env , two should be specified. For corejs , 3 should be specified because it’s maintainted. useBuiltIns defines how to add polyfill codes. You have two choices like below.

usage : adds to the top of each file import of polyfills for features used in this file and not supported by target environments
entry : replaces imports of core-js to import only required for a target environment modules.
To reduce bundle size, usage is better.

To check your application code is successfully transpiled and polyfilled, you can build and see if ES6+ feature does not exists.

Add TypeScript
So far, React, webpack and Babel have been perfectly set. But I guess most of you guys wants to use TypeScript because it speeds up your development with less bugs. So let’s add TypeScript

To add TypeScript, you have two compile choices.

TypeScript Compiler (tsc) transpile TS to ES5 JS. tsc does type check too
Babel transpile TS. tsc does type check
This article explains the second choice because Babel transpiling have more flexibility than tsc does. In addition, responsibility is clear.

Babel have a responsibility on transpiling
tsc has a responsibility on type check
So, firstly try to setup Babel TypeScript transpiling!

yarn add -D @babel/preset-typescript
@babel/preset-typescript is a super preset of TypeScript. Because it does not cover all features of TypeScript, please add plugins if you need extra features, such as const enum.

The configuration is very simple. Just add the module to babel.config.json .

// babel.config.json
{
  "presets": [
    "@babel/preset-typescript", // add here
    [
      "@babel/preset-env",
     ...
}
That’s it ! Babel TypeScript transpiling setup is done 🎉

Because setup is done, let’s write React app with TypeScript! To write react with TypeScript, you should add type declarations of them.

yarn add -D @types/react @types/react-dom
So let’s change app code to TypeScript!. First, change file name of main.ts to Index.tsx . Because main.ts have JSX ( <App />), it causes a type error. And to prevent null type error, add null check in Index.tsx.

// src/Index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
const rootNode = document.getElementById('app');
if(rootNode){
  createRoot(rootNode)
    .render(<App />);
}
Next App.jsx . Change file extension to .tsx . Then, type App.tsx.

// App.tsx
import React from 'react';
export const App: React.FC = () => (
  <h1>Hello React</h1>
);
Because this article does not focus on type system, the explanation of detail implementation would be omitted.

Lastly, add webpack configuration.

// webpack.config.js
const path = require('path')
module.exports = {
  entry: './src/Index.tsx', // Changed the entry file name
  ...  
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,    // add |ts
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'], // add .tsx, .ts
  },
  ...
}
If you try yarn dev now, you can see same screen as before without console error!


So far, you could transpile TypeScript, but it’s not impossible to detect type error. So let’s add type check !

Firstly, add typescript .

yarn add -D typescript
When you add typescript to your project, you should create tsconfig.json .

// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "umd",
    "lib": [
      "ESNext",
      "dom"
    ],
    "jsx": "react",
    "noEmit": true,    
    "sourceMap": true,
    /* Strict Type-Checking Options */
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
   
    /* Module Resolution Options */
    "moduleResolution": "node",
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}
Setup is done !

Because Babel does transpiling, noEmit should be true and target does not have to be old JavaScript. In addition, because you want to use latest JavaScript/TypeScript features of DOM, lib include ESNext and dom . And jsx should be react . Type Check rule should be customized as you want. But I recommend strict option to be true.

Now you can add type check command for convinience.

// package.json
{
  ...,
  "scripts": {    
    "dev": "webpack serve",
    "build": "webpack --mode production --progress --hide-modules",
    "tscheck": "tsc" // add here
  }
  ...
}
If you run yarn tscheck , type error is detected by tsc like below.

❯ yarn tscheck
yarn run v1.22.17
$ tsc
✨  Done in 1.97s.
If you want to get a type error as soon as possible, you could add -w option. It will watch your code changes and notify type error.

❯ yarn tscheck -w
This article explains settings of React TypeScript project with webpack and Babel. After setting up a bundle config, I highly recommend to setup eslint and prettier to format your TypeScript to speed up your development more !

Auto Format with ESLint and Prettier for React TypeScript Project
Auto formatting is a great enhancement of DX. It saves your development time and drastically increase your productivity…
egctoru.medium.com

Thank you !

References
TypeScript
React
webpack
Babel
