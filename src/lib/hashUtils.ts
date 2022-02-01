export const HASH_PARAM_KEY_SOLUTION = 's'
export const HASH_PARAM_KEY_CREATOR = 'c'
export const HASH_PARAM_KEY_DIFFICULTY = 'd'

export const getHashParams = () => {
  const hash = window.location.hash.substring(1)
  const hashComponents = hash.split('&')
  const hashParamsComponents = hashComponents.map((hashComponent) =>
    hashComponent.split('=')
  )
  const hashParams: { [key: string]: string | undefined } = {}
  hashParamsComponents.forEach((hashParamComponents) => {
    if (hashParamComponents.length !== 2) {
      return
    }
    hashParams[hashParamComponents[0]] = hashParamComponents[1]
  })
  return hashParams
}

const createHashString = (params: { key: string; value: string }[]) => {
  let firstParam = true
  let hashString = '#'
  for (const param of params) {
    const { key, value } = param
    hashString = `${hashString}${firstParam ? '' : '&'}${key}=${value}`
    firstParam = false
  }
  return hashString
}

const encodeHashParam = (value: string) => {
  return encodeURIComponent(btoa(unescape(encodeURIComponent(value))))
}

const decodeHashParam = (value: string) => {
  return decodeURIComponent(escape(atob(decodeURIComponent(value))))
}

export const getDecodedHashParam = (key: string) => {
  const hashParams = getHashParams()
  const valueEncoded = hashParams[key]
  return valueEncoded === undefined ? undefined : decodeHashParam(valueEncoded)
}

export const createCustomGameUrl = (
  solution: string,
  creator: string,
  difficulty: number
) => {
  const solutionValue = encodeHashParam(solution)
  const creatorValue = encodeHashParam(creator)
  const urlBeginning = window.location.href.split('#')[0]
  const hashString = createHashString([
    { key: HASH_PARAM_KEY_SOLUTION, value: solutionValue },
    { key: HASH_PARAM_KEY_CREATOR, value: creatorValue },
    { key: HASH_PARAM_KEY_DIFFICULTY, value: difficulty.toString() },
  ])
  const fullUrl = `${urlBeginning}${
    urlBeginning.endsWith('/') ? '' : '/'
  }${hashString}`
  return fullUrl
}
