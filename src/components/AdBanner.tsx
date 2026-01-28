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

export const AdBanner: React.FC<AdBannerProps> = ({ style }) => {
    const [error, setError] = useState(false);

    if (error) return null;

    return (
        <View style={[styles.container, style]}>
            <BannerAd
                unitId={adUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
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
