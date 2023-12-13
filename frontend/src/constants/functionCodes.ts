export const placeholdersFunctions = {
  map: {
    title: 'Código map',
    code: `def fmap(key, value, context):
    `,
  },
  reduce: {
    title: 'Código reduce',
    code: `def freduce(key, values, context):
    `,
  },
  combiner: {
    title: 'Código combiner',
    code: `def fcomb (key, values, context):
    `,
  },
} as const
