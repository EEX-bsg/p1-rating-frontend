export const useApi = () => {
    const config = useRuntimeConfig()
    const BASE_URL = 'https://script.google.com/macros/s/AKfycbyfZ8OOy4V7RAhoKep-x8OUu6X0nU32egBSxZVycv64oWWk9ztiSq2YtJ7FJYV02A9d/exec'

    const buildUrl = (action: string, params: Record<string, any> = {}) => {
        const url = new URL(BASE_URL)
        url.searchParams.set('action', action)
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, String(value))
            }
        })
        return url.toString()
    }

    const fetchApi = async (action: string, params: Record<string, any> = {}) => {
        try {
            const url = buildUrl(action, params)
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            if (!data.ok) {
                throw new Error(data.error?.message || 'API error')
            }
            
            return data.data
        } catch (error) {
            console.error('API Error:', error)
            throw error
        }
    }

    const getMeta = async () => {
        return await fetchApi('meta')
    }

    const getSuggest = async (prefix: string, limit: number = 20) => {
        return await fetchApi('suggest', { prefix, limit })
    }

    const getStates = async (names: string[]) => {
        return await fetchApi('getStates', { names: names.join(',') })
    }

    const submitStates = async (players: Array<{ name: string; mu: number; sigma: number }>, enteredBy: string) => {
        const names = players.map(p => p.name).join(',')
        const mus = players.map(p => p.mu).join(',')
        const sigmas = players.map(p => p.sigma).join(',')

        return await fetchApi('submitStates', { names, mus, sigmas, enteredBy })
    }

    const submitState = async (name: string, mu: number, sigma: number) => {
        return await fetchApi('submitState', { name, mu, sigma })
    }

    return {
        getMeta,
        getSuggest,
        getStates,
        submitStates,
        submitState
    }
}
