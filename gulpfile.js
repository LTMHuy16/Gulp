const { dest, series, src, parallel, watch } = require("gulp");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const browserSync = require("browser-sync").create();
const csscomb = require("gulp-csscomb");
const postcss = require("gulp-postcss");
const sorting = require("postcss-sorting");

// const cleancss = require("gulp-clean-css");
// const minify = require("gulp-minify");
// const babel = require("gulp-babel");
// const concat = require("gulp-concat");
// const jshint = require("gulp-jshint");

const srcScss = "./scss/**/*.scss";

function scss() {
    // return src(['./src/scss/**/*.scss', '!./src/scss/_*/**'])
    return src(srcScss)
        .pipe(plumber())
        .pipe(csscomb())
        .pipe(
            rename(function (path) {
                // parent folder start with _: not complie
                if (path.dirname.startsWith("_")) {
                    if (!path.basename.startsWith("_")) {
                        path.basename = "_" + path.basename;
                    }
                } else {
                    // others: complie
                    if (path.dirname !== ".") {
                        // ignore _*.scss in root folder (ex: _variable.scss)
                        // remove _*.scss
                        if (path.basename.startsWith("_")) {
                            path.basename = path.basename.slice(1);
                        }
                        // add prefix (parent folder + file name .scss)
                        path.basename = path.dirname + "-" + path.basename;
                        // change dirname
                        path.dirname = "./";
                    }
                }
            })
        )
        .pipe(
            sass({
                outputStyle: "compressed",
            })
        )
        .pipe(sass().on("error", sass.logError))
        .pipe(dest("./dist"))
        .pipe(browserSync.stream());
}

function formatCSS() {
    return (
        src(srcScss)
            .pipe(csscomb(".csscomb.json"))
            // .pipe(postcss([]))
            .pipe(dest("./scss"))
    );
}

// ==== Browsersync Functions ====
function initBrowserSync(cb) {
    
    var files = ["./dist/*"];
    browserSync.init(files, {
        // local watch
        server: {
            baseDir: "./"
        },

        // extenal watch
        // open: "external",
        // host: "ltmhuy.myshopify.com",
        // proxy: "ltmhuy.myshopify.com",
        // port: 80,
        
    });
    cb();
}

function browsersyncReload(cb) {
    browserSync.reload();
    cb();
}

function watchTaskBrowser() {
    watch("*.html", browsersyncReload);
    watch(["./scss/**/*.scss"], series(scss, browsersyncReload));
}
// =============================

// Export file
exports.css = formatCSS;
exports.scss = scss;
exports.default = series(scss, initBrowserSync, watchTaskBrowser);
