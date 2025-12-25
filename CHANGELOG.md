# barforge-web

## [0.7.0](https://github.com/jtaw5649/barforge-web/compare/barforge-web-v0.6.0...barforge-web-v0.7.0) (2025-12-25)


### Features

* add /install redirect and fix deploy target ([#39](https://github.com/jtaw5649/barforge-web/issues/39)) ([42ba66f](https://github.com/jtaw5649/barforge-web/commit/42ba66f992c27a337e888fbeb561c4cb237c815e))

## [0.6.0](https://github.com/jtaw5649/barforge-web/compare/barforge-web-v0.5.5...barforge-web-v0.6.0) (2025-12-25)


### Features

* add admin dashboard and markdown support ([b37ffb7](https://github.com/jtaw5649/barforge-web/commit/b37ffb770a480e37a45676195de950781d42e240))
* add command palette and rebrand to Waybar Marketplace ([805437b](https://github.com/jtaw5649/barforge-web/commit/805437bac18474227ec9373e8b24931e3c80b545))
* add homepage featured modules, user profiles, and dashboard (v0.1.5) ([68921bb](https://github.com/jtaw5649/barforge-web/commit/68921bb0136ce6657b808b92a0577a1e27ae3d15))
* add module detail page with reviews ([005ab8e](https://github.com/jtaw5649/barforge-web/commit/005ab8e29d94b0deb885a93671cfdc2ce8354868))
* add module upload page ([e62f848](https://github.com/jtaw5649/barforge-web/commit/e62f84846782eedd72aee938fc4c13fb9cb4bf40))
* add session handling and nodejs_compat ([9172bf5](https://github.com/jtaw5649/barforge-web/commit/9172bf5ac72001003a2c3161f154fb4b1d67631f))
* authentication refactor and bearer token migration ([#24](https://github.com/jtaw5649/barforge-web/issues/24)) ([cbba8b3](https://github.com/jtaw5649/barforge-web/commit/cbba8b3a1c140621c864fdf6adca4031f8e5a5a3))
* barforge rebrand and UI improvements ([#36](https://github.com/jtaw5649/barforge-web/issues/36)) ([708ac97](https://github.com/jtaw5649/barforge-web/commit/708ac974eb4a8e7897efc235213f97eba8b21f64))
* **ci:** add changesets for automated versioning and changelogs ([a249948](https://github.com/jtaw5649/barforge-web/commit/a24994828b425441a1895bafd5257b272f6d0820))
* GitHub token auth with refresh rotation ([#9](https://github.com/jtaw5649/barforge-web/issues/9)) ([ce257bc](https://github.com/jtaw5649/barforge-web/commit/ce257bc4f843633d9ee01b92b5048ab77bb295e9))
* initialize SvelteKit marketplace project ([ae6c0c9](https://github.com/jtaw5649/barforge-web/commit/ae6c0c9f8ad5798ec38fea58060f70379b514b18))
* P2/P3 UI improvements and personalization features ([#11](https://github.com/jtaw5649/barforge-web/issues/11)) ([943e830](https://github.com/jtaw5649/barforge-web/commit/943e830126c16b6d18bc8d3c9d280f2dec02699f))
* redesign favicon with proper sizing and transparency ([f5687b2](https://github.com/jtaw5649/barforge-web/commit/f5687b2f3773f9b6a3005ddb531ad6957bcf1bad))
* stars system, settings hub, and view mode improvements ([#12](https://github.com/jtaw5649/barforge-web/issues/12)) ([4903fa4](https://github.com/jtaw5649/barforge-web/commit/4903fa490ea1100186258123a4e5267fc8f31d34))
* UI components, icons, and logo sizing (v0.2.2) ([f1bf74e](https://github.com/jtaw5649/barforge-web/commit/f1bf74ed6afb9e792c80e6ae549e6235812e5cfc))
* UI improvements and component library ([fcad30c](https://github.com/jtaw5649/barforge-web/commit/fcad30cd90819d1699aadfb0d362bee5ab1e2b39))
* UI improvements and system fonts (v0.2.0) ([86a78b5](https://github.com/jtaw5649/barforge-web/commit/86a78b5f7afdc731df9d2746c6618a54148b7461))
* v0.3.0 - Collections, Screenshots, SSR, and UI improvements ([#8](https://github.com/jtaw5649/barforge-web/issues/8)) ([ffa2b83](https://github.com/jtaw5649/barforge-web/commit/ffa2b833c964b2beff0db7231e5e9f0894df1ec3))


### Bug Fixes

* **admin:** resolve access denied by moving data fetching to server ([#18](https://github.com/jtaw5649/barforge-web/issues/18)) ([7d1f49b](https://github.com/jtaw5649/barforge-web/commit/7d1f49b15fc3ef37abad4ce9d47c8cf571ce0283))
* align module header with content, update search keybind (v0.2.1) ([cbe9f4f](https://github.com/jtaw5649/barforge-web/commit/cbe9f4ffd1d74fa1f483b48b394668842659a891))
* auth login redirect and Svelte 5 migration ([#15](https://github.com/jtaw5649/barforge-web/issues/15)) ([0408b15](https://github.com/jtaw5649/barforge-web/commit/0408b15237ede9430e69ad9b352fb6379d6cac66))
* **auth:** default trustHost in production when unset ([#32](https://github.com/jtaw5649/barforge-web/issues/32)) ([f29cb24](https://github.com/jtaw5649/barforge-web/commit/f29cb2471afb973ea7dc4a03b45e44a43d102af6))
* **ci:** bypass checks for release-please PRs ([#21](https://github.com/jtaw5649/barforge-web/issues/21)) ([d3ac639](https://github.com/jtaw5649/barforge-web/commit/d3ac63916d0f8346d60482e66e7a162f6b337f12))
* **ci:** use RELEASE_PLEASE_TOKEN for workflow triggers ([#23](https://github.com/jtaw5649/barforge-web/issues/23)) ([2ef5209](https://github.com/jtaw5649/barforge-web/commit/2ef5209fd847d7be3da6065bc97f33bd824e2b59))
* **collections:** properly unwrap API response with owner info ([#34](https://github.com/jtaw5649/barforge-web/issues/34)) ([ff5cfdc](https://github.com/jtaw5649/barforge-web/commit/ff5cfdcecb977ea550b2e3625fed957dc06699a4))
* correct changeset format ([ae730e9](https://github.com/jtaw5649/barforge-web/commit/ae730e9caad2c60600a50158540e71a68ae3f863))
* correct changeset format ([be09014](https://github.com/jtaw5649/barforge-web/commit/be0901463b284634403813888143b7c2b70806e7))
* graceful fallback for /api/stars endpoint ([#14](https://github.com/jtaw5649/barforge-web/issues/14)) ([e1e45fd](https://github.com/jtaw5649/barforge-web/commit/e1e45fd6e7fe784d7c9b8a01f23ef6bd1373220d))
* harden admin actions and sessions ([#30](https://github.com/jtaw5649/barforge-web/issues/30)) ([9c821a4](https://github.com/jtaw5649/barforge-web/commit/9c821a4137619d69d60abc419e8a033be9dad1d6))
* harden login redirects and module fetches ([#28](https://github.com/jtaw5649/barforge-web/issues/28)) ([c4c159c](https://github.com/jtaw5649/barforge-web/commit/c4c159c87e97b6edefc3e3d5776f6d884742497e))
* **hooks:** refactor useModuleCard to use Svelte 5 runes ([#17](https://github.com/jtaw5649/barforge-web/issues/17)) ([6cd4ec0](https://github.com/jtaw5649/barforge-web/commit/6cd4ec05c28be91c398763f6f7902ff6a20aebc8))
* normalize stars payload handling ([#26](https://github.com/jtaw5649/barforge-web/issues/26)) ([bb06ece](https://github.com/jtaw5649/barforge-web/commit/bb06ecebbbcdca936f56a4854d528093d00e5231))
* override cookie package to fix CVE vulnerability ([0296209](https://github.com/jtaw5649/barforge-web/commit/029620964cd6929a433251289cad205fee9e60d9))
* use dynamic env for auth and add clear filters ([#10](https://github.com/jtaw5649/barforge-web/issues/10)) ([cac37d9](https://github.com/jtaw5649/barforge-web/commit/cac37d9dee6296a96b08885408ef8848950a458b))


### Performance Improvements

* replace transition: all with specific properties (v0.2.3) ([4320247](https://github.com/jtaw5649/barforge-web/commit/4320247afb947627a84d746e6c466ba42d8b8498))


### Code Refactoring

* fix all linting and reactivity warnings (Svelte 5) ([#19](https://github.com/jtaw5649/barforge-web/issues/19)) ([70fd830](https://github.com/jtaw5649/barforge-web/commit/70fd830d358b6b71e75bf5fc6d9d2282a75b4c27))


### Documentation

* add screenshot and fix favicons ([abea220](https://github.com/jtaw5649/barforge-web/commit/abea2207009c5c86ac0ec95e982565c90f8541db))
* simplify README header with og.png ([38fa657](https://github.com/jtaw5649/barforge-web/commit/38fa6578634227224a26147a562ae3ea9e185949))


### Miscellaneous

* add changelog-github for PR/commit links ([d77afcb](https://github.com/jtaw5649/barforge-web/commit/d77afcb87f958f46a30e602a46de0be7afb12272))
* add changelog-github for PR/commit links ([80dd88b](https://github.com/jtaw5649/barforge-web/commit/80dd88bb22757b63930a7b61857cb3b92f7a9318))
* add changeset ([0503b10](https://github.com/jtaw5649/barforge-web/commit/0503b10618e08759c471614d05fe6083f86bf21d))
* **deps:** update all dependencies to latest versions ([06122e2](https://github.com/jtaw5649/barforge-web/commit/06122e28bc8fa7c33ad27da0741b2451f5a052ac))
* **master:** release waybar-marketplace 0.4.0 ([#20](https://github.com/jtaw5649/barforge-web/issues/20)) ([e741624](https://github.com/jtaw5649/barforge-web/commit/e74162469d855363201659f40b969a78814531d5))
* **master:** release waybar-marketplace 0.4.1 ([#22](https://github.com/jtaw5649/barforge-web/issues/22)) ([c6f3ea1](https://github.com/jtaw5649/barforge-web/commit/c6f3ea19f72e31c56d9bc7bd7c7dc82a3e6d085e))
* **master:** release waybar-marketplace 0.5.0 ([#25](https://github.com/jtaw5649/barforge-web/issues/25)) ([0bd8247](https://github.com/jtaw5649/barforge-web/commit/0bd82478703c7c7feaa803bbead5e669d8b7bb3c))
* **master:** release waybar-marketplace 0.5.1 ([#27](https://github.com/jtaw5649/barforge-web/issues/27)) ([73ff5d0](https://github.com/jtaw5649/barforge-web/commit/73ff5d0aeb20b9f5461faae2278c72b2fa3d6c00))
* **master:** release waybar-marketplace 0.5.2 ([#29](https://github.com/jtaw5649/barforge-web/issues/29)) ([c83801a](https://github.com/jtaw5649/barforge-web/commit/c83801afd763a2e52f4e036c4129c9adb70e4300))
* **master:** release waybar-marketplace 0.5.3 ([#31](https://github.com/jtaw5649/barforge-web/issues/31)) ([a9562f6](https://github.com/jtaw5649/barforge-web/commit/a9562f66fc9e7b964ecf70bac032a0d294fb0233))
* **master:** release waybar-marketplace 0.5.4 ([#33](https://github.com/jtaw5649/barforge-web/issues/33)) ([e716340](https://github.com/jtaw5649/barforge-web/commit/e716340211005d5e67a6112ea33d2b20a34ba8cf))
* **master:** release waybar-marketplace 0.5.5 ([#35](https://github.com/jtaw5649/barforge-web/issues/35)) ([b7afea7](https://github.com/jtaw5649/barforge-web/commit/b7afea7864e08fefc6ed3c4b18ada98b1acf1d94))
* PR-based workflows + UI updates ([2274a38](https://github.com/jtaw5649/barforge-web/commit/2274a3843183231ab953dd74c1e1bcc2d4e3c867))
* PR-based workflows + UI updates ([#2](https://github.com/jtaw5649/barforge-web/issues/2)) ([13b24ff](https://github.com/jtaw5649/barforge-web/commit/13b24ff73ef6298e5ce6774eaf30a4c69e83c349))
* remove .serena from repo ([15f89e2](https://github.com/jtaw5649/barforge-web/commit/15f89e259a18134fab48a8ceb5d0b1e007767450))
* replace changesets with release-please ([#16](https://github.com/jtaw5649/barforge-web/issues/16)) ([e496873](https://github.com/jtaw5649/barforge-web/commit/e4968737d52d2387f7f25dd9c9dd5a8eada7bbdf))
* version packages ([a09b27e](https://github.com/jtaw5649/barforge-web/commit/a09b27ea98bf3fa9e8222642ca22f514fbb5341d))
* version packages ([33f6460](https://github.com/jtaw5649/barforge-web/commit/33f6460c942c9545b3d6f9c4b685a28c94d181cb))
* version packages ([c48bc04](https://github.com/jtaw5649/barforge-web/commit/c48bc04658d5b1dd74d277bfed624d71f3a362c1))
* version packages ([511ae0f](https://github.com/jtaw5649/barforge-web/commit/511ae0f425b67039124b57d8838ed6307d9cd057))
* version packages ([#13](https://github.com/jtaw5649/barforge-web/issues/13)) ([13e5fb1](https://github.com/jtaw5649/barforge-web/commit/13e5fb13298c5d50d9f998193dae658bbab4d079))

## [0.5.5](https://github.com/jtaw5649/barforge-web/compare/barforge-web-v0.5.4...barforge-web-v0.5.5) (2025-12-22)


### Bug Fixes

* **collections:** properly unwrap API response with owner info ([#34](https://github.com/jtaw5649/barforge-web/issues/34)) ([ff5cfdc](https://github.com/jtaw5649/barforge-web/commit/ff5cfdcecb977ea550b2e3625fed957dc06699a4))

## [0.5.4](https://github.com/jtaw5649/barforge-web/compare/barforge-web-v0.5.3...barforge-web-v0.5.4) (2025-12-22)


### Bug Fixes

* **auth:** default trustHost in production when unset ([#32](https://github.com/jtaw5649/barforge-web/issues/32)) ([f29cb24](https://github.com/jtaw5649/barforge-web/commit/f29cb2471afb973ea7dc4a03b45e44a43d102af6))

## [0.5.3](https://github.com/jtaw5649/barforge-web/compare/barforge-web-v0.5.2...barforge-web-v0.5.3) (2025-12-21)


### Bug Fixes

* harden admin actions and sessions ([#30](https://github.com/jtaw5649/barforge-web/issues/30)) ([9c821a4](https://github.com/jtaw5649/barforge-web/commit/9c821a4137619d69d60abc419e8a033be9dad1d6))

## [0.5.2](https://github.com/jtaw5649/barforge-web/compare/barforge-web-v0.5.1...barforge-web-v0.5.2) (2025-12-21)


### Bug Fixes

* harden login redirects and module fetches ([#28](https://github.com/jtaw5649/barforge-web/issues/28)) ([c4c159c](https://github.com/jtaw5649/barforge-web/commit/c4c159c87e97b6edefc3e3d5776f6d884742497e))

## [0.5.1](https://github.com/jtaw5649/barforge-web/compare/barforge-web-v0.5.0...barforge-web-v0.5.1) (2025-12-21)


### Bug Fixes

* normalize stars payload handling ([#26](https://github.com/jtaw5649/barforge-web/issues/26)) ([bb06ece](https://github.com/jtaw5649/barforge-web/commit/bb06ecebbbcdca936f56a4854d528093d00e5231))

## [0.5.0](https://github.com/jtaw5649/barforge-web/compare/barforge-web-v0.4.1...barforge-web-v0.5.0) (2025-12-21)


### Features

* authentication refactor and bearer token migration ([#24](https://github.com/jtaw5649/barforge-web/issues/24)) ([cbba8b3](https://github.com/jtaw5649/barforge-web/commit/cbba8b3a1c140621c864fdf6adca4031f8e5a5a3))

## [0.4.1](https://github.com/jtaw5649/barforge-web/compare/barforge-web-v0.4.0...barforge-web-v0.4.1) (2025-12-21)

### Bug Fixes

- **ci:** bypass checks for release-please PRs ([#21](https://github.com/jtaw5649/barforge-web/issues/21)) ([d3ac639](https://github.com/jtaw5649/barforge-web/commit/d3ac63916d0f8346d60482e66e7a162f6b337f12))
- **ci:** use RELEASE_PLEASE_TOKEN for workflow triggers ([#23](https://github.com/jtaw5649/barforge-web/issues/23)) ([2ef5209](https://github.com/jtaw5649/barforge-web/commit/2ef5209fd847d7be3da6065bc97f33bd824e2b59))

## [0.4.0](https://github.com/jtaw5649/barforge-web/compare/barforge-web-v0.3.5...barforge-web-v0.4.0) (2025-12-20)

### Features

- add admin dashboard and markdown support ([b37ffb7](https://github.com/jtaw5649/barforge-web/commit/b37ffb770a480e37a45676195de950781d42e240))
- add command palette and rebrand to Barforge ([805437b](https://github.com/jtaw5649/barforge-web/commit/805437bac18474227ec9373e8b24931e3c80b545))
- add homepage featured modules, user profiles, and dashboard (v0.1.5) ([68921bb](https://github.com/jtaw5649/barforge-web/commit/68921bb0136ce6657b808b92a0577a1e27ae3d15))
- add module detail page with reviews ([005ab8e](https://github.com/jtaw5649/barforge-web/commit/005ab8e29d94b0deb885a93671cfdc2ce8354868))
- add module upload page ([e62f848](https://github.com/jtaw5649/barforge-web/commit/e62f84846782eedd72aee938fc4c13fb9cb4bf40))
- add session handling and nodejs_compat ([9172bf5](https://github.com/jtaw5649/barforge-web/commit/9172bf5ac72001003a2c3161f154fb4b1d67631f))
- **ci:** add changesets for automated versioning and changelogs ([a249948](https://github.com/jtaw5649/barforge-web/commit/a24994828b425441a1895bafd5257b272f6d0820))
- GitHub token auth with refresh rotation ([#9](https://github.com/jtaw5649/barforge-web/issues/9)) ([ce257bc](https://github.com/jtaw5649/barforge-web/commit/ce257bc4f843633d9ee01b92b5048ab77bb295e9))
- initialize SvelteKit marketplace project ([ae6c0c9](https://github.com/jtaw5649/barforge-web/commit/ae6c0c9f8ad5798ec38fea58060f70379b514b18))
- P2/P3 UI improvements and personalization features ([#11](https://github.com/jtaw5649/barforge-web/issues/11)) ([943e830](https://github.com/jtaw5649/barforge-web/commit/943e830126c16b6d18bc8d3c9d280f2dec02699f))
- redesign favicon with proper sizing and transparency ([f5687b2](https://github.com/jtaw5649/barforge-web/commit/f5687b2f3773f9b6a3005ddb531ad6957bcf1bad))
- stars system, settings hub, and view mode improvements ([#12](https://github.com/jtaw5649/barforge-web/issues/12)) ([4903fa4](https://github.com/jtaw5649/barforge-web/commit/4903fa490ea1100186258123a4e5267fc8f31d34))
- UI components, icons, and logo sizing (v0.2.2) ([f1bf74e](https://github.com/jtaw5649/barforge-web/commit/f1bf74ed6afb9e792c80e6ae549e6235812e5cfc))
- UI improvements and component library ([fcad30c](https://github.com/jtaw5649/barforge-web/commit/fcad30cd90819d1699aadfb0d362bee5ab1e2b39))
- UI improvements and system fonts (v0.2.0) ([86a78b5](https://github.com/jtaw5649/barforge-web/commit/86a78b5f7afdc731df9d2746c6618a54148b7461))
- v0.3.0 - Collections, Screenshots, SSR, and UI improvements ([#8](https://github.com/jtaw5649/barforge-web/issues/8)) ([ffa2b83](https://github.com/jtaw5649/barforge-web/commit/ffa2b833c964b2beff0db7231e5e9f0894df1ec3))

### Bug Fixes

- **admin:** resolve access denied by moving data fetching to server ([#18](https://github.com/jtaw5649/barforge-web/issues/18)) ([7d1f49b](https://github.com/jtaw5649/barforge-web/commit/7d1f49b15fc3ef37abad4ce9d47c8cf571ce0283))
- align module header with content, update search keybind (v0.2.1) ([cbe9f4f](https://github.com/jtaw5649/barforge-web/commit/cbe9f4ffd1d74fa1f483b48b394668842659a891))
- auth login redirect and Svelte 5 migration ([#15](https://github.com/jtaw5649/barforge-web/issues/15)) ([0408b15](https://github.com/jtaw5649/barforge-web/commit/0408b15237ede9430e69ad9b352fb6379d6cac66))
- correct changeset format ([ae730e9](https://github.com/jtaw5649/barforge-web/commit/ae730e9caad2c60600a50158540e71a68ae3f863))
- correct changeset format ([be09014](https://github.com/jtaw5649/barforge-web/commit/be0901463b284634403813888143b7c2b70806e7))
- graceful fallback for /api/stars endpoint ([#14](https://github.com/jtaw5649/barforge-web/issues/14)) ([e1e45fd](https://github.com/jtaw5649/barforge-web/commit/e1e45fd6e7fe784d7c9b8a01f23ef6bd1373220d))
- **hooks:** refactor useModuleCard to use Svelte 5 runes ([#17](https://github.com/jtaw5649/barforge-web/issues/17)) ([6cd4ec0](https://github.com/jtaw5649/barforge-web/commit/6cd4ec05c28be91c398763f6f7902ff6a20aebc8))
- override cookie package to fix CVE vulnerability ([0296209](https://github.com/jtaw5649/barforge-web/commit/029620964cd6929a433251289cad205fee9e60d9))
- use dynamic env for auth and add clear filters ([#10](https://github.com/jtaw5649/barforge-web/issues/10)) ([cac37d9](https://github.com/jtaw5649/barforge-web/commit/cac37d9dee6296a96b08885408ef8848950a458b))

### Performance Improvements

- replace transition: all with specific properties (v0.2.3) ([4320247](https://github.com/jtaw5649/barforge-web/commit/4320247afb947627a84d746e6c466ba42d8b8498))

### Code Refactoring

- fix all linting and reactivity warnings (Svelte 5) ([#19](https://github.com/jtaw5649/barforge-web/issues/19)) ([70fd830](https://github.com/jtaw5649/barforge-web/commit/70fd830d358b6b71e75bf5fc6d9d2282a75b4c27))

### Documentation

- add screenshot and fix favicons ([abea220](https://github.com/jtaw5649/barforge-web/commit/abea2207009c5c86ac0ec95e982565c90f8541db))
- simplify README header with og.png ([38fa657](https://github.com/jtaw5649/barforge-web/commit/38fa6578634227224a26147a562ae3ea9e185949))

### Miscellaneous

- add changelog-github for PR/commit links ([d77afcb](https://github.com/jtaw5649/barforge-web/commit/d77afcb87f958f46a30e602a46de0be7afb12272))
- add changelog-github for PR/commit links ([80dd88b](https://github.com/jtaw5649/barforge-web/commit/80dd88bb22757b63930a7b61857cb3b92f7a9318))
- add changeset ([0503b10](https://github.com/jtaw5649/barforge-web/commit/0503b10618e08759c471614d05fe6083f86bf21d))
- **deps:** update all dependencies to latest versions ([06122e2](https://github.com/jtaw5649/barforge-web/commit/06122e28bc8fa7c33ad27da0741b2451f5a052ac))
- PR-based workflows + UI updates ([2274a38](https://github.com/jtaw5649/barforge-web/commit/2274a3843183231ab953dd74c1e1bcc2d4e3c867))
- PR-based workflows + UI updates ([#2](https://github.com/jtaw5649/barforge-web/issues/2)) ([13b24ff](https://github.com/jtaw5649/barforge-web/commit/13b24ff73ef6298e5ce6774eaf30a4c69e83c349))
- remove .serena from repo ([15f89e2](https://github.com/jtaw5649/barforge-web/commit/15f89e259a18134fab48a8ceb5d0b1e007767450))
- replace changesets with release-please ([#16](https://github.com/jtaw5649/barforge-web/issues/16)) ([e496873](https://github.com/jtaw5649/barforge-web/commit/e4968737d52d2387f7f25dd9c9dd5a8eada7bbdf))
- version packages ([a09b27e](https://github.com/jtaw5649/barforge-web/commit/a09b27ea98bf3fa9e8222642ca22f514fbb5341d))
- version packages ([33f6460](https://github.com/jtaw5649/barforge-web/commit/33f6460c942c9545b3d6f9c4b685a28c94d181cb))
- version packages ([c48bc04](https://github.com/jtaw5649/barforge-web/commit/c48bc04658d5b1dd74d277bfed624d71f3a362c1))
- version packages ([511ae0f](https://github.com/jtaw5649/barforge-web/commit/511ae0f425b67039124b57d8838ed6307d9cd057))
- version packages ([#13](https://github.com/jtaw5649/barforge-web/issues/13)) ([13e5fb1](https://github.com/jtaw5649/barforge-web/commit/13e5fb13298c5d50d9f998193dae658bbab4d079))

## 0.3.1

### Patch Changes

- [#12](https://github.com/jtaw5649/barforge-web/pull/12) [`4903fa4`](https://github.com/jtaw5649/barforge-web/commit/4903fa490ea1100186258123a4e5267fc8f31d34) Thanks [@jtaw5649](https://github.com/jtaw5649)! - PR-based workflows, login favicon, Sign in to Log in

## 0.2.5

### Patch Changes

- [#6](https://github.com/jtaw5649/barforge-web/pull/6) [`80dd88b`](https://github.com/jtaw5649/barforge-web/commit/80dd88bb22757b63930a7b61857cb3b92f7a9318) Thanks [@jtaw5649](https://github.com/jtaw5649)! - Add PR and commit links to changelog via @changesets/changelog-github

## 0.2.4

### Patch Changes

- 0503b10: PR-based workflows, login favicon, Sign in to Log in
