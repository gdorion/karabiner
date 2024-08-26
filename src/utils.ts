import { To, KeyCode, Manipulator, KarabinerRules } from "./types";

/**
 * Custom way to describe a command in a layer
 */
export interface LayerCommand {
  to: To[];
  description?: string;
}

type HyperKeySublayer = {
  // The ? is necessary, otherwise we'd have to define something for _every_ key code
  [key_code in KeyCode]?: LayerCommand;
};

export function generateCapsLockToHyperKeyReplacement(): KarabinerRules {
  return {
    description: "Hyper Key (⌃⌥⇧⌘)",
    manipulators: [
      {

        description: "Caps Lock -> Hyper Key",
        from: {
          key_code: "caps_lock",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [
          {
            set_variable: {
              name: "hyper",
              value: 1,
            },
          },
        ],
        to_after_key_up: [
          {
            set_variable: {
              name: "hyper",
              value: 0,
            },
          },
        ],
        to_if_alone: [
          {
            key_code: "escape",
          },
        ],
        type: "basic",
      },
      // disableAltTab(),
    ],
  }
}

/**
 * Create a Hyper Key sublayer, where every command is prefixed with a key
 * e.g. Hyper + O ("Open") is the "open applications" layer, I can press
 * e.g. Hyper + O + G ("Google Chrome") to open Chrome
 */
export function createHyperSubLayer(
  sublayer_key: KeyCode,
  commands: HyperKeySublayer,
  allSubLayerVariables: string[]
): Manipulator[] {
  const subLayerVariableName = generateSubLayerVariableName(sublayer_key);

  return [
    // When Hyper + sublayer_key is pressed, set the variable to 1; on key_up, set it to 0 again
    {
      description: `Toggle Hyper sublayer ${sublayer_key}`,
      type: "basic",
      from: {
        key_code: sublayer_key,
        modifiers: {
          optional: ["any"],
        },
      },
      to_after_key_up: [
        {
          set_variable: {
            name: subLayerVariableName,
            // The default value of a variable is 0: https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/conditions/variable/
            // That means by using 0 and 1 we can filter for "0" in the conditions below and it'll work on startup
            value: 0,
          },
        },
      ],
      to: [
        {
          set_variable: {
            name: subLayerVariableName,
            value: 1,
          },
        },
      ],
      // This enables us to press other sublayer keys in the current sublayer
      // (e.g. Hyper + O > M even though Hyper + M is also a sublayer)
      // basically, only trigger a sublayer if no other sublayer is active
      conditions: [
        ...allSubLayerVariables
          .filter(
            (subLayerVariable) => subLayerVariable !== subLayerVariableName
          )
          .map((subLayerVariable) => ({
            type: "variable_if" as const,
            name: subLayerVariable,
            value: 0,
          })),
        {
          type: "variable_if",
          name: "hyper",
          value: 1,
        },
      ],
    },
    // Define the individual commands that are meant to trigger in the sublayer
    ...(Object.keys(commands) as (keyof typeof commands)[]).map(
      (command_key): Manipulator => ({
        ...commands[command_key],
        type: "basic" as const,
        from: {
          key_code: command_key,
          modifiers: {
            optional: ["any"],
          },
        },
        // Only trigger this command if the variable is 1 (i.e., if Hyper + sublayer is held)
        conditions: [
          {
            type: "variable_if",
            name: subLayerVariableName,
            value: 1,
          },
        ],
      })
    ),
  ];
}

/**
 * Create all hyper sublayers. This needs to be a single function, as well need to
 * have all the hyper variable names in order to filter them and make sure only one
 * activates at a time
 */
export function createHyperSubLayers(subLayers: {
  [key_code in KeyCode]?: HyperKeySublayer | LayerCommand;
}): KarabinerRules[] {
  const allSubLayerVariables = (
    Object.keys(subLayers) as (keyof typeof subLayers)[]
  ).map((sublayer_key) => generateSubLayerVariableName(sublayer_key));

  return Object.entries(subLayers).map(([key, value]) =>
    "to" in value
      ? {
        description: `Hyper Key + ${key}`,
        manipulators: [
          {
            ...value,
            type: "basic" as const,
            from: {
              key_code: key as KeyCode,
              modifiers: {
                optional: ["any"],
              },
            },
            conditions: [
              {
                type: "variable_if",
                name: "hyper",
                value: 1,
              },
              ...allSubLayerVariables.map((subLayerVariable) => ({
                type: "variable_if" as const,
                name: subLayerVariable,
                value: 0,
              })),
            ],
          },
        ],
      }
      : {
        description: `Hyper Key sublayer "${key}"`,
        manipulators: createHyperSubLayer(key as KeyCode, value, allSubLayerVariables),
      }
  );
}

export function getOpenAppTopLevel(key: KeyCode, name: string): Manipulator {
  return {
    type: "basic",
    from: {
      key_code: key,
      "modifiers": { "optional": ["any"] }
    },
    to: app(name).to,
    conditions: [
      {
        "name": "hyper_sublayer_b",
        "type": "variable_if",
        "value": 0
      },
      {
        "name": "hyper_sublayer_o",
        "type": "variable_if",
        "value": 0
      },
      {
        "name": "hyper_sublayer_e",
        "type": "variable_if",
        "value": 0
      },
      {
        "name": "hyper_sublayer_s",
        "type": "variable_if",
        "value": 0
      },
      {
        "name": "hyper_sublayer_v",
        "type": "variable_if",
        "value": 0
      },
      {
        "name": "hyper_sublayer_c",
        "type": "variable_if",
        "value": 0
      },
      {
        "name": "hyper",
        "type": "variable_if",
        "value": 1
      }
    ],
  }
}

export function getBasicModificationShortcut(fromKey: KeyCode, toKey: KeyCode): Manipulator {
  return {
    type: "basic",
    from: {
      key_code: fromKey,
    },
    to: [
      {
        key_code: toKey,
      },
    ],
    conditions: [{ name: "hyper", type: "variable_if", value: 1 }],
  }
}

export function disableAltTab(): Manipulator {
  const manipulator: Manipulator = {
    type: "basic",
    description: "Disable CMD + Tab to force Hyper Key usage",
    from: {
      key_code: "tab",
      modifiers: {
        mandatory: ["left_command"],
      },
    },
    to: [
      {
        key_code: "tab",
      },
    ],
  }

  return manipulator
}

export function createVimHyperTopLevelShortcuts(): KarabinerRules[] {
  return [{
    description: "Change hyper to hjkl arrows",
    manipulators: [
      getBasicModificationShortcut("h", "left_arrow"),
      getBasicModificationShortcut("j", "down_arrow"),
      getBasicModificationShortcut("k", "up_arrow"),
      getBasicModificationShortcut("l", "right_arrow"),
      getBasicModificationShortcut("i", "end"),
      getBasicModificationShortcut("u", "home"),
    ]
  }]
}

export function createHyperOpenAppsShortcuts(): KarabinerRules[] {
  return [{
    description: "Open App at top Level",
    manipulators: [
      getOpenAppTopLevel("c", "Google Chrome"),
      getOpenAppTopLevel("v", "Visual Studio Code"),
      getOpenAppTopLevel("t", "Things3"),
      getOpenAppTopLevel("s", "Things3"),
      getOpenAppTopLevel("d", "UpNote"),
    ]
  }]
}

function generateSubLayerVariableName(key: KeyCode) {
  return `hyper_sublayer_${key}`;
}

/**
 * Shortcut for "open" shell command
 */
export function open(...what: string[]): LayerCommand {
  return {
    to: what.map((w) => ({
      shell_command: `open ${w}`,
    })),
    description: `Open ${what.join(" & ")}`,
  };
}

/**
 * Utility function to create a LayerCommand from a tagged template literal
 * where each line is a shell command to be executed.
 */
export function shell(
  strings: TemplateStringsArray,
  ...values: any[]
): LayerCommand {
  const commands = strings.reduce((acc, str, i) => {
    const value = i < values.length ? values[i] : "";
    const lines = (str + value)
      .split("\n")
      .filter((line) => line.trim() !== "");
    acc.push(...lines);
    return acc;
  }, [] as string[]);

  return {
    to: commands.map((command) => ({
      shell_command: command.trim(),
    })),
    description: commands.join(" && "),
  };
}

/**
 * Shortcut for managing window sizing with Rectangle
 */
export function rectangle(name: string): LayerCommand {
  return {
    to: [
      {
        shell_command: `open -g rectangle://execute-action?name=${name}`,
      },
    ],
    description: `Window: ${name}`,
  };
}

/**
 * Shortcut for "Open an app" command (of which there are a bunch)
 */
export function app(name: string): LayerCommand {
  return open(`-a '${name}.app'`);
}

export function getOpenBrowserCommands(): HyperKeySublayer {
  return {
    c: open("https://calendar.google.com"),
    m: open("https://mail.google.com"),
    a: open("https://localhost:3000"),
    f: open("https://facebook.com"),
    d: open("https://drive.google.com"),
    g: open("https://github.com/ventionco"),
  }
}

export function getOpenAppsCommands(): HyperKeySublayer {
  return {
    b: app("BitWarden"),
    c: app("Google Chrome"),
    e: app("Messenger"),
    v: app("Visual Studio Code"),
    d: app("Docker"),
    s: app("Slack"),
    n: app("Notes"),
    t: app("Things3"),
    // Open todo list managed via *H*ypersonic
    h: open(
      "notion://www.notion.so/vention/Technology-Organization-a72a4aa00b8a431894d4cdc1096bb9f8?pvs=4"
    ),
    m: app("Messages"),
    f: app("Finder"),
    i: app("iTerm"),
    p: app("Spotify"),
    w: app("Microsoft Word"),
    g: app("Gitup"),
  }
}

export function getWindowMovementCommands(): HyperKeySublayer {
  return {
    semicolon: {
      description: "Window: Hide",
      to: [
        {
          key_code: "h",
          modifiers: ["right_command"],
        },
      ],
    },
    s: rectangle("left-half"),
    d: rectangle("maximize"),
    y: rectangle("previous-display"),
    o: rectangle("next-display"),
    k: rectangle("top-half"),
    j: rectangle("bottom-half"),
    h: rectangle("left-half"),
    l: rectangle("right-half"),
    f: rectangle("right-half"),
    u: {
      description: "Window: Previous Tab",
      to: [
        {
          key_code: "tab",
          modifiers: ["right_control", "right_shift"],
        },
      ],
    },
    i: {
      description: "Window: Next Tab",
      to: [
        {
          key_code: "tab",
          modifiers: ["right_control"],
        },
      ],
    },
    n: {
      description: "Window: Next Window",
      to: [
        {
          key_code: "grave_accent_and_tilde",
          modifiers: ["right_command"],
        },
      ],
    },
    b: {
      description: "Window: Back",
      to: [
        {
          key_code: "open_bracket",
          modifiers: ["right_command"],
        },
      ],
    },
    // Note: No literal connection. Both f and n are already taken.
    m: {
      description: "Window: Forward",
      to: [
        {
          key_code: "close_bracket",
          modifiers: ["right_command"],
        },
      ],
    },
  }
}