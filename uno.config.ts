import { defineConfig, presetAttributify, transformerAttributifyJsx, transformerVariantGroup } from 'unocss'
import transformerCompileClass from '@unocss/transformer-compile-class'

export default defineConfig({
  presets: [
    presetAttributify(),
  ],
  transformers: [
    transformerCompileClass(),
  ]
})