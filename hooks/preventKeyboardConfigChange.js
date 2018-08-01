// Global vars
var deferral, fs, elementtree, path;
debugger;
var changeManifestConfigChanges = (function () {

    var ChangeManifestConfigChanges = {};

    var manifestPaths = {
        cordovaAndroid6: "platforms/android/AndroidManifest.xml",
        cordovaAndroid7: "platforms/android/app/src/main/AndroidManifest.xml"
    };

    var rootDir;

    function hasElement(array, entry){
        var element = array.find(function(value){
            return value === entry;
        });

        return element !== undefined;
    }

    ChangeManifestConfigChanges.fileExists = function (filePath) {
        try {
            return fs.statSync(filePath).isFile();
        } catch (error) {
            return false;
        }
    };

    ChangeManifestConfigChanges.parseElementtreeSync = function (filename) {
        var content = fs.readFileSync(filename, 'utf-8');
        return new elementtree.ElementTree(elementtree.XML(content));
    };

    ChangeManifestConfigChanges.getAndroidManifestPath = function () {
        var cordovaAndroid6Path = path.join(rootDir, manifestPaths.cordovaAndroid6);
        var cordovaAndroid7Path = path.join(rootDir, manifestPaths.cordovaAndroid7);

        if (this.fileExists(cordovaAndroid6Path)) {
            return cordovaAndroid6Path;
        } else if (this.fileExists(cordovaAndroid7Path)) {
            return cordovaAndroid7Path;
        } else {
            return undefined;
        }
    };


    ChangeManifestConfigChanges.apply = function (ctx) {
        rootDir = ctx.opts.projectRoot;

        var androidManifestPath = this.getAndroidManifestPath();
        if(!androidManifestPath) {
            throw new Error("Unable to find AndroidManifest.xml");
        }
        
        var manifestTree = this.parseElementtreeSync(androidManifestPath);
        var root = manifestTree.getroot();

        if (root) {
            debugger;
            var activityElement = root.find('./application/activity[@android:name="MainActivity"]');
            if (activityElement) {
                var configChanges = activityElement.get("android:configChanges");
                if(configChanges !== undefined && configChanges.length > 0) {
                    var values = configChanges.split("|");
                    
                    if(hasElement(values, "navigation") == false ) {
                        values.push("navigation");
                    }

                    if(hasElement(values, "keyboard") == false ) {
                        values.push("keyboard");
                    }

                    if(hasElement(values, "keyboardHidden") == false ) {
                        values.push("keyboardHidden");
                    }
                    
                    configChanges = values.join("|");
                    activityElement.set("android:configChanges", configChanges);
                }
            } else {
                throw new Error("Invalid AndroidManifest.xml structure. No MainActivity tag found.");
            }

            fs.writeFileSync(androidManifestPath, manifestTree.write({indent:4}, 'utf-8'));
        } else {
            throw new Error("Invalid AndroidManifest.xml structure. No <manifest> tag found.");
        }
    };

    return ChangeManifestConfigChanges;
})();

module.exports = function (ctx) {
    debugger;
    var Q = ctx.requireCordovaModule("q");
    fs = ctx.requireCordovaModule("fs");
    path = ctx.requireCordovaModule("path");
    elementtree = ctx.requireCordovaModule("elementtree");

    deferral = Q.defer();

    try {
        changeManifestConfigChanges.apply(ctx);
        deferral.resolve();
    } catch (error) {
        deferral.reject(error);
        return deferral.promise;
    }

    return deferral.promise;
};