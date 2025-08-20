#Requires AutoHotkey v2.0
#SingleInstance Force

global lastClipboard := ""
global lastClipboardTime := 0
global autoTriggerLength := 7
global cooldownMs := 60000  ; 60 seconds

; Hook into clipboard change event
OnClipboardChange(WatchClipboard)

WatchClipboard(type) {
    global lastClipboard, lastClipboardTime, autoTriggerLength, cooldownMs

    if (type != 1)  ; Only react to text
        return

    text := A_Clipboard
    now := A_TickCount

    ; Check if text is short and not blank
    if (text != "" && StrLen(text) < autoTriggerLength) {
        ; If it's the same as before AND less than 60s since last time → skip
        if (text = lastClipboard && (now - lastClipboardTime < cooldownMs)) {
            return
        }

        ; Update state and run automation
        lastClipboard := text
        lastClipboardTime := now
        SendToTradingApps(text)
        A_Clipboard := ""  ; Clear clipboard after sending
    }
}

SendToTradingApps(text) {
    originalClipboard := A_Clipboard
    textToSend := StrLower(text)
    Sleep 50

    ; === TradingView: keystrokes ===
    if WinExist("ahk_exe TradingView.exe") {
        WinActivate
        WinWaitActive("", , 2)
        ToolTip "Sending to TradingView..."
        SendInput("{Raw}" . textToSend)
        Sleep 50
        Send("{Enter}")
        ToolTip
    }

    Sleep 50

    ; === DAS Trader: focus montage + paste ===
    if WinExist("ahk_exe DasTrader64.exe") {
        A_Clipboard := textToSend
        Sleep 50
        WinActivate
        WinWaitActive("", , 2)

        ; Focus the Montage window using Shift+M
        Send("+m")
        Sleep 50  ; Let Montage gain focus

        ToolTip "Pasting to DAS Trader..."
        Send("^v")
        Sleep 50
        Send("{Enter}")
        ToolTip
    }

    Sleep 50
    A_Clipboard := originalClipboard
}
