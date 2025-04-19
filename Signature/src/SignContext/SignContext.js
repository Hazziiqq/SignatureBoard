import { createContext, useContext } from "react";


export const SignContext = createContext({
    signDownload: () => {},
    signReset: () => {},
})

export const SignProvider = SignContext.Provider

export default function useSign(){
    return useContext(SignContext)

}