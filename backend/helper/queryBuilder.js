function buildNestedFilter(fieldPath, value) {
  const parts = fieldPath.split('.')
  return parts.reduceRight((acc, part) => ({ [part]: acc }), value)
}

export function searchHelper(where, search, fields = []) {
  if (!search?.trim() || !fields.length) return where

  where.AND = where.AND || []
  where.AND.push({
    OR: fields.map((field) =>
      buildNestedFilter(field, {
        contains: search,
        mode: 'insensitive',
      })
    ),
  })

  return where
}

export function booleanFilter(where, field, value) {
  if (value === undefined || value === null || value === '') return where

  const normalized = String(value).toLowerCase()
  if (normalized !== 'true' && normalized !== 'false') return where

  where[field] = normalized === 'true'
  return where
}

export function enumFilter(where, field, value, enumObject) {
  if (!value) return where

  const allowedValues = enumObject ? Object.values(enumObject) : []
  if (allowedValues.length && !allowedValues.includes(value)) return where

  if (Object.prototype.hasOwnProperty.call(where, field)) {
    where.AND = where.AND || []
    where.AND.push({ [field]: where[field] })
    where.AND.push({ [field]: value })
    delete where[field]
  } else {
    where[field] = value
  }

  return where
}

export function dateRangeFilter(where, field, from, to) {
  if (!from && !to) return where

  where[field] = {
    ...(from ? { gte: new Date(from) } : {}),
    ...(to ? { lte: new Date(to) } : {}),
  }

  return where
}
