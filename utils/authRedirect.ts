export const authRedirectUrl = 'novu://auth/callback';

export function isAuthRedirectUrl(url: string) {
  return url.startsWith(authRedirectUrl);
}

export function getAuthRedirectParams(url: string) {
  const params = new URLSearchParams();
  const [urlWithoutHash, hash = ''] = url.split('#');
  const query = urlWithoutHash.split('?')[1] ?? '';

  for (const source of [query, hash]) {
    const sourceParams = new URLSearchParams(source);
    sourceParams.forEach((value, key) => {
      params.set(key, value);
    });
  }

  return params;
}
