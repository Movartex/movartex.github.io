export function srgbToLinear(color) {
    return color.map(x => Math.pow(x, 2.2));
}

export function linearToSrgb(color) {
    return color.map(x => Math.pow(x, 1 / 2.2));
}

export function srgbToOklab(srgb) {
    const [r, g, b] = srgbToLinear(srgb);

    const l = Math.pow(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b, 1 / 3);
    const m = Math.pow(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b, 1 / 3);
    const s = Math.pow(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b, 1 / 3);

    return [
        0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
    ];
}

export function oklabToSrgb([l, a, b]) {
    const L = Math.pow(l + 0.3963377774 * a + 0.2158037573 * b, 3);
    const m = Math.pow(l - 0.1055613458 * a - 0.0638541728 * b, 3);
    const s = Math.pow(l - 0.0894841775 * a - 1.2914855480 * b, 3);

    return linearToSrgb([
        +4.0767416621 * L - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * L + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * L - 0.7034186147 * m + 1.7076147010 * s,
    ]);
}

export function oklabToOklch([l, a, b]) {
    return [l, Math.hypot(a, b), Math.atan2(b, 1)];
}

export function oklchToOklab([l, c, h]) {
    return [l, c * Math.cos(h), c * Math.sin(h)];
}

export function srgbToHex(srgb) {
    return `#${srgb.map(x => Math.floor(x * 255).toString(16).padStart(2, '0')).join('')}`;
}

export function hexToSrgb(hex) {
    return [
        parseInt(hex.substring(1, 3), 16) / 255,
        parseInt(hex.substring(3, 5), 16) / 255,
        parseInt(hex.substring(5, 7), 16) / 255,
    ];
}
