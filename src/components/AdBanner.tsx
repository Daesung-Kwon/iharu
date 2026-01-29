import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

interface AdBannerProps {
    style?: any;
}

const adUnitId = __DEV__
    ? TestIds.BANNER
    : Platform.OS === 'ios'
        ? 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx' // iOS 실제 ID (추후 교체)
        : 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx'; // Android 실제 ID (추후 교체)

// 실제 ID가 설정되지 않은 경우 테스트 ID 사용 (Preview 빌드 등에서 테스트 가능하도록)
const finalAdUnitId = (adUnitId.includes('xxxxxxxxxxxxxxxx') || adUnitId.includes('ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx'))
    ? TestIds.BANNER
    : adUnitId;

export const AdBanner: React.FC<AdBannerProps> = ({ style }) => {
    const [error, setError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    if (error) return null;

    return (
        <View style={[
            styles.container,
            style,
            !isLoaded && {
                backgroundColor: 'transparent',
                elevation: 0,
                shadowOpacity: 0,
                borderWidth: 0
            }
        ]}>
            <BannerAd
                unitId={finalAdUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
                onAdLoaded={() => {
                    console.log('Ad loaded');
                    setIsLoaded(true);
                }}
                onAdFailedToLoad={(err) => {
                    console.error('Ad failed to load', err);
                    setError(true);
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
