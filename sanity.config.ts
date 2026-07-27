import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'
import { dataset, projectId } from './sanity/env'

const config = defineConfig({
  name: 'stefanie-schumacher',
  title: 'Stefanie Schumacher',
  projectId: projectId || 'placeholder',
  dataset: dataset || 'production',
  basePath: '/studio',
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
})

export default config
