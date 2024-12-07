# Auto-Chae VSCode Extension

This VSCode extension scans your Elixir code for modules that utilize specific macro patterns and automatically inserts or sorts the required require statements alphabetically.

## Features

Automatically detects and extracts modules using specific macro patterns from your elixir code.
Inserts the necessary require statements at a defined location and Sorts the statements alphabetically 

## Installation

Install the extension from `.vsix` file.

```sh
code --install-extension auto-chae-0.0.1.vsix 
```

## Usage

1. Open an Elixir file in VSCode.
1. Execute the Auto Requires command from the command palette (Ctrl+Shift+P).
1. The extension will automatically manage the required require statements.

## Settings

### Basic Behavior


* Within the `# >> auto` and `# << auto` regions, the extension will identify and automatically generate the required require statements, sorting them alphabetically.
* Supports module patterns like:
  * Cms.OOO - style modules (e.g., rec, match, select, etc.)
  * General modules: packet!, msg, rec, send

Example usage:
```elixir
defmodule SampleModule do
  import Logger
  import Debug
  use Qbbbb
  # >> auto
  require OtherA
  require OtherC
  # << auto

  ...
  ...
  def test(state) do
     state = OtherA.send(state)
     _rec2 = OtherC.rec(b: 1, c: 3)
     state
  end
  ...
end
```

### Custom Configuration
* You can fine-tune the extension by specifying custom regex patterns for module matching or defining exclusions within your workspace settings.

Example configuration:
```json
"auto-chae.majorRegexPattern": "(Cms\\.[\\w]+)\\.(rec|match|match_object|match_delete|match_limit|select|select_replace|select_delete|select_limit|select_count)\\("
"auto-chae.minorRegexPattern": "([.\\w]+)\\.(packet!|msg|rec|send)\\("
"auto-chae.requireScopePattern": "([ \\t]*)# >{1,} auto([\\s\\S]*?)# <{1,} auto"
"auto-chae.excludeModules": [
  "SessionDirectory"
]
```