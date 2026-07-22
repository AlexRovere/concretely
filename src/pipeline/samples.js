/** Exemples de départ pour l'éditeur de pipeline, un par format. */
export const PIPELINE_SAMPLES = {
  gitlab: `stages: [build, test, deploy]

compile:
  stage: build
  script: [make]

lint:
  stage: test
  needs: [compile]
  script: [make lint]

unit:
  stage: test
  needs: [compile]
  script: [make test]

deploy:
  stage: deploy
  needs: [lint, unit]
  script: [./deploy.sh]
`,
  github: `name: ci
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: make

  lint:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: make lint

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: make test

  deploy:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh
`,
};
