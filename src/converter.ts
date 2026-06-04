import { decode, encode } from '@toon-format/toon'
import type { DecodeOptions, EncodeOptions } from '@toon-format/toon'
import { parse as parseJsonc, printParseErrorCode } from 'jsonc-parser'
import type { ParseError } from 'jsonc-parser'

export interface ConversionSuccess {
  success: true
  output: string
}

export interface ConversionFailure {
  success: false
  error: string
  line?: number
}

export type ConversionResult = ConversionSuccess | ConversionFailure

export interface JsonToToonOptions {
  indent?: number
  delimiter?: ',' | '|' | '\t'
  keyFolding?: 'off' | 'safe'
}

export interface ToonToJsonOptions {
  indent?: number
  expandPaths?: 'off' | 'safe'
}

export function jsonToToon(input: string, languageId: string, options: JsonToToonOptions = {}): ConversionResult {
  let data: unknown

  try {
    if (languageId === 'jsonc') {
      const errors: ParseError[] = []
      data = parseJsonc(input, errors, { allowTrailingComma: true })
      if (errors.length > 0) {
        const firstError = errors[0]!
        const line = offsetToLine(input, firstError.offset)
        const errorType = printParseErrorCode(firstError.error)
        return { success: false, error: `${errorType} at line ${line}`, line }
      }
    }
    else {
      data = JSON.parse(input)
    }
  }
  catch (e) {
    const line = extractJsonErrorLine(e as SyntaxError, input)
    return { success: false, error: (e as Error).message, line }
  }

  try {
    const encodeOptions: EncodeOptions = {}
    if (options.indent !== undefined)
      encodeOptions.indent = options.indent
    if (options.delimiter !== undefined)
      encodeOptions.delimiter = options.delimiter
    if (options.keyFolding !== undefined)
      encodeOptions.keyFolding = options.keyFolding

    const output = encode(data, encodeOptions)
    return { success: true, output }
  }
  catch (e) {
    return { success: false, error: `Encode error: ${(e as Error).message}` }
  }
}

export function toonToJson(input: string, options: ToonToJsonOptions = {}): ConversionResult {
  try {
    const decodeOptions: DecodeOptions = { strict: true }
    if (options.expandPaths !== undefined)
      decodeOptions.expandPaths = options.expandPaths

    const data = decode(input, decodeOptions)
    const indent = options.indent ?? 2
    const output = JSON.stringify(data, null, indent)
    return { success: true, output }
  }
  catch (e) {
    const line = (e as { line?: number }).line
    return { success: false, error: (e as Error).message, line }
  }
}

function offsetToLine(text: string, offset: number): number {
  let line = 1
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === '\n')
      line++
  }
  return line
}

// V8-specific: matches "at position N" format. Safe because VS Code always runs on V8.
function extractJsonErrorLine(error: SyntaxError, input: string): number | undefined {
  const match = error.message.match(/position\s+(\d+)/)
  if (match) {
    const offset = Number.parseInt(match[1]!, 10)
    return offsetToLine(input, offset)
  }
  return undefined
}
