// theme.wind4.ts
import type { Theme } from '@unocss/preset-wind4/theme'

const sans = [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Helvetica',
    'Arial',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
].join(', ')

const mono = [
    'Fira Code',
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace',
].join(', ')

export const theme = {
    font: {
        sans,
        mono,
    },

    // preset-typography 版本可能还在读 theme.fontFamily.mono，
    // 这里加一个兼容别名，避免 code block monospace 变 undefined 的坑
    fontFamily: {
        sans,
        mono,
    },
} satisfies Theme
