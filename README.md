[![Build Status](https://travis-ci.org/mendixlabs/rich-text.svg?branch=master)](https://travis-ci.org/mendixlabs/rich-text)
[![Dependency Status](https://david-dm.org/mendixlabs/rich-text.svg)](https://david-dm.org/mendixlabs/rich-text)
[![Dev Dependency Status](https://david-dm.org/mendixlabs/rich-text.svg#info=devDependencies)](https://david-dm.org/mendixlabs/rich-text#info=devDependencies)
[![codecov](https://codecov.io/gh/mendixlabs/rich-text/branch/master/graph/badge.svg)](https://codecov.io/gh/mendixlabs/rich-text)

# Rich Text
Rich inline or toolbar text editing

## Features
* Format selected text
* HTML output of formatted text
* Show editor options either on a toolbar or as a bubble
* Use the custom option to select which editing options you want to show

### Keyboard shortcuts
* Ctrl + B: Bold
* Ctrl + I: Italic
* Ctrl + U: Underline
* Ctrl + Z: Undo
* Ctrl + Y: Redo
* -, space : start list
* tab: not functional, go to next input field

## Dependencies
Mendix 7.4

## Demo project
http://texteditorwidget.mxapps.io
![Running rich text toolbar widget](/assets/Demo-Toolbar.png)
![Running rich text bubble widget](/assets/Demo-Bubble.png)

## Usage
Place the widget in a data view, list view or template grid with a data source that has a string attribute and select the 'Value attribute' that contains the editable text.

## Issues, suggestions and feature requests
We are actively maintaining this widget, please report any issues or suggestion for improvement at https://github.com/mendixlabs/rich-text/issues

## Development and contribution
Please follow [development guide](/development.md).
