import React, { ReactElement, useRef } from "react";
import axios, { AxiosInstance, CreateAxiosDefaults } from "axios";

/** Axios utilities */
export function AxiosConstructor(config?: CreateAxiosDefaults) : AxiosInstance {
  return axios.create(config);
}

export const Axios = AxiosConstructor();

/** Equality utilities */
export function DeepEqual(a: unknown, b: unknown): boolean {
  if (typeof a !== typeof b) return false;

  if (typeof a === "object" && typeof b === "object"){
    return Object.entries(a as Record<string, unknown>)
      .every(([key, value]) => DeepEqual(value, (b as Record<string, unknown>)?.[key]))
  }

  if (Array.isArray(a) && Array.isArray(b)){
    return a.every( (value, index) => DeepEqual(value, b?.[index]))
  }

  return a === b;
}

/** Reactxios types */
export interface SetupHook<Props>{
  (axios: AxiosInstance, props: Props) : void
}

export interface ReactxiosProps<Props> {
  axios?: AxiosInstance;
  setup: SetupHook<Props>;
  cleanup?: SetupHook<Props>;
  children: ReactElement;
}

/** Reactxios component */
export function Reactxios<Props>({
  axios = Axios,
  setup,
  cleanup = () => {},
  children,
  ...props
} : ReactxiosProps<Props> & Props){

  const prevProps = useRef<unknown>();

  if (!DeepEqual(prevProps.current, props)){
    cleanup(axios, props as Props);
    prevProps.current =  props;
    setup(axios, props as Props);
  }

  return children;
}