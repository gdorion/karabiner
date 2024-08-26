import fs from "fs";
import { KarabinerRules } from "./types";

export function writeKarabinerFile(rules: KarabinerRules[]): void {
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
    ),
  );
}