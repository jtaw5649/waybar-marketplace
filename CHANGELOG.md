# waybar-marketplace

## [0.4.1](https://github.com/jtaw5649/waybar-marketplace/compare/waybar-marketplace-v0.4.0...waybar-marketplace-v0.4.1) (2025-12-21)


### Bug Fixes

* **ci:** bypass checks for release-please PRs ([#21](https://github.com/jtaw5649/waybar-marketplace/issues/21)) ([d3ac639](https://github.com/jtaw5649/waybar-marketplace/commit/d3ac63916d0f8346d60482e66e7a162f6b337f12))
* **ci:** use RELEASE_PLEASE_TOKEN for workflow triggers ([#23](https://github.com/jtaw5649/waybar-marketplace/issues/23)) ([2ef5209](https://github.com/jtaw5649/waybar-marketplace/commit/2ef5209fd847d7be3da6065bc97f33bd824e2b59))

## [0.4.0](https://github.com/jtaw5649/waybar-marketplace/compare/waybar-marketplace-v0.3.5...waybar-marketplace-v0.4.0) (2025-12-20)

### Features

- add admin dashboard and markdown support ([b37ffb7](https://github.com/jtaw5649/waybar-marketplace/commit/b37ffb770a480e37a45676195de950781d42e240))
- add command palette and rebrand to Waybar Marketplace ([805437b](https://github.com/jtaw5649/waybar-marketplace/commit/805437bac18474227ec9373e8b24931e3c80b545))
- add homepage featured modules, user profiles, and dashboard (v0.1.5) ([68921bb](https://github.com/jtaw5649/waybar-marketplace/commit/68921bb0136ce6657b808b92a0577a1e27ae3d15))
- add module detail page with reviews ([005ab8e](https://github.com/jtaw5649/waybar-marketplace/commit/005ab8e29d94b0deb885a93671cfdc2ce8354868))
- add module upload page ([e62f848](https://github.com/jtaw5649/waybar-marketplace/commit/e62f84846782eedd72aee938fc4c13fb9cb4bf40))
- add session handling and nodejs_compat ([9172bf5](https://github.com/jtaw5649/waybar-marketplace/commit/9172bf5ac72001003a2c3161f154fb4b1d67631f))
- **ci:** add changesets for automated versioning and changelogs ([a249948](https://github.com/jtaw5649/waybar-marketplace/commit/a24994828b425441a1895bafd5257b272f6d0820))
- GitHub token auth with refresh rotation ([#9](https://github.com/jtaw5649/waybar-marketplace/issues/9)) ([ce257bc](https://github.com/jtaw5649/waybar-marketplace/commit/ce257bc4f843633d9ee01b92b5048ab77bb295e9))
- initialize SvelteKit marketplace project ([ae6c0c9](https://github.com/jtaw5649/waybar-marketplace/commit/ae6c0c9f8ad5798ec38fea58060f70379b514b18))
- P2/P3 UI improvements and personalization features ([#11](https://github.com/jtaw5649/waybar-marketplace/issues/11)) ([943e830](https://github.com/jtaw5649/waybar-marketplace/commit/943e830126c16b6d18bc8d3c9d280f2dec02699f))
- redesign favicon with proper sizing and transparency ([f5687b2](https://github.com/jtaw5649/waybar-marketplace/commit/f5687b2f3773f9b6a3005ddb531ad6957bcf1bad))
- stars system, settings hub, and view mode improvements ([#12](https://github.com/jtaw5649/waybar-marketplace/issues/12)) ([4903fa4](https://github.com/jtaw5649/waybar-marketplace/commit/4903fa490ea1100186258123a4e5267fc8f31d34))
- UI components, icons, and logo sizing (v0.2.2) ([f1bf74e](https://github.com/jtaw5649/waybar-marketplace/commit/f1bf74ed6afb9e792c80e6ae549e6235812e5cfc))
- UI improvements and component library ([fcad30c](https://github.com/jtaw5649/waybar-marketplace/commit/fcad30cd90819d1699aadfb0d362bee5ab1e2b39))
- UI improvements and system fonts (v0.2.0) ([86a78b5](https://github.com/jtaw5649/waybar-marketplace/commit/86a78b5f7afdc731df9d2746c6618a54148b7461))
- v0.3.0 - Collections, Screenshots, SSR, and UI improvements ([#8](https://github.com/jtaw5649/waybar-marketplace/issues/8)) ([ffa2b83](https://github.com/jtaw5649/waybar-marketplace/commit/ffa2b833c964b2beff0db7231e5e9f0894df1ec3))

### Bug Fixes

- **admin:** resolve access denied by moving data fetching to server ([#18](https://github.com/jtaw5649/waybar-marketplace/issues/18)) ([7d1f49b](https://github.com/jtaw5649/waybar-marketplace/commit/7d1f49b15fc3ef37abad4ce9d47c8cf571ce0283))
- align module header with content, update search keybind (v0.2.1) ([cbe9f4f](https://github.com/jtaw5649/waybar-marketplace/commit/cbe9f4ffd1d74fa1f483b48b394668842659a891))
- auth login redirect and Svelte 5 migration ([#15](https://github.com/jtaw5649/waybar-marketplace/issues/15)) ([0408b15](https://github.com/jtaw5649/waybar-marketplace/commit/0408b15237ede9430e69ad9b352fb6379d6cac66))
- correct changeset format ([ae730e9](https://github.com/jtaw5649/waybar-marketplace/commit/ae730e9caad2c60600a50158540e71a68ae3f863))
- correct changeset format ([be09014](https://github.com/jtaw5649/waybar-marketplace/commit/be0901463b284634403813888143b7c2b70806e7))
- graceful fallback for /api/stars endpoint ([#14](https://github.com/jtaw5649/waybar-marketplace/issues/14)) ([e1e45fd](https://github.com/jtaw5649/waybar-marketplace/commit/e1e45fd6e7fe784d7c9b8a01f23ef6bd1373220d))
- **hooks:** refactor useModuleCard to use Svelte 5 runes ([#17](https://github.com/jtaw5649/waybar-marketplace/issues/17)) ([6cd4ec0](https://github.com/jtaw5649/waybar-marketplace/commit/6cd4ec05c28be91c398763f6f7902ff6a20aebc8))
- override cookie package to fix CVE vulnerability ([0296209](https://github.com/jtaw5649/waybar-marketplace/commit/029620964cd6929a433251289cad205fee9e60d9))
- use dynamic env for auth and add clear filters ([#10](https://github.com/jtaw5649/waybar-marketplace/issues/10)) ([cac37d9](https://github.com/jtaw5649/waybar-marketplace/commit/cac37d9dee6296a96b08885408ef8848950a458b))

### Performance Improvements

- replace transition: all with specific properties (v0.2.3) ([4320247](https://github.com/jtaw5649/waybar-marketplace/commit/4320247afb947627a84d746e6c466ba42d8b8498))

### Code Refactoring

- fix all linting and reactivity warnings (Svelte 5) ([#19](https://github.com/jtaw5649/waybar-marketplace/issues/19)) ([70fd830](https://github.com/jtaw5649/waybar-marketplace/commit/70fd830d358b6b71e75bf5fc6d9d2282a75b4c27))

### Documentation

- add screenshot and fix favicons ([abea220](https://github.com/jtaw5649/waybar-marketplace/commit/abea2207009c5c86ac0ec95e982565c90f8541db))
- simplify README header with og.png ([38fa657](https://github.com/jtaw5649/waybar-marketplace/commit/38fa6578634227224a26147a562ae3ea9e185949))

### Miscellaneous

- add changelog-github for PR/commit links ([d77afcb](https://github.com/jtaw5649/waybar-marketplace/commit/d77afcb87f958f46a30e602a46de0be7afb12272))
- add changelog-github for PR/commit links ([80dd88b](https://github.com/jtaw5649/waybar-marketplace/commit/80dd88bb22757b63930a7b61857cb3b92f7a9318))
- add changeset ([0503b10](https://github.com/jtaw5649/waybar-marketplace/commit/0503b10618e08759c471614d05fe6083f86bf21d))
- **deps:** update all dependencies to latest versions ([06122e2](https://github.com/jtaw5649/waybar-marketplace/commit/06122e28bc8fa7c33ad27da0741b2451f5a052ac))
- PR-based workflows + UI updates ([2274a38](https://github.com/jtaw5649/waybar-marketplace/commit/2274a3843183231ab953dd74c1e1bcc2d4e3c867))
- PR-based workflows + UI updates ([#2](https://github.com/jtaw5649/waybar-marketplace/issues/2)) ([13b24ff](https://github.com/jtaw5649/waybar-marketplace/commit/13b24ff73ef6298e5ce6774eaf30a4c69e83c349))
- remove .serena from repo ([15f89e2](https://github.com/jtaw5649/waybar-marketplace/commit/15f89e259a18134fab48a8ceb5d0b1e007767450))
- replace changesets with release-please ([#16](https://github.com/jtaw5649/waybar-marketplace/issues/16)) ([e496873](https://github.com/jtaw5649/waybar-marketplace/commit/e4968737d52d2387f7f25dd9c9dd5a8eada7bbdf))
- version packages ([a09b27e](https://github.com/jtaw5649/waybar-marketplace/commit/a09b27ea98bf3fa9e8222642ca22f514fbb5341d))
- version packages ([33f6460](https://github.com/jtaw5649/waybar-marketplace/commit/33f6460c942c9545b3d6f9c4b685a28c94d181cb))
- version packages ([c48bc04](https://github.com/jtaw5649/waybar-marketplace/commit/c48bc04658d5b1dd74d277bfed624d71f3a362c1))
- version packages ([511ae0f](https://github.com/jtaw5649/waybar-marketplace/commit/511ae0f425b67039124b57d8838ed6307d9cd057))
- version packages ([#13](https://github.com/jtaw5649/waybar-marketplace/issues/13)) ([13e5fb1](https://github.com/jtaw5649/waybar-marketplace/commit/13e5fb13298c5d50d9f998193dae658bbab4d079))

## 0.3.1

### Patch Changes

- [#12](https://github.com/jtaw5649/waybar-marketplace/pull/12) [`4903fa4`](https://github.com/jtaw5649/waybar-marketplace/commit/4903fa490ea1100186258123a4e5267fc8f31d34) Thanks [@jtaw5649](https://github.com/jtaw5649)! - PR-based workflows, login favicon, Sign in to Log in

## 0.2.5

### Patch Changes

- [#6](https://github.com/jtaw5649/waybar-marketplace/pull/6) [`80dd88b`](https://github.com/jtaw5649/waybar-marketplace/commit/80dd88bb22757b63930a7b61857cb3b92f7a9318) Thanks [@jtaw5649](https://github.com/jtaw5649)! - Add PR and commit links to changelog via @changesets/changelog-github

## 0.2.4

### Patch Changes

- 0503b10: PR-based workflows, login favicon, Sign in to Log in
