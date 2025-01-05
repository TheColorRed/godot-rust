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

## New Rust Project

This will create a new rust project with the necessary files to work with Godot.

To create a new project, run the following command, it has interactive prompts to help you create your project.

```sh
npx godot-rust@latest new
```

## Convert Existing Godot Project

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
