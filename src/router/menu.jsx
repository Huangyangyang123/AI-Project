import React from 'react'
import { get } from '@/shared'
export const icon = (src) => (
  <span style={{ paddingTop: '1px' }}>
    < img src={src} />
  </span>
)
export const menu = async () => {
  // /privilege/inapi/queryusermenus
  const result = await get('/privilege/inapi/queryusermenus')
  const { resources } = result
  return resources
}