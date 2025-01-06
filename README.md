# Godot Rust Tools

This repository contains tools for working with Rust and Godot.

## Prerequisites

### Required

- [Node.js](https://nodejs.org/en/download/) &ndash; Used to run the scripts
- [Rust](https://www.rust-lang.org/tools/install) &ndash; Used to run cargo commands

### Optional

- [Godot](https://godotengine.org/download) &ndash; Used to run necessary commands for Godot projects
  - Godot needs to be in your path to run the `godot` command
- [Git](https://git-scm.com/downloads) &ndash; Used to run necessary commands for Git projects
  - Git needs to be in your path to run the `git` command

## Commands

These are the supported commands.

```sh
# To see the information about the commands:
npx godot-rust@latest help

# To see the information about a specific command (where <command> is the command you want help for):
npx godot-rust@latest <command> -h
```

### New Rust Project

This will create a new rust project with the necessary files to work with Godot.

To create a new project, run the following command, it has interactive prompts to help you create your project.

```sh
npx godot-rust@latest new
```

### Convert Existing Godot Project

This will convert an existing Godot project to a Godot Rust project.

Run the command in a folder that contains a `project.godot` file, it has interactive prompts to help you convert your project.

1. Add Rust to the project
   - Adds a new `rust` folder to the project
2. Restructure the project and add Rust (**<span style="color:red">Backup your project before running a restructure</span>**)
   - Moves the existing project to a `<my-project>/godot` folder
   - Creates a new Rust project in `<my-project>/rust`

```sh
npx godot-rust@latest convert
```

### Add Tools

This will allow you to add tools that are available in the [database](assets/tool-db.json). This supports three types of tools:

1. [Crates](https://crates.io/) &ndash; Rust libraries
2. [Godot Asset Libraries](https://godotengine.org/asset-library) &ndash; Godot assets
3. Github Releases &ndash; Libraries that are from Github releases page marked as `latest`

```sh
npx godot-rust@latest add
```

### Remove Tools

This will allow you to remove tools from your project.\
**Note:** Currently this only supports removing Rust crates.

```sh
npx godot-rust@latest remove
# or
npx godot-rust@latest rm
```