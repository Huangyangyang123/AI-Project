import React from "react";
import RouterFromJson from './RouterFromJson'
import { routes } from './makeRoutes'
import Progress from './Progress'

console.log('routes:',routes)

const AppRouter = ()=><RouterFromJson routes={routes} fallback={<Progress />} />

export default AppRouter