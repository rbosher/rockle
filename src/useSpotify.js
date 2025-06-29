// src/useSpotify.js

const clientId = 'c28f225ecbaf49d59d759894f585339b';
const clientSecret = 'bbd2b0e82907424aa89da57283bfcf1f';

let tokenCache = {
  access_token: null,
  expires_at: 0,
};

export async function getSpotifyToken() {
  const now = Date.now();
  if (tokenCache.access_token && now < tokenCache.expires_at) {
    return tokenCache.access_token;
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' + btoa(`${clientId}:${clientSecret}`),
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();

  tokenCache.access_token = data.access_token;
  tokenCache.expires_at = now + data.expires_in * 1000;
  return data.access_token;
}
