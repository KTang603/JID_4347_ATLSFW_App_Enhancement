import * as Crypto from 'expo-crypto';

async function hashString(data) {
    try {
        console.log('Hashing data:', data);
        const hash = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            data
        );
        console.log('Generated hash:', hash);
        return hash;
    } catch (error) {
        console.error('Error hashing string:', error);
        throw error;
    }
}


export default hashString;
