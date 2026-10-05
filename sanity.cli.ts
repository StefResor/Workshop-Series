import { defineCliConfig } from 'sanity/cli'
import { dataset, projectId } from './sanity/env'

export default defineCliConfig({
  api: {
    projectId: projectId || 'dx57inng',
    dataset: dataset || 'production',
  },
})
