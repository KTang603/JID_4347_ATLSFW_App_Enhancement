import React, { useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';

const ArticleContent = ({route}) => {
	const webViewRef = useRef(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [progress, setProgress] = useState(0);
	
	const {link} = route.params;
	
	// Ensure the URL has a proper protocol
	const formattedLink = (!link.startsWith('http://') && !link.startsWith('https://')) 
		? 'https://' + link 
		: link;

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

	// Inject CSS to improve article readability
	const injectCSS = `
		(function() {
			const style = document.createElement('style');
			style.textContent = 'body { max-width: 100vw; overflow-x: hidden; font-size: 16px; line-height: 1.6; } img { max-width: 100%; height: auto; } p { margin-bottom: 16px; }';
			document.head.appendChild(style);
		})();
	`;

	return (
		<View style={styles.container}>
			{/* Loading indicator */}
			{loading && progress === 0 && (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#02833D" />
					<Text style={styles.loadingText}>Loading article...</Text>
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
						Unable to load the article. Please check your internet connection and try again.
					</Text>
				</View>
			) : (
				<WebView 
					ref={webViewRef}
					source={{ uri: formattedLink }}
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
					startInLoadingState={false}
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

export default ArticleContent;
