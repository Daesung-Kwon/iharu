import React, { useEffect, useReducer, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { adBannerReducer, initialAdBannerState, nextAdRetryDelay } from '../utils/adSlot';
import { useAdsReady } from '../contexts/AdsReadyContext';

interface AdBannerProps {
    style?: any;
    /** Measured height once an ad has loaded (slot keeps it while reloading). */
    onLoadedHeight?: (height: number) => void;
}

const adUnitId = __DEV__
    ? TestIds.BANNER
    : Platform.OS === 'ios'
        ? 'ca-app-pub-9978285135642181/1013048669' // iOS 실제 ID
        : 'ca-app-pub-9978285135642181/1379385338'; // Android 실제 ID

// 실제 ID가 설정되지 않은 경우 테스트 ID 사용 (Preview 빌드 등에서 테스트 가능하도록)
const finalAdUnitId = (adUnitId.includes('xxxxxxxxxxxxxxxx') || adUnitId.includes('ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx'))
    ? TestIds.BANNER
    : adUnitId;

/** Stable object: the native view re-requests when this prop changes. */
const REQUEST_OPTIONS = { requestNonPersonalizedAdsOnly: true };

export const AdBanner: React.FC<AdBannerProps> = ({ style, onLoadedHeight }) => {
    const adsReady = useAdsReady();
    const [state, dispatch] = useReducer(adBannerReducer, initialAdBannerState);
    const [isLoaded, setIsLoaded] = useState(false);

    // After a failed load, wait (15s, 30s, then 60s) and request again.
    useEffect(() => {
        if (!state.waiting) return;
        const t = setTimeout(() => dispatch({ type: 'RETRY' }), nextAdRetryDelay(state.failures));
        return () => clearTimeout(t);
    }, [state.waiting, state.failures]);

    // 아동 대상 설정 전에 네이티브 loadAd가 나가지 않도록
    if (!adsReady || state.waiting) return null;

    return (
        <View
            style={[
                styles.container,
                style,
                !isLoaded && {
                    backgroundColor: 'transparent',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderWidth: 0
                }
            ]}
        >
            <BannerAd
                key={state.attempt}
                unitId={finalAdUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={REQUEST_OPTIONS}
                onAdLoaded={(dims) => {
                    setIsLoaded(true);
                    dispatch({ type: 'LOADED' });
                    if (dims?.height) onLoadedHeight?.(dims.height);
                }}
                onAdFailedToLoad={(err) => {
                    console.warn('Ad failed to load', err);
                    setIsLoaded(false);
                    dispatch({ type: 'FAILED' });
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        backgroundColor: 'transparent', // 배경색에 맞게 조정 가능
    },
});
