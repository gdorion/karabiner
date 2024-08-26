import fs from "fs";
import { KarabinerRules } from "./types";
import {
  createHyperSubLayers,
  open,
  createVimHyperTopLevelShortcuts,
  getOpenAppsCommands,
  generateCapsLockToHyperKeyReplacement,
  getWindowMovementCommands,
  createHyperOpenAppsShortcuts,
  getOpenBrowserCommands,
} from "./utils";
import { writeKarabinerFile } from "./file";

const rules: KarabinerRules[] = [
  // Define the Hyper key itself
  generateCapsLockToHyperKeyReplacement(),
  // This needs to be at the top of the file to prevent the W sublayer to take over.
  ...createHyperSubLayers({
    b: getOpenBrowserCommands(),
    // o = "Open" applications
    o: getOpenAppsCommands(),
    // e - "opEn" applications, single left handed key.
    e: getOpenAppsCommands(),
    // w = "Window" via rectangle.app
    w: getWindowMovementCommands(),
  }),
  ...createHyperOpenAppsShortcuts(),
  ...createVimHyperTopLevelShortcuts(),
];

writeKarabinerFile(rules);