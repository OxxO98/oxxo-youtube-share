import { createContext } from 'react'

export const MediaQueryContext = createContext<MediaQueryContextInterface>({
  large : "(min-width:1024px)",
  medium : "(min-width:758px) and (max-width:1023px)",
  short : "(max-width:757px)",
  mobile : "(hover: none) and (pointer: coarse)",
  mobileLandscape : "(orientation: landscape) and (max-height: 520px) and (max-width: 950px) and (hover: none) and (pointer: coarse)"
})
