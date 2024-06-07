import { TalonMatch } from "./matchers";

const rawActionsList = `
tracking.calibrate() -> None
  Calibrate Eye Tracking
tracking.control1_enabled() -> bool
  Is Control Mouse (Legacy) Enabled?
tracking.control1_toggle(state: bool = None) -> None
  Toggle Control Mouse (Legacy)
tracking.control_debug_toggle(state: bool = None) -> None
  Toggle Control Mouse 2 (Debug View)
tracking.control_enabled() -> bool
  Is Control Mouse Enabled?
tracking.control_gaze_focus_toggle(state: bool = None) -> None
  Toggle Control Mouse 2 (Gaze Focus)
tracking.control_gaze_scroll_toggle(state: bool = None) -> None
  Toggle Control Mouse 2 (Gaze Scroll)
tracking.control_gaze_toggle(state: bool = None) -> None
  Toggle Control Mouse 2 (Gaze Control)
tracking.control_head_toggle(state: bool = None) -> None
  Toggle Control Mouse 2 (Head Control)
tracking.control_mouse_jump_toggle(state: bool = None) -> None
  Toggle Control Mouse 2 (Mouse Jump)
tracking.control_toggle(state: bool = None) -> None
  Toggle Control Mouse
tracking.control_zoom_enabled() -> bool
  Is Control Mouse (Zoom) Enabled?
tracking.control_zoom_toggle(state: bool = None) -> None
  Toggle Control Mouse (Zoom)
tracking.zoom() -> None
  Trigger Eye Zoom / Click
tracking.zoom_cancel() -> None
  Cancel Eye Zoom
menu.check_for_updates()
  Check for updates
menu.open_debug_window()
  Open Debug window
menu.open_log()
  Open Talon log
menu.open_repl()
  Open Talon REPL
menu.open_talon_home()
  Open Talon config folder
app.bundle() -> str
  Get active app's bundle identifier
app.executable() -> str
  Get active app's executable name
app.name() -> str
  Get active app's name
app.notify(body: str = '', title: str = '', subtitle: str = '', sound: bool = False)
  Show a desktop notification
app.path() -> str
  Get active app's file path
app.preferences()
  Open app preferences
app.tab_close()
  Close the current tab
app.tab_detach()
  Move the current tab to a new window
app.tab_next()
  Switch to next tab for this window
app.tab_open()
  Open a new tab
app.tab_previous()
  Switch to previous tab for this window
app.tab_reopen()
  Re-open the last-closed tab
app.window_close()
  Close the current window
app.window_hide()
  Hide the current window
app.window_hide_others()
  Hide all other windows
app.window_next()
  Switch to next window for this app
app.window_open()
  Open a new window
app.window_previous()
  Switch to previous window for this app
browser.address() -> str
  Get page URL
browser.bookmark()
  Bookmark the current page
browser.bookmark_tabs()
  Bookmark all open tabs
browser.bookmarks()
  Open the Bookmarks editor
browser.bookmarks_bar()
  Toggle the bookmarks bar
browser.focus_address()
  Focus address bar
browser.focus_page()
  Focus the page body
browser.focus_search()
  Focus the search box
browser.go(url: str)
  Go to a new URL
browser.go_back()
  Go back in the history
browser.go_blank()
  Go to a blank page
browser.go_forward()
  Go forward in the history
browser.go_home()
  Go to home page
browser.open_private_window()
  Open a private browsing window
browser.reload()
  Reload current page
browser.reload_hard()
  Reload current page (harder)
browser.reload_hardest()
  Reload current page (hardest)
browser.show_clear_cache()
  Show 'Clear Cache' dialog
browser.show_downloads()
  Show download list
browser.show_extensions()
  Show installed extensions
browser.show_history()
  Show recently visited pages
browser.submit_form()
  Submit the current form
browser.title() -> str
  Get page title
browser.toggle_dev_tools()
  Open or close the developer tools
clip.capture_text(key: str)
  Send key sequence and return resulting clipboard text
clip.clear() -> None
  Clear clipboard contents
clip.image() -> Optional[talon.skia.image.Image]
  Get clipboard image
clip.set_image(image: talon.skia.image.Image)
  Set clipboard image
clip.set_text(text: str)
  Set clipboard text
clip.text() -> str
  Get clipboard text
clip.wait(fmt: str = 'text', timeout: float = 0.5)
  Wait for the clipboard to change
code.complete()
  Trigger code autocomplete
code.extend_scope_end()
  Extend selection to end of current scope
code.extend_scope_in()
  Extend selection to start of first inner scope
code.extend_scope_next()
  Extend selection to start of next sibling scope
code.extend_scope_out()
  Extend selection to start of outer scope
code.extend_scope_previous()
  Extend selection to start of previous sibling scope
code.extend_scope_start()
  Extend selection to start of current scope
code.language() -> str
  Return the active programming language
code.rename(name: str)
  Rename selection to <name>
code.scope_end()
  Move cursor to end of current scope
code.scope_in()
  Move cursor to start of first inner scope
code.scope_next()
  Move cursor to start of next sibling scope
code.scope_out()
  Move cursor to start of outer scope
code.scope_previous()
  Move cursor to start of previous sibling scope
code.scope_start()
  Move cursor to start of current scope
code.select_scope()
  Select scope under cursor
code.toggle_comment()
  Toggle comments on the current line(s)
core.cancel_phrase__unstable()
  Cancel the currently running phrase
core.current_command__unstable() -> tuple[talon.scripting.types.CommandImpl, talon.grammar.vm.Capture]
  Return the currently executing command
core.last_command() -> tuple[talon.scripting.types.CommandImpl, talon.grammar.vm.Capture]
  Return the last executed command
core.last_phrase() -> talon.grammar.vm.Capture
  Return the last-spoken phrase
core.recent_commands() -> Sequence[Sequence[tuple[talon.scripting.types.CommandImpl, talon.grammar.vm.Capture]]]
  Return recently executed commands (grouped by phrase)
core.recent_phrases() -> Sequence[talon.grammar.vm.Capture]
  Return recently-spoken phrases
core.repeat_command(times: int = 1)
  Repeat the last command N times
core.repeat_partial_phrase(times: int = 1)
  Repeat the previous phrase or current partial phrase N times
core.repeat_phrase(times: int = 1)
  Repeat the last phrase N times
core.replace_command(commands: Sequence[tuple[talon.scripting.types.CommandImpl, talon.grammar.vm.Capture]])
  Replace the current command in history with one or more commands
core.run_command(cmd: talon.scripting.types.CommandImpl, m: talon.grammar.vm.Capture)
  Run a single command for a recognized phrase
core.run_hotkey(hotkey: talon.scripting.types.ScriptImpl)
  Run all commands for a hotkey
core.run_phrase(phrase: talon.grammar.vm.Capture)
  Run all commands for a recognized phrase
core.run_talon_script(ctx: talon.scripting.rctx.ResourceContext, script: talon.scripting.talon_script.TalonScript, m: talon.grammar.vm.Capture)
  Run a single TalonScript for a recognized phrase
dictate.join_words(words: Sequence[str], separator: str = ' ') -> str
  Join a list of words into a single string for insertion
dictate.lower(p: talon.grammar.vm.Phrase)
  Insert lowercase text with auto_insert()
dictate.natural(p: talon.grammar.vm.Phrase)
  Insert naturally-capitalized text with auto_insert()
dictate.parse_words(p: talon.grammar.vm.Phrase) -> Sequence[str]
  Extract words from a spoken Capture
dictate.replace_words(words: Sequence[str]) -> Sequence[str]
  Replace words according to the dictate.word_map dictionary setting
edit.copy()
  Copy selection to clipboard
edit.cut()
  Cut selection to clipboard
edit.delete()
  Delete selection
edit.delete_all()
  Delete all text in document
edit.delete_left()
  Delete left of cursor
edit.delete_line()
  Delete line under cursor
edit.delete_paragraph()
  Delete paragraph under cursor
edit.delete_right()
  Delete right of cursor
edit.delete_sentence()
  Delete sentence under cursor
edit.delete_word()
  Delete word under cursor
edit.down()
  Move cursor down one row
edit.extend_down()
  Extend selection down one row
edit.extend_file_end()
  Extend selection to end of file
edit.extend_file_start()
  Extend selection to start of file
edit.extend_left()
  Extend selection left one column
edit.extend_line_down()
  Extend selection down one full line
edit.extend_line_end()
  Extend selection to end of line
edit.extend_line_start()
  Extend selection to start of line
edit.extend_line_up()
  Extend selection up one full line
edit.extend_page_down()
  Extend selection down one page
edit.extend_page_up()
  Extend selection up one page
edit.extend_paragraph_end()
  Extend selection to the end of the current paragraph
edit.extend_paragraph_next()
  Extend selection to the start of the next paragraph
edit.extend_paragraph_previous()
  Extend selection to the start of the previous paragraph
edit.extend_paragraph_start()
  Extend selection to the start of the current paragraph
edit.extend_right()
  Extend selection right one column
edit.extend_sentence_end()
  Extend selection to the end of the current sentence
edit.extend_sentence_next()
  Extend selection to the start of the next sentence
edit.extend_sentence_previous()
  Extend selection to the start of the previous sentence
edit.extend_sentence_start()
  Extend selection to the start of the current sentence
edit.extend_up()
  Extend selection up one row
edit.extend_word_left()
  Extend selection left one word
edit.extend_word_right()
  Extend selection right one word
edit.file_end()
  Move cursor to end of file (start of line)
edit.file_start()
  Move cursor to start of file
edit.find(text: str = None)
  Open Find dialog, optionally searching for text
edit.find_next()
  Select next Find result
edit.find_previous()
  Select previous Find result
edit.indent_less()
  Remove a tab stop of indentation
edit.indent_more()
  Add a tab stop of indentation
edit.jump_column(n: int)
  Move cursor to column <n>
edit.jump_line(n: int)
  Move cursor to line <n>
edit.left()
  Move cursor left one column
edit.line_clone()
  Create a new line identical to the current line
edit.line_down()
  Move cursor to start of line below
edit.line_end()
  Move cursor to end of line
edit.line_insert_down()
  Insert line below cursor
edit.line_insert_up()
  Insert line above cursor
edit.line_start()
  Move cursor to start of line
edit.line_swap_down()
  Swap the current line with the line below
edit.line_swap_up()
  Swap the current line with the line above
edit.line_up()
  Move cursor to start of line above
edit.page_down()
  Move cursor down one page
edit.page_up()
  Move cursor up one page
edit.paragraph_end()
  Move cursor to the end of the current paragraph
edit.paragraph_next()
  Move cursor to the start of the next paragraph
edit.paragraph_previous()
  Move cursor to the start of the previous paragraph
edit.paragraph_start()
  Move cursor to the start of the current paragraph
edit.paste()
  Paste clipboard at cursor
edit.paste_match_style()
  Paste clipboard without style information
edit.print()
  Open print dialog
edit.redo()
  Redo
edit.right()
  Move cursor right one column
edit.save()
  Save current document
edit.save_all()
  Save all open documents
edit.select_all()
  Select all text in the current document
edit.select_line(n: int = None)
  Select entire line <n>, or current line
edit.select_lines(a: int, b: int)
  Select entire lines from <a> to <b>
edit.select_none()
  Clear current selection
edit.select_paragraph()
  Select the entire nearest paragraph
edit.select_sentence()
  Select the entire nearest sentence
edit.select_word()
  Select word under cursor
edit.selected_text() -> str
  Get currently selected text
edit.selection_clone()
  Insert a copy of the current selection
edit.sentence_end()
  Move cursor to the end of the current sentence
edit.sentence_next()
  Move cursor to the start of the next sentence
edit.sentence_previous()
  Move cursor to the start of the previous sentence
edit.sentence_start()
  Move cursor to the start of the current sentence
edit.undo()
  Undo
edit.up()
  Move cursor up one row
edit.word_left()
  Move cursor left one word
edit.word_right()
  Move cursor right one word
edit.zoom_in()
  Zoom in
edit.zoom_out()
  Zoom out
edit.zoom_reset()
  Zoom to original size
auto_format(text: str) -> str
  Apply text formatting, such as auto spacing, for the native language
auto_insert(text: str)
  Insert text at the current cursor position, automatically formatting it using the actions.auto_format(text)
insert(text: str)
  Insert text at the current cursor position
key(key: str)
  Press one or more keys by name, space-separated
mimic(text: str)
  Simulate speaking {text}
mouse_click(button: int = 0)
  Press and release a mouse button
mouse_drag(button: int = 0)
  Hold down a mouse button
mouse_move(x: float, y: float)
  Move mouse to (x, y) coordinate
mouse_release(button: int = 0)
  Release a mouse button
mouse_scroll(y: float = 0, x: float = 0, by_lines: bool = False)
  Scroll the mouse wheel
mouse_x() -> float
  Mouse X position
mouse_y() -> float
  Mouse Y position
print(obj: Any)
  Display an object in the log
skip()
  Do nothing
sleep(duration: Union[float, str])
  Pause for some duration.
            If you use a number, it is seconds, e.g 1.5 seconds or 0.001 seconds.
            If you use a string, it is a timespec, such as "50ms" or "10s"
            For performance reasons, sleep() cannot be reimplemented by a Context.
migrate.backup_user()
  Backup the .talon/user/ directory to a zip file in .talon/backups/
migrate.v02_all(prefix: str = '', verbose: bool = False)
  Perform migrations for Talon v0.2 on all files in user/
migrate.v02_one(path: str, verbose: bool = False)
  Migrate action() definitions from a .talon file to a new Python file.
mode.disable(mode: str)
  Disable a mode
mode.enable(mode: str)
  Enable a mode
mode.restore()
  Restore saved modes
mode.save()
  Save all active modes
mode.toggle(mode: str)
  Toggle a mode
path.talon_app() -> str
  Path to Talon application
path.talon_home() -> str
  Path to home/.talon
path.talon_user() -> str
  Path to Talon user
path.user_home() -> str
  Path to user home
speech.disable()
  Disable speech recognition
speech.enable()
  Enable speech recognition
speech.enabled() -> bool
  Test if speech recognition is enabled
speech.record_flac()
  Record the phrase audio to a flac file
speech.record_wav()
  Record the phrase audio to a wave file
speech.replay(path: str)
  Replay a .flac or .wav file into the speech engine
speech.set_microphone(name: str)
  Set the currently active microphone - DEPRECATED: use sound.set_microphone()
speech.toggle(value: bool = None)
  Toggle speech recognition
sound.active_microphone() -> str
  Return active microphone name
sound.microphones() -> Sequence[str]
  Return a list of available microphone names
sound.set_microphone(name: str)
  Set the currently active microphone
win.file_ext() -> str
  Return the open file's extension
win.filename() -> str
  Return the open filename
win.title() -> str
  Get window title
math.abs(x: float) -> float
  Compute the absolute value of x
math.acos(x: float) -> float
  Compute the arc cosine of x, in radians
math.acosh(x: float) -> float
  Compute the inverse hyperbolic cosine of x
math.asin(x: float) -> float
  Compute the arc sine of x, in radians
math.asinh(x: float) -> float
  Compute the inverse hyperbolic sine of x
math.atan(x: float) -> float
  Compute the arc tangent of x, in radians
math.atan2(x: float, y: float) -> float
  Compute the arc tangent of (x / y), in radians
math.atanh(x: float) -> float
  Compute the inverse hyperbolic tangent of x
math.bin(n: <function MathActions.int at 0x00000138FDA8AA20>) -> str
  Convert number to binary string
math.cbrt(x: float) -> float
  Compute the cube root of x
math.ceil(x: float) -> float
  Compute the smallest integer greater than or equal to x
math.comb(n: int, k: int) -> int
  Compute the number of ways to choose k from n unordered
math.copysign(x: float, y: float) -> float
  Compute the value of x with the sign of y
math.cos(x: float) -> float
  Compute the cosine of x, in radians
math.cosh(x: float) -> float
  Compute the hyperbolic cosine of x
math.degrees(x: float) -> float
  Convert the angle x from radians to degrees
math.e() -> float
  Get the constant e
math.erf(x: float) -> float
  Compute the error function of x
math.erfc(x: float) -> float
  Compute the complimentary error function of x
math.exp(x: float) -> float
  Compute e ** x
math.exp2(x: float) -> float
  Compute 2 ** x
math.expm1(x: float) -> float
  Compute e ** x - 1
math.factorial(n: int) -> int
  Compute the factorial of n
math.floor(x: float) -> float
  Compute the largest integer less than or equal to x
math.fmod(x: float, y: float) -> float
  Compute floating point modulo of x % y
math.frexp_e(x: float) -> float
  Get the floating point exponent of x
math.frexp_m(x: float) -> float
  Get the floating point mantissa of x
math.gamma(x: float) -> float
  Compute the gamma function of x
math.hex(n: <function MathActions.int at 0x00000138FDA8AA20>) -> str
  Convert number to hex string
math.inf() -> float
  Get the constant inf
math.int(s: str, base: int = 10) -> int
  Convert string to integer
math.isclose(a: float, b: float) -> bool
  Check whether a is close to b
math.isfinite(x: float) -> bool
  Check whether x is a finite number
math.isinf(x: float) -> bool
  Check whether x is infinity
math.isnan(x: float) -> bool
  Check whether x is NaN
math.isqrt(n: int) -> int
  Compute integer square root of n
math.ldexp(m: float, e: int) -> float
  Combine a mantissa and exponent into a float
math.lgamma(x: float) -> float
  Compute the log gamma function of x
math.log(x: float) -> float
  Compute the natural log of x
math.log1p(x: float) -> float
  Compute the natural log of 1+x
math.log2(x: float) -> float
  Compute the base-2 log of x
math.logn(x: float, n: float) -> float
  Compute the base-n log of x
math.max(a: int, b: int) -> int
  Select the larger number
math.min(a: int, b: int) -> int
  Select the smaller number
math.mod(x: int, y: int) -> int
  Compute modulo of x % y
math.modf_f(x: float) -> int
  Get the fractional part of x
math.modf_i(x: float) -> int
  Get the integer part of x
math.nan() -> float
  Get the constant nan
math.oct(n: <function MathActions.int at 0x00000138FDA8AA20>) -> str
  Convert number to octal string
math.perm(n: int, k: Optional[int] = None) -> int
  Compute the ways to choose k items from n ordered
math.pi() -> float
  Get the constant pi
math.pow(x: float, y: float) -> float
  Compute x raised to the power y
math.radians(x: float) -> float
  Convert the angle x from degrees to radians
math.random() -> float
  Generate random number between 0.0 - 1.0
math.randrange(a: int, b: int) -> int
  Generate random number where a <= n < b
math.remainder(x: float, y: float) -> float
  Compute the remainder of x / y
math.round(n: float, precision: Optional[int] = None) -> float
  Round to nearest, with optional precision
math.sin(x: float) -> float
  Compute the sine of x, in radians
math.sinh(x: float) -> float
  Compute the hyperbolic sine of x
math.sqrt(x: float) -> float
  Compute the square root of x
math.tan(x: float) -> float
  Compute the tangent of x, in radians
math.tanh(x: float) -> float
  Compute the hyperbolic tangent of x
math.tau() -> float
  Get the constant tau
math.trunc(x: float) -> int
  Get the integer part of x
math.urandom(n: int) -> bytes
  Generate n cryptographically random bytes
bytes.base64(b: bytes) -> str
  Convert bytes to base64
bytes.decode(b: bytes, encoding: str = 'utf8', errors: str = 'strict') -> bytes
  Decode bytes to string
bytes.frombase64(s: str) -> bytes
  Convert base64 to bytes
bytes.fromhex(s: str) -> bytes
  Convert hex to bytes
bytes.hex(b: bytes) -> str
  Convert bytes to hex
string.capitalize(s: str) -> str
  Capitalize the first letter of string
string.casefold(s: str) -> str
  Case fold string
string.center(s: str, width: int, fillchar: Optional[str] = None) -> str
  Center string by padding to width
string.chr(i: int) -> str
  Convert a Unicode code point into a string
string.contains(haystack: str, needle: str) -> bool
  Check whether haystack contains needle
string.count(s: str, sub: str, start: Optional[int] = None, end: Optional[int] = None) -> str
  Count the number of instances of sub in string, with optional start/end
string.encode(s: str, encoding: str = 'utf8') -> bytes
  Encode string to bytes
string.endswith(s: str, suffix: str) -> bool
  Check whether string ends with suffix
string.expandtabs(s: str, tabsize: int = 8) -> str
  Expand tabs to spaces
string.find(s: str, sub: str, start: Optional[int] = None, end: Optional[int] = None)
  Find sub in string, with optional start/end
string.index(s: str, sub: str, start: Optional[int] = None, end: Optional[int] = None)
  Find sub in string, with optional start/end, raising an error if not found
string.isalnum(s: str) -> bool
  Check if string contains only alphanumeric characters
string.isalpha(s: str) -> bool
  Check if string contains only alphabet characters
string.isascii(s: str) -> bool
  Check if string contains only ascii characters
string.isdecimal(s: str) -> bool
  Check if string contains only decimal characters
string.isdigit(s: str) -> bool
  Check if string contains only digits
string.islower(s: str) -> bool
  Check if string is lowercase
string.isprintable(s: str) -> bool
  Check if string contains only printable characters
string.isspace(s: str) -> bool
  Check if string contains only whitespace characters
string.istitle(s: str) -> bool
  Check if string is title cased
string.isupper(s: str) -> bool
  Check if string is uppercase
string.join(s: str, sequence: Sequence[str]) -> str
  Join a sequence using string
string.ljust(s: str, width: int, fillchar: Optional[str] = None) -> str
  Left justify string by padding to width
string.lower(s: str) -> str
  Lowercase string
string.lstrip(s: str, chars: Optional[str] = None) -> str
  Strip characters from the left of string
string.ord(s: str) -> int
  Convert a character into a Unicode code point
string.removeprefix(s: str, prefix: str) -> str
  Remove prefix from string if present
string.removesuffix(s: str, suffix: str) -> str
  Remove suffix from string if present
string.replace(s: str, old: str, new: str, count: int = -1) -> str
  Replace [count] instances of old with new
string.rfind(s: str, sub: str, start: Optional[int] = None, end: Optional[int] = None)
  Find sub in string (from the right), with optional start/end
string.rindex(s: str, sub: str, start: Optional[int] = None, end: Optional[int] = None)
  Find sub in string (from the right), with optional start/end, raising an error if not found
string.rjust(s: str, width: int, fillchar: Optional[str] = None) -> str
  Right justify string by padding to width
string.rsplit(s: str, sep: Optional[str] = None, maxsplit: int = -1) -> str
  Split using separator or whitespace [maxsplit] times from the right
string.rstrip(s: str, chars: Optional[str] = None) -> str
  Strip characters from the right of string
string.slice(s: str, a: int, b: Optional[int] = None, c: Optional[int] = None)
  Slice string, following python slicing rules [a:b:c]
string.split(s: str, sep: Optional[str] = None, maxsplit: int = -1) -> str
  Split using separator or whitespace [maxsplit] times
string.splitlines(s: str, keepends: bool = False) -> list[str]
  Split string into a list of lines
string.startswith(s: str, prefix: str) -> bool
  Check whether string starts with prefix
string.strip(s: str, chars: Optional[str] = None) -> str
  Strip characters from both sides of string
string.swapcase(s: str) -> str
  Swap the case of string
string.title(s: str) -> str
  Titlecase string
string.upper(s: str) -> str
  Uppercase string
dict.clear(d: dict) -> None
  Clear a dict
dict.contains(d: dict, key: Any) -> bool
  Check if key appears in dict
dict.copy(d: dict) -> dict
  Copy a dict
dict.get(d: dict, key: Any, default: Any = None) -> Any
  Get dict[key]
dict.new() -> dict
  Create an empty dict
dict.pop(d: dict, key: Any) -> Any
  Remove and return dict[key]
dict.set(d: dict, key: Any, value: Any) -> None
  Set dict[key] = value
dict.update(a: dict, b: dict) -> None
  Copy all key/value pairs from b into a
list.append(l: list, value: Any) -> None
  Append to a list
list.clear(l: list) -> None
  Clear a list
list.contains(l: list, value: Any) -> bool
  Check if value appears in list
list.copy(l: list) -> list
  Copy a list
list.count(l: list, value: Any) -> int
  Count the number of times value appears in a list
list.extend(a: list, b: list) -> None
  Append every item of b to a
list.get(l: list, index: int) -> Any
  Get list[index]
list.index(l: list, value: Any) -> int
  Get the first index of value
list.insert(l: list, index: int, value: Any) -> int
  Insert value into list at index
list.new() -> list
  Create an empty list
list.pop(l: list, index: int = -1) -> Any
  Remove and return item from list at index
list.remove(l: list, value: Any) -> None
  Remove value from list
list.reverse(l: list) -> None
  Reverse list in place
list.set(l: list, index: int, value: Any) -> None
  Set list[index] = value
list.sort(l: list) -> None
  Sort list in place
set.add(s: set, value: Any) -> None
  Add value to set
set.clear(s: set) -> None
  Clear set
set.contains(s: set, value: Any) -> bool
  Check if value appears in set
set.copy(s: set) -> set
  Copy set
set.difference(a: set, b: set) -> set
  Get the difference of two sets
set.discard(s: set, value: Any) -> None
  Remove value from set if it exists
set.intersection(a: set, b: set) -> set
  Get the intersection of two sets
set.isdisjoint(a: set, b: set) -> bool
  True if a and b don't intersect
set.issubset(a: set, b: set) -> bool
  True if b contains a
set.issuperset(a: set, b: set) -> bool
  True if a contains b
set.new() -> set
  Create an empty set
set.pop(s: set) -> Any
  Remove and return arbitrary set item
set.remove(s: set, value: Any) -> None
  Remove value from set
set.symmetric_difference(a: set, b: set) -> set
  Get all values present in exactly one of the provided sets
set.union(a: set, b: set) -> set
  Get the union of a and b
set.update(a: set, b: set) -> None
  Add all items from b to a
tuple.contains(t: tuple, value: Any) -> bool
  Check if value appears in tuple
tuple.count(t: tuple, value: Any) -> int
  Count the number of times value appears in tuple
tuple.index(t: tuple, value: Any) -> int
  Get the first index of value
tuple.new() -> tuple
  Create an empty tuple
types.bytes(v: Any = <object object at 0x00000138BFD1E0A0>) -> str
  Create a bytes object
types.dict() -> dict
  Create a dict
types.list(v: Any = <object object at 0x00000138BFD1E0A0>) -> <function TypesActions.str at 0x00000138FDABAD40>
  Create a list
types.none() -> None
  Get an instance of None
types.set(v: Any = <object object at 0x00000138BFD1E0A0>) -> set
  Create a set
types.str(v: Any = <object object at 0x00000138BFD1E0A0>) -> str
  Create a string
types.tuple(v: Any = <object object at 0x00000138BFD1E0A0>) -> tuple
  Create a tuple
time.day(dt: datetime.datetime) -> int
  Get the day from a datetime
time.format(dt: datetime.datetime, fmt: str) -> str
  Format a datetime strftime-style
time.fromisoformat(s: str) -> datetime.datetime
  Get a datetime from ISO 8601 format
time.fromtimestamp(ts: float) -> datetime.datetime
  Get datetime from unix timestamp
time.fromutctimestamp(ts: float) -> datetime.datetime
  Get datetime from UTC unix timestamp
time.hour(dt: datetime.datetime) -> int
  Get the hour from a datetime
time.isoformat(dt: datetime.datetime) -> str
  Format a datetime using ISO 8601
time.microsecond(dt: datetime.datetime) -> int
  Get the microseconds from a datetime
time.minute(dt: datetime.datetime) -> int
  Get the minute from a datetime
time.monotonic() -> float
  Get monotonic system time
time.month(dt: datetime.datetime) -> int
  Get the month from a datetime
time.now() -> datetime.datetime
  Get the current date/time
time.parse(s: str, fmt: str) -> datetime.datetime
  Parse a datetime, strptime-style
time.second(dt: datetime.datetime) -> int
  Get the seconds from a datetime
time.timestamp(dt: datetime.datetime) -> float
  Get unix timestamp from datetime
time.utcnow() -> datetime.datetime
  Get the current date/time in UTC
time.utctimestamp(dt: datetime.datetime) -> float
  Get UTC unix timestamp from datetime
time.year(dt: datetime.datetime) -> int
  Get the year from a datetime
`;

interface ActionDesc {
    language: "python";
    path: "Talon default";
    name: string;
    docstr: string;
    targetText: string;
}

const actionsList: ActionDesc[] = Array.from(
    rawActionsList.matchAll(/^(([\w\d.]+)\([\s\S]*?\)[\s\S]*?)\n(?:[ ]+[\s\S]+?\n)+/gm)
).map((r) => {
    const signature = r[1].replace(/^\w+\./, "");
    const name = r[2];
    let docstr = r[0].substring(r[1].length + 1);
    const indent = docstr.match(/^[ ]+/)?.[0] ?? "";
    docstr = docstr.replace(new RegExp(`^${indent}`, "gm"), "").trimEnd();
    const targetText = `def ${signature}:\n    """${docstr}"""`;
    return {
        language: "python",
        path: "Talon default",
        name,
        docstr,
        targetText
    };
});

export function searchInDefaultTalonActions(match: TalonMatch): ActionDesc[] {
    if (match.type !== "action") {
        return [];
    }
    if ("name" in match) {
        return actionsList.filter((r) => r.name === match.name);
    }
    return actionsList.filter((r) => r.name.startsWith(match.prefix));
}
