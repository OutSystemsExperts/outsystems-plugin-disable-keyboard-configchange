# outsystems-plugin-disable-keyboard-configchange

Changes AndroidManifest.xml to disable Android configuration changes when connecting/disconnecting an external keyboard.

## Installation

By default adding this plugin to your cordova-android project will set the `android:configChanges` property in the `<activity/>` (MainActivity) tag to contain:

* `keyboard`
* `keyboardHidden`
* `navigation`

```bash
cordova plugin add https://github.com/OutSystemsExperts/outsystems-plugin-disable-keyboard-configchange.git
```
