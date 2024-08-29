// Function to encode a string to Uint8Array
export function encodeString(str: string) {
    return new TextEncoder().encode(str);
}

// Function to decode Uint8Array to string
export function decodeString(uint8Array: Uint8Array) {
    return new TextDecoder().decode(uint8Array);
}

// Function to convert Uint8Array to URL-safe string
export function uint8ArrayToUrlSafeBase64(uint8Array: Uint8Array) {
    const base64 = btoa(String.fromCharCode.apply(null, uint8Array as unknown as number[]));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Function to convert URL-safe string back to Uint8Array
export function urlSafeBase64ToUint8Array(urlSafeBase64: string) {
    const base64 = urlSafeBase64.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(base64);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
    return uint8Array;
}

// Example usage
// const originalString = "Hello, World!";
// console.log("Original string:", originalString);

// const encodedArray = encodeString(originalString);
// console.log("Encoded Uint8Array:", encodedArray);

// const urlSafeString = uint8ArrayToUrlSafeBase64(encodedArray);
// console.log("URL-safe string:", urlSafeString);

// const recoveredArray = urlSafeBase64ToUint8Array(urlSafeString);
// console.log("Recovered Uint8Array:", recoveredArray);

// const decodedString = decodeString(recoveredArray);
// console.log("Decoded string:", decodedString);