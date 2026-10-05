# Changelog

## [2.1.0](https://github.com/mr-devboy/power-monitor/compare/v2.0.0...v2.1.0) (2026-10-05)


### Features

* extend silent night mode to 22:00-08:00 ([78db0fa](https://github.com/mr-devboy/power-monitor/commit/78db0fa100cad06490698d926c86fe7f0fbcd855))

## [2.0.0](https://github.com/mr-devboy/power-monitor/compare/v1.1.0...v2.0.0) (2026-10-05)


### ⚠ BREAKING CHANGES

* Node.js 24 or newer is required. The workflow reads the version from .nvmrc, local runs need Node.js 24 too.
* the workflow no longer uses the PAT secret. Remove it from the repository secrets. Keep the token itself if the external cron service uses it to trigger the workflow.
* bot state moved from artifacts/status.json in main to the artifacts branch. The branch is created on the first run, which sends a message with the current status. Bot commits "chore: update status artifact" no longer land in main.

### build

* require Node.js 24 and TypeScript 6 ([d791fbb](https://github.com/mr-devboy/power-monitor/commit/d791fbb405c0e0745d7a86fb40430b3b87693ea9))


### Features

* check power every 30 seconds and confirm restore in 1 minute ([e332dce](https://github.com/mr-devboy/power-monitor/commit/e332dcec262ca99e1fb19ea1aea3fd0f9c5b3877))
* mark event time and previous status duration with emoji ([70e1931](https://github.com/mr-devboy/power-monitor/commit/70e1931cc1dcccdc136cff18022903b4dbaf1978))
* retry sending notification ([2432fff](https://github.com/mr-devboy/power-monitor/commit/2432fff0a6bb18a43052647da879d41019025375))
* send silent notifications at night ([4b7bc6b](https://github.com/mr-devboy/power-monitor/commit/4b7bc6b1f9d8d934fd0883600235abad3afc6722))
* show days in status duration ([d27ca16](https://github.com/mr-devboy/power-monitor/commit/d27ca16d9b74adb49fd763cbffbed02a299a49ef))
* store bot state in a separate artifacts branch ([b979454](https://github.com/mr-devboy/power-monitor/commit/b979454c708a295228849699870c34b52a954b59))


### Bug Fixes

* do not save status when the notification is not delivered ([3afd45c](https://github.com/mr-devboy/power-monitor/commit/3afd45c6e5aa6e0be32d8b4e2315b0fea1387572))
* exit with non-zero code on failure ([b7da949](https://github.com/mr-devboy/power-monitor/commit/b7da949b6316dfd5675a48af6291177942b9715a))
* fail the run when telegram bot token or chat id is missing ([04dd9cb](https://github.com/mr-devboy/power-monitor/commit/04dd9cbeaea6bd24039a80880f12bf2078e94cb9))
* time out hanging telegram requests ([08935cc](https://github.com/mr-devboy/power-monitor/commit/08935cc8b7842bd318d01a97a90cfa3f833b295a))


### Documentation

* switch README to informal address and polish wording ([56cc3f3](https://github.com/mr-devboy/power-monitor/commit/56cc3f3c389874a3d2fbdb4dfc9bbb62a9b00d55))


### Continuous Integration

* add release-please ([c72b2c0](https://github.com/mr-devboy/power-monitor/commit/c72b2c06c249cbb7fa37564b93cea4238665e486))
* replace PAT with GITHUB_TOKEN ([47b51a5](https://github.com/mr-devboy/power-monitor/commit/47b51a50d2322736ca87521ee93bcedfbff5c7ac))
