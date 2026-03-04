# Changelog

## 1.1.0

- Add Mac App Store build support with StoreKit in-app purchase for Pro upgrade
- Add `MAS=1` build flag to distinguish MAS from direct distribution builds
- Add StoreKit purchase and restore flow in Electron main process
- Add dedicated license UI for MAS builds (buy/restore buttons with localised pricing)
- Guard LemonSqueezy activation routes when running as MAS build
- Add `electron:make:mas` build script
- Disable auto-updater for MAS builds (updates via App Store)

## 1.0.0

- Initial release
