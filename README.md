# RPG Mapper

A CRPG mapping app for iPad.

## Status

![CI](https://github.com/joekucera2002/rpg-mapper/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/joekucera2002/rpg-mapper/branch/main/graph/badge.svg)](https://codecov.io/gh/joekucera2002/rpg-mapper)

## Development

### Prerequisites

- Node 22
- Xcode
- Expo CLI

### Setup

```bash
npm install
npx expo prebuild
npm run ios
```

### Scripts

```bash
npm run ios          # build and run on iPad simulator
npm run ios:simulator # fast JS reload
npm run lint         # run ESLint
npm run lint:fix     # fix ESLint errors
npm run typecheck    # TypeScript type check
npm run test         # run tests
npm run test:watch   # run tests in watch mode
npm run test:coverage # run tests with coverage report
```
