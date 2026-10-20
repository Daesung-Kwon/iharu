import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds, useForeground } from 'react-native-google-mobile-ads';
import { nextAdRetryDelay } from '../utils/adSlot';
import { useAdsReady } from '../contexts/AdsReadyContext';

interface AdBannerProps {
    style?: any;
    /** Measured height once an ad has loaded (slot keeps it while reloading). */
    onLoadedHeight?: (height: number) => void;
    /** Load failed and the one retry failed too: the slot should collapse. */
    onGiveUp?: () => void;
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

export const AdBanner: React.FC<AdBannerProps> = ({ style, onLoadedHeight, onGiveUp }) => {
    const adsReady = useAdsReady();
    const bannerRef = useRef<BannerAd>(null);
    const [failures, setFailures] = useState(0);
    const [attempt, setAttempt] = useState(0);
    const [waiting, setWaiting] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    // Parent passes a new arrow each render; keep the retry timer from restarting.
    const onGiveUpRef = useRef(onGiveUp);
    onGiveUpRef.current = onGiveUp;

    // iOS can drop the banner's web view while the app is in the background;
    // load a fresh ad on return (library guidance), only while mounted.
    useForeground(() => {
        if (Platform.OS === 'ios') bannerRef.current?.load();
    });

    // One calm retry after a failed load, then give up (slot collapses).
    useEffect(() => {
        if (failures === 0) return;
        const delay = nextAdRetryDelay(failures);
        if (delay === null) {
            onGiveUpRef.current?.();
            return;
        }
        setWaiting(true);
        const t = setTimeout(() => {
            setWaiting(false);
            setAttempt((n) => n + 1); // remount BannerAd = one new request
        }, delay);
        return () => clearTimeout(t);
    }, [failures]);

    // 아동 대상 설정 전에 네이티브 loadAd가 나가지 않도록
    if (!adsReady || waiting) return null;

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
            onLayout={(e) => {
                if (isLoaded) onLoadedHeight?.(e.nativeEvent.layout.height);
            }}
        >
            <BannerAd
                key={attempt}
                ref={bannerRef}
                unitId={finalAdUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
                onAdLoaded={(dims) => {
                    setIsLoaded(true);
                    setFailures(0);
                    if (dims?.height) onLoadedHeight?.(dims.height);
                }}
                onAdFailedToLoad={(err) => {
                    console.warn('Ad failed to load', err);
                    setIsLoaded(false);
                    setFailures((n) => n + 1);
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
