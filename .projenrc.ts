import { Node20ReactTypeScriptProject } from "dkershner6-projen-react";
import { TextFile } from "projen";
import { Nvmrc } from "projen-nvm";

const PACKAGE_NAME = "use-map-as-state";

const DEV_AND_PEER_DEPENDENCIES = ["immer", "use-immer-produce"];
const DEV_DEPENDENCIES = [
    ...DEV_AND_PEER_DEPENDENCIES,
    "dkershner6-projen-react",
    "projen-nvm",
];
const PEER_DEPENDENCIES = [...DEV_AND_PEER_DEPENDENCIES];

const project = new Node20ReactTypeScriptProject({
    majorVersion: 1,

    defaultReleaseBranch: "main",
    name: PACKAGE_NAME,
    keywords: ["immer", "react", "react-hooks", "hook", "map", "useMapAsState"],
    description:
        "React Hook to use a native JS Map as State, maintaining the interface entirely, and properly handling re-rendering. Uses Immer under the hood.",
    homepage: `https://github.com/dkershner6/${PACKAGE_NAME}#readme`,
    bugsUrl: `https://github.com/dkershner6/${PACKAGE_NAME}/issues`,
    authorName: "Derek Kershner",
    authorUrl: "https://dkershner.com",
    repository: `git+https://github.com/dkershner6/${PACKAGE_NAME}.git`,
    projenrcTs: true,

    devDeps: DEV_DEPENDENCIES,
    peerDeps: PEER_DEPENDENCIES,

    release: true,
    releaseToNpm: true,
    github: true,

    docgen: true,
});

new Nvmrc(project);

new TextFile(project, ".github/CODEOWNERS", { lines: ["* @dkershner6"] });

project.synth();
