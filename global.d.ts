/**
 * @fileoverview
 * Defines extra APIs that exist in real web browsers but that are missing from TypeScript's default types.
 */

interface Element {
  /**
   * requestFullscreen() but available in Safari.
   */
  webkitRequestFullscreen?(): unknown;
}

interface Document {
  /**
   * exitFullscreen() but available in Safari.
   */
  webkitExitFullscreen?(): unknown;
  /**
   * fullscreenElement but available in Safari.
   */
  webkitFullscreenElement?: Element;
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/NDEFReader
 */
declare class NDEFReader extends EventTarget {
  constructor();
  scan(options?: { signal?: AbortSignal }): Promise<void>;
  onreading?(event: Event & { message: NDEFMessage }): void;
  onreadingerror?(event: Event): void;
}

type NFCBufferSource = ArrayBuffer | ArrayBufferView;

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/NDEFMessage/NDEFMessage
 */
declare class NDEFMessage {
  constructor(
    records: Array<{
      data?: string | NFCBufferSource | DataView | NDEFRecord[];
      encoding?: string;
      id?: string;
      lang?: string;
      mediaType?: string;
      recordType: string;
    }>
  );
  readonly records: NDEFRecord[];
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/NDEFRecord
 */
declare class NDEFRecord {
  constructor(options: {
    data?: string | NFCBufferSource | DataView | NDEFRecord[];
    encoding?: string;
    id?: string;
    lang?: string;
    mediaType?: string;
    recordType: string;
  });
  readonly recordType: string;
  readonly mediaType: string;
  readonly id: string;
  readonly data: DataView;
  readonly encoding: string | null;
  readonly lang: string | null;
  toRecords(): NDEFRecord[];
}

interface NetworkInformation {
  downlink: number;
  downlinkMax: number;
  effectiveType: string;
  rtt: number;
  saveData: boolean;
  type: "bluetooth" | "cellular" | "ethernet" | "none" | "wifi" | "wimax" | "other" | "unknown";
}

interface Navigator {
  connection?: NetworkInformation;
}

declare namespace Scratch.extensions {
  /**
   * Most extensions fail the type checking of @turbowarp/types-tw's default register().
   * That error generally isn't very useful - so for now we'll just add this overload so
   * that those errors don't appear.
   */
  function register(extensionObj: any): void;
}

/**
 * The Mint API, available in all extension source files.
 * Assets are embedded into the bundle at build time from the `assets/` directory.
 */
declare const mint: {
  asset: {
    /**
     * Returns the data URI for the given asset.
     * Assets are stored in the `assets/` folder.
     * @example mint.asset.get('icon.svg') // returns "data:image/svg+xml;base64,..."
     * @example mint.asset.get('icons/index.svg') // supports subfolders
     * @returns The data URI string, or an empty string if the asset is not found.
     */
    get(name: string): string;
  };
  manifest: {
    /**
     * Returns the string value of the given key from `src/manifest.json`.
     * Build fails if the key does not exist in the manifest.
     * @example mint.manifest.get('name') // returns the extension name
     * @example mint.manifest.get('version') // returns the extension version
     */
    get(key: string): string;
  };
};
