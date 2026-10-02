"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ASSET_IGNORE = void 0;
exports.resolveAssets = resolveAssets;
const node_path_1 = __importDefault(require("node:path"));
const tinyglobby_1 = require("tinyglobby");
const path_1 = require("./path");
/**
 * Default glob ignore patterns for assets.
 */
exports.DEFAULT_ASSET_IGNORE = ['.gitkeep', '**/.DS_Store', '**/Thumbs.db'];
async function resolveAssets(entries, root) {
    const outputFiles = [];
    for (const entry of entries) {
        if (!(0, path_1.isSubDirectory)(root, entry.input)) {
            throw new Error(`The ${entry.input} asset path must be within the workspace root.`);
        }
        const cwd = node_path_1.default.resolve(root, entry.input);
        const files = await (0, tinyglobby_1.glob)(entry.glob, {
            cwd,
            dot: true,
            ignore: entry.ignore ? [...exports.DEFAULT_ASSET_IGNORE, ...entry.ignore] : exports.DEFAULT_ASSET_IGNORE,
            followSymbolicLinks: entry.followSymlinks,
        });
        for (const file of files) {
            const src = node_path_1.default.join(cwd, file);
            const filePath = entry.flatten ? node_path_1.default.basename(file) : file;
            outputFiles.push({ source: src, destination: node_path_1.default.join(entry.output, filePath) });
        }
    }
    return outputFiles;
}
//# sourceMappingURL=resolve-assets.js.map