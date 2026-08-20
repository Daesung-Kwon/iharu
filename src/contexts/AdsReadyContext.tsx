import React, { createContext, useContext } from 'react';

const AdsReadyContext = createContext(false);

export function AdsReadyProvider({
    ready,
    children,
}: {
    ready: boolean;
    children: React.ReactNode;
}) {
    return <AdsReadyContext.Provider value={ready}>{children}</AdsReadyContext.Provider>;
}

export function useAdsReady() {
    return useContext(AdsReadyContext);
}
