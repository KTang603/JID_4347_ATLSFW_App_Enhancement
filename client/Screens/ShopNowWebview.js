import React, { useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const ShopNowWebview = ({route}) => {
	const webViewRef = useRef(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	
	// Get link from route params, with fallback to a default URL
	const params = route.params || {};
	
	// Debug: Log the received parameters
	console.log('ShopNowWebview params:', JSON.stringify(params));
	
	let link;
	if (params.link) {
		link = params.link;
		console.log('Using link parameter:', link);
	} else if (params.url) {
		link = params.url;
		console.log('Using url parameter:', link);
	} else if (params.vendorId) {
		link = `https://www.sustainablefw.com/vendor/${params.vendorId}`;
		console.log('Using vendorId parameter:', link);
	} else {
		link = 'https://www.sustainablefw.com/shop';
		console.log('Using default URL:', link);
	}
	
	// Ensure the URL has a proper protocol
	if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
		link = 'https://' + link;
		console.log('Added https protocol:', link);
	}

	const handleLoadEnd = () => {
		setLoading(false);
	};

	const handleError = () => {
		setLoading(false);
		setError(true);
	};

	return (
		<>
			{loading && (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#02833D" />
					<Text style={styles.loadingText}>Loading...</Text>
				</View>
			)}
			
			{error ? (
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>
						Unable to load the page. Please check your internet connection and try again.
					</Text>
				</View>
			) : (
				<WebView 
					ref={webViewRef}
					source={{ uri: link }}
					style={{ flex: 1, opacity: loading ? 0 : 1 }}
					onLoadEnd={handleLoadEnd}
					onError={(syntheticEvent) => {
						const { nativeEvent } = syntheticEvent;
						console.error('WebView error:', JSON.stringify(nativeEvent));
						handleError();
					}}
					onHttpError={(syntheticEvent) => {
						const { nativeEvent } = syntheticEvent;
						console.error('WebView HTTP error:', JSON.stringify(nativeEvent));
						if (nativeEvent.statusCode >= 400) {
							handleError();
						}
					}}
					onNavigationStateChange={(navState) => {
						console.log('Navigation state changed:', JSON.stringify(navState));
					}}
					javaScriptEnabled={true}
					domStorageEnabled={true}
					allowsInlineMediaPlayback={true}
					mediaPlaybackRequiresUserAction={false}
				/>
			)}
		</>
	);
};

const styles = StyleSheet.create({
	loadingContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f5f5f5',
		zIndex: 1,
	},
	loadingText: {
		marginTop: 10,
		color: '#02833D',
		fontSize: 16,
	},
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	errorText: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
		lineHeight: 24,
	},
});

export default ShopNowWebview;
