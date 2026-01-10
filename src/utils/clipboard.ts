type ClipboardTarget = {
    writeText?: (value: string) => Promise<void>;
};

export const writeClipboardText = async (
    text: string,
    clipboard: ClipboardTarget | null = null
) => {
    const target =
        clipboard ?? (typeof navigator !== "undefined" ? navigator.clipboard : null);
    if (!target?.writeText) return false;
    await target.writeText(text);
    return true;
};
