export const useGoogleLogin = () => {
  const config = useRuntimeConfig()
  const clientId = config.public.googleClientId

  if (!clientId) {
    return { initGoogleLogin: () => {}, isAvailable: false }
  }

  let scriptLoaded = false

  function loadScript(): Promise<void> {
    return new Promise((resolve) => {
      if (scriptLoaded || (window as any).google?.accounts?.id) {
        scriptLoaded = true
        resolve()
        return
      }
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => { scriptLoaded = true; resolve() }
      document.head.appendChild(script)
    })
  }

  async function initGoogleLogin(callback: (credential: string) => void) {
    await loadScript()
    const google = (window as any).google
    if (!google?.accounts?.id) return
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => callback(response.credential),
    })
    google.accounts.id.renderButton(
      document.getElementById('google-signin-btn'),
      { type: 'standard', shape: 'pill', theme: 'outline', size: 'large', width: '100%' },
    )
  }

  return { initGoogleLogin, isAvailable: true }
}
