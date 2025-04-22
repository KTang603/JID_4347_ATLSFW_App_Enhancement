import React, { useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';

const ShopNowWebview = ({route}) => {
	const webViewRef = useRef(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [progress, setProgress] = useState(0);
	
	// Get link from route params, with fallback to a default URL
	const params = route.params || {};
	
	let link;
	if (params.link) {
		link = params.link;
	} else if (params.url) {
		link = params.url;
	} else if (params.vendorId) {
		link = `https://www.sustainablefw.com/vendor/${params.vendorId}`;
	} else {
		link = 'https://www.sustainablefw.com/shop';
	}
	
	// Ensure the URL has a proper protocol
	if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
		link = 'https://' + link;
	}

	const handleLoadEnd = () => {
		setLoading(false);
	};

	const handleLoadProgress = ({ nativeEvent }) => {
		setProgress(nativeEvent.progress);
	};

	const handleError = () => {
		setLoading(false);
		setError(true);
	};

	// Inject CSS to improve mobile rendering
	const injectCSS = `
		(function() {
			const style = document.createElement('style');
			style.textContent = 'body { max-width: 100vw; overflow-x: hidden; } img { max-width: 100%; height: auto; }';
			document.head.appendChild(style);
		})();
	`;

	return (
		<View style={styles.container}>
			{/* Loading indicator */}
			{loading && progress === 0 && (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#02833D" />
					<Text style={styles.loadingText}>Loading...</Text>
				</View>
			)}
			
			{/* Progress indicator that shows during loading */}
			{loading && progress > 0 && progress < 1 && (
				<View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
			)}
			
			{/* Error state */}
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
					style={[styles.webView, loading && progress === 0 ? { opacity: 0 } : { opacity: 1 }]}
					onLoadEnd={handleLoadEnd}
					onLoadProgress={handleLoadProgress}
					onError={() => handleError()}
					onHttpError={(syntheticEvent) => {
						if (syntheticEvent.nativeEvent.statusCode >= 400) {
							handleError();
						}
					}}
					injectedJavaScript={injectCSS}
					javaScriptEnabled={true}
					domStorageEnabled={true}
					cacheEnabled={true}
					cacheMode="LOAD_CACHE_ELSE_NETWORK"
					allowsInlineMediaPlayback={true}
					mediaPlaybackRequiresUserAction={false}
					startInLoadingState={false}
					sharedCookiesEnabled={true}
					thirdPartyCookiesEnabled={true}
					incognito={false}
					pullToRefreshEnabled={true}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	webView: {
		flex: 1,
	},
	progressBar: {
		height: 3,
		backgroundColor: '#02833D',
		position: 'absolute',
		top: 0,
		left: 0,
		zIndex: 10,
	},
	loadingContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
		zIndex: 5,
	},
	loadingText: {
		marginTop: 10,
		color: '#666',
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
