function utf8ToBase64(str: string) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str); // 转换为 Uint8Array
    let binary = "";
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary);
}

function base64ToUtf8(base64: string) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
}

export { utf8ToBase64, base64ToUtf8 };
