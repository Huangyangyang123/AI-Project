import React,{ Suspense } from "react";
import { Switch, Route, Redirect } from 'react-router-dom'
import ErrorBoundary from './ErrorBoundary'

const Nest = ({ path = '', routes = [], fullPath, component: Component, fallback })=>(
    <Route path={path} exact={fullPath.endsWith('/index')}>
        <Component>
        <ErrorBoundary>
            <Suspense fallback={fallback}>
            {routes.map((route) => (
                <Nest key={route.path} fallback={fallback} {...route} />
            ))}
            </Suspense>
        </ErrorBoundary>
        </Component>
    </Route>
)

const RouterFromJson = ({ fallback, routes = [] })=>(
    <ErrorBoundary>
        <Suspense fallback={fallback}>
            <Switch>
                <Redirect exact from='/' to='/main' />
                {
                    routes.map((route) => {
                        return route.routes ? (
                            <Nest key={route.path} fallback={fallback} {...route} />
                        ) : (
                            <Route exact key={route.path} path={route.path} component={route.component} />
                        )
                    }
                )}
            </Switch>
        </Suspense>
    </ErrorBoundary>
)

export default RouterFromJson