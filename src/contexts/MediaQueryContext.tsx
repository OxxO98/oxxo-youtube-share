import { createContext } from 'react'

export const MediaQueryContext = createContext<MediaQueryContextInterface>({
  pc : "(min-width:1024px)",
  tablet : "(min-width:758px) and (max-width:1023px)",
  mobile : "(max-width:757px) or ((orientation: landscape) and (max-height: 520px) and (max-width: 950px) and (hover: none) and (pointer: coarse))"
})
