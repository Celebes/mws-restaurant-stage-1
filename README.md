# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## 0. Start the backend server!

checkout https://github.com/Celebes/mws-restaurant-stage-3 repository on your local machine, then follow instructions in its README.md file.

## 1. Install all the required dependencies!

You need to have installed: `npm` (or `yarn`), `node.js`, `gulp`, `sails` and `browser-sync` globally.

After that use either `npm install` or `yarn install` in the project's root folder.

## 2. Build the project!

# Development mode:

Run `gulp` command in the root of project's folder.

It will create new folder `/dist` and do all the required things, then the website will be available at http://localhost:3000/ with live reload.

# Production mode:

Run `gulp build-prod`, production ready files will be created in `/dist` folder.
Then run simple http server inside (copy `start_http_server.bat` into `/dist` and run it)

# TESTING PERFORMANCE

Best thing is to run browser-sync in production mode. Change default task signature to:

`gulp.task('default', BUILD_PROD_TASKS, function () {`

Then if you won't change anything you will get the best performance locally.