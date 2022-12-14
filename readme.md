# Reactxios

> A simple and easy to use Axios provider for react, with support for on-demand configuration.

## Motivation

This project sprouted from a desire of being able to set and configure axios dynamically in multi-tenant apps, while avoiding duplicating interceptors and allowing for integration with other libraries that use hooks. In theory the problem is quite simple in that you can set axios settings whenever the component renders, however this can quickly becomes in-efficient if the provider re-renders many times, especially in large scale applications where the performance of axios (/data fetching) directly reflects the performance of the app. 

This library addresses these issues by instead using react refs and a DeepEquality check to run the setup and optional teardown functions.

## Installation

Ensure that you have the latest version of axios installed:
`yarn add axios` or `npm install axios`

Then install reactxios:
`yarn add reactxios` or `npm install reactxios`

## Getting started

First import the Reactxios component into your top level, below any configuration providers, but above any components dependant on the axios instance.

> Next.js example
```javascript
import { Reactxios } from "reactxios";

/** 
 * Write the setup function outside of the component so it
 * always keeps the same reference! :)
 * The props given to reactxios are automatically passed into the setup function
*/
const setup = (instance, { config }){
  instance.defaults.baseURL = config.baseURL
  instance.interceptors.request.use( cfg => {
    cfg.headers = {
       Accept:"application/json",
      "Content-Type":"application/json"
    }
    return cfg;
  })
}

export function App({PageComponent, pageProps: { config, ...pageProps }}){

  return <Reactxios 
    config={config} 
    setup={setup}>
    <PageComponent {...pageProps} />
  </Reactxois>

}
```

> Next.js example (using the axios instance)
```javascript

import { Axios } from "reactxios";
import { useQuery } from "react-query";

function exampleFetch(){
  return Axios.get("/example/endpoint")
}

export function SomeDataComponent(){

  const { data } = useQuery(["example"], exampleFetch);

  return <p>{data}</p>

}
```

## Props

The reactxios component takes several props as follows

| Name | Description | Type | Optional | Default |
| --- | --- | --- | --- | --- |
| axios | Pass in your own axios instance, simply use the custom axios constructor, "AxiosConstructor" from reactxios | AxiosInstance | ??? | `reactxios.Axios` |
| setup | The setup function for reactxios to use, this passes in the axios instance, and additional props added to reactxios component | SetupHook | ??? | N/A |
| cleanup | The cleanup function for reactxios to use, this should be used if you require dynamic axios configurations and use interceptors (you should eject interceptors before setup is run again to avoid duplication) | SetupHook | ??? | `() => void` |
| children | The children of the component | React children | ??? | N/A |

## Exports

Reactxios exports

### Axios 

This is the reactxios default axios instance, if you don't supply your own AxiosInstance to the Reactxios provider reactxios will use this instead.

### AxiosConstructor

If you wish to use your own AxiosInstance (in the case where you have several different axios instances and configurations accross the same app at the same time) you can use the AxiosConstructor which ensures the correct types are applied to the AxiosInstance (it also saves having to import from axios ;) ).

> Example of using a custom axios instance
```javascript
import { AxiosConstructor, Reactxios } from "reactxios";
export const Axios = AxiosConstructor();

const setup = (instance, { config }){
  instance.defaults.baseURL = config.baseURL
  instance.interceptors.request.use( cfg => {
    cfg.headers = {
       Accept:"application/json",
      "Content-Type":"application/json"
    }
    return cfg;
  })
}

export function App({PageComponent, pageProps: { config, ...pageProps }}){

  return <Reactxios
    axios={Axios} 
    config={config} 
    setup={setup}>
    <PageComponent {...pageProps} />
  </Reactxois>

}
```

### DeepEqual

This is the diffing function used by reactxios to test if the cleanup and setup functions should be run.

### Reactxios

The reactxios provider component, as demonstrated above.

## Typescript

The library supports type checking via typescript, and thus exposes helper types to support better type checking and intellisense.

Below is a demonstration using Reactxios and msal to add an access token to all requests.

> next.js typescript demo
```typescript
import React, { FC, PropsWithChildren } from "react";
import { useConfigs } from "../hooks/useConfigs";

import { Reactxios, SetupHook } from "reactxios"

export interface ConfigProps{
  /** Api Url **/
  url: string;
}

const Setup: SetupHook<ConfigProps> = (
  instance,
  {
    url
  }
) => {
  axiosInstance.defaults.baseURL = url;
}

export const Configs = FC<PropsWithChildren>({children}) => {
  const { url } = useConfigs();

  return <Reactxios<ConfigProps>
    setup={Setup}
    url={url}
  >
    { children }
  </Reactxios>
}
```

## Credits

This package was written by and is maintained by Elliot Gibson.