# CardputerZero Key Specifications

## Dedicated Function Keys

Side **Boot** key: Used to trigger USB boot mode before powering on.<br>
Side **USB-SW** slider: Used to switch the USB connection path.<br>
Upper-right power switch: Slide to the right to power on. Slide to the left to initiate the shutdown process (does **not** cut off power immediately).<br>
Upper-left **ESC** key: Short press to send **ESC**. Long press to return to **HOME**.<br>
Upper-right **TAB** key: Short press functions as a standard **TAB** key. Long press to start AI voice input (This feature is not yet implemented).<br>

## Modifier Keys

The **sym** key is used to enter symbols, corresponding to the **blue** legends on the keyboard overlay.<br>
The **shift** key is used to enter uppercase letters.<br>
The **fn** key is used for function key combinations, corresponding to the **orange** legends on the keyboard overlay. See the following sections for details.<br>

Trigger behavior of the **sym**, **shift**, and **fn** modifier keys:
- **Press the modifier key once**: The corresponding indicator **blinks slowly**. Press any alphanumeric key to enter the corresponding character and exit modifier mode, or press the modifier key once again to exit modifier mode.
- **Press the modifier key twice**: The corresponding indicator **blinks rapidly**. You can press multiple alphanumeric keys consecutively (for example, to enter multiple symbols or uppercase letters). Press the modifier key once or twice again to exit modifier mode.
- **Press and hold the modifier key**: The corresponding indicator **stays on**. You can press one or more alphanumeric keys. Releasing the modifier key exits modifier mode.

The **ctrl** and **alt** keys behave the same as on a standard keyboard.

## Function Key Combinations

fn + Number **1~9** = **F1~F9**<br>
fn + Number **0** = **F10**<br>
fn + Letter **O** = **F11**<br>
fn + Letter **P** = **F12**<br>
fn + **Backspace** (delete to the left) = **DELETE** (delete to the right)<br>
fn + Letter **Q** = **Play / Pause**<br>
fn + Letter **W** = **Previous Track**<br>
fn + Letter **E** = **Next Track**<br>
fn + Letter **U** = **Decrease Screen Brightness**<br>
fn + Letter **I** = **Increase Screen Brightness**<br>
fn + Letter **A** = **Mute**<br>
fn + Letter **S** = **Volume Down**<br>
fn + Letter **D** = **Volume Up**<br>
fn + Letter **F** = **Up Arrow**<br>
fn + Letter **Z** = **Left Arrow**<br>
fn + Letter **X** = **Down Arrow**<br>
fn + Letter **C** = **Right Arrow**<br>
fn + Letter **H** = **Show / Hide Application Help**<br>
fn + Letter **J** = **Take Screenshot** (**PrintScreen** key)<br>
fn + Letter **K** = Standard **Home** key<br>
fn + Letter **L** = Standard **PageUp** key<br>
fn + Letter **M** = Standard **PageDown** key<br>
fn + Letter **B** = Standard **Insert** key<br>
fn + Letter **N** = Standard **End** key<br>

## Recommended Key Mapping Design

The CardputerZero display is aligned with the **4~8** number keys below it. It is recommended to use these five keys for the most frequently used actions. As shown below, display an icon and/or text label at the bottom of the screen to indicate the function of each key, with a short vertical line pointing to the corresponding key. The recommended **center** X coordinates of the five icons are `180, 236, 292, 348, 404`, the recommended Y coordinate is `153`, and the recommended icon size is `22 * 22`.

In addition to the **4~8** number keys, you can also use other keys such as **OK (Enter)**, **Space**, **ESC**, or letter keys. In this case, it is recommended to display the available keys and their corresponding functions at the bottom of the screen, as shown below.

**Special handling for arrow keys:** When the device is not in text input mode, it is recommended to allow the **F**, **Z**, **X**, and **C** letter keys to function directly as arrow keys, rather than requiring the **fn** modifier. This provides a better user experience.
