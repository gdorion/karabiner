import fs from "fs";
import { KarabinerRules } from "./types";
import { createHyperSubLayers, open, rectangle, createVimHyperTopLevelShortcuts, getOpenAppsCommands, generateCapsLockToHyperKeyReplacement, getWindowMovementCommands } from "./utils";

const rules: KarabinerRules[] = [
  // Define the Hyper key itself
  generateCapsLockToHyperKeyReplacement(),
  ...createHyperSubLayers({
    spacebar: open(
      "raycast://extensions/stellate/mxstbr-commands/create-notion-todo"
    ),
    b: {
      c: open("https://calendar.google.com.com"),
      // Quarterly "P"lan
      m: open("https://mail.google.com"),
      a: open("https://localhost:3000"),
      f: open("https://facebook.com"),
      d: open("https://drive.google.com"),
      g: open("https://github.com/ventionco"),
    },
    // o = "Open" applications
    // e - "opEn" applications, single left handed key.
    o: getOpenAppsCommands(),
    e: getOpenAppsCommands(),
    // w = "Window" via rectangle.app
    w: getWindowMovementCommands(),

    // s = "System"
    s: {
      u: {
        to: [
          {
            key_code: "volume_increment",
          },
        ],
      },
      j: {
        to: [
          {
            key_code: "volume_decrement",
          },
        ],
      },
      i: {
        to: [
          {
            key_code: "display_brightness_increment",
          },
        ],
      },
      k: {
        to: [
          {
            key_code: "display_brightness_decrement",
          },
        ],
      },
      l: {
        to: [
          {
            key_code: "q",
            modifiers: ["right_control", "right_command"],
          },
        ],
      },
      p: {
        to: [
          {
            key_code: "play_or_pause",
          },
        ],
      },
      semicolon: {
        to: [
          {
            key_code: "fastforward",
          },
        ],
      },
      e: open(
        `raycast://extensions/thomas/elgato-key-light/toggle?launchType=background`
      ),
      // "D"o not disturb toggle
      d: open(
        `raycast://extensions/yakitrak/do-not-disturb/toggle?launchType=background`
      ),
      // "T"heme
      t: open(`raycast://extensions/raycast/system/toggle-system-appearance`),
      c: open("raycast://extensions/raycast/system/open-camera"),
      // 'v'oice
      v: {
        to: [
          {
            key_code: "spacebar",
            modifiers: ["left_option"],
          },
        ],
      },
    },

    // v = "moVe" which isn't "m" because we want it to be on the left hand
    // so that hjkl work like they do in vim
    v: {
      h: {
        to: [{ key_code: "left_arrow" }],
      },
      j: {
        to: [{ key_code: "down_arrow" }],
      },
      k: {
        to: [{ key_code: "up_arrow" }],
      },
      l: {
        to: [{ key_code: "right_arrow" }],
      },
      // Magicmove via homerow.app
      m: {
        to: [{ key_code: "f", modifiers: ["right_control"] }],
        // TODO: Trigger Vim Easymotion when VSCode is focused
      },
      // Scroll mode via homerow.app
      s: {
        to: [{ key_code: "j", modifiers: ["right_control"] }],
      },
      d: {
        to: [{ key_code: "d", modifiers: ["right_shift", "right_command"] }],
      },
      u: {
        to: [{ key_code: "page_down" }],
      },
      i: {
        to: [{ key_code: "page_up" }],
      },
    },

    // c = Musi*c* which isn't "m" because we want it to be on the left hand
    c: {
      p: {
        to: [{ key_code: "play_or_pause" }],
      },
      n: {
        to: [{ key_code: "fastforward" }],
      },
      b: {
        to: [{ key_code: "rewind" }],
      },
    },
  }),
  ...createVimHyperTopLevelShortcuts(),
];

fs.writeFileSync(
  "karabiner.json",
  JSON.stringify(
    {
      global: {
        show_in_menu_bar: true,
        ask_for_confirmation_before_quitting: false,
        check_for_updates_on_startup: true,
        show_profile_name_in_menu_bar: false,
        unsafe_ui: false
      },
      profiles: [
        {
          name: "Default",
          complex_modifications: {
            rules,
          },
        },
      ],
    },
    null,
    2
  )
);
