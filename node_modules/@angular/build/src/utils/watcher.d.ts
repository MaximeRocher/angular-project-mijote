/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare class ChangedFiles {
    readonly added: Set<string>;
    readonly modified: Set<string>;
    readonly removed: Set<string>;
    get all(): string[];
    toDebugString(): string;
}
export interface BuildWatcher extends AsyncIterableIterator<ChangedFiles> {
    add(paths: string | readonly string[]): void;
    remove(paths: string | readonly string[]): void;
    close(): Promise<void>;
}
export interface WatcherOptions {
    polling?: boolean;
    interval?: number;
    ignored?: string[];
    followSymlinks?: boolean;
    cwd?: string;
}
export interface SetupWatcherOptions {
    workspaceRoot: string;
    projectRoot: string;
    outputPath: string;
    cacheOptions: {
        basePath: string;
        localBasePath?: string;
    };
    poll?: number;
    preserveSymlinks?: boolean;
    signal?: AbortSignal;
    watchFiles?: Iterable<string>;
}
/**
 * Sets up and initializes a file watcher with proper ignore patterns for build outputs and caches.
 */
export declare function setupWatcher(options: SetupWatcherOptions): Promise<BuildWatcher>;
/**
 * Normalizes a file system path string to POSIX format (forward slashes '/')
 * and strips trailing slashes (except root '/' or Windows drive root 'C:/').
 */
export declare function toPosixPathNormalized(pathString: string): string;
/**
 * Returns the parent directory of a normalized POSIX path, correctly handling Windows drive roots.
 */
export declare function getDirectoryPath(posixPath: string): string;
export declare function createWatcher(options?: WatcherOptions): Promise<BuildWatcher>;
/**
 * Checks whether a file path is located inside a parent directory.
 *
 * Input Expectations:
 * - Both `file` and `dir` must be normalized POSIX-style paths (using forward slashes '/').
 * - Both paths must share the same casing normalization (e.g., lowercased on case-insensitive file systems).
 */
export declare function isPathInside(file: string, dir: string): boolean;
/**
 * Extracts the package directory inside node_modules for a given POSIX path.
 *
 * Input Expectations:
 * - `posixPath` must be a normalized POSIX-style path (using forward slashes '/').
 */
export declare function extractNodeModulesPackageDir(posixPath: string): string | undefined;
