export class LocalStorage {
  static get(key: string) {
    if (typeof window === 'undefined') {
      return null
    }

    const value = localStorage.getItem(key)

    if (value) {
      return JSON.parse(value)
    }

    return null
  }

  static set(key: string, value: any) {
    if (typeof window === 'undefined') {
      return
    }

    localStorage.setItem(key, JSON.stringify(value))
  }

  static remove(key: string) {
    if (typeof window === 'undefined') {
      return
    }

    localStorage.removeItem(key)
  }

  static clear() {
    if (typeof window === 'undefined') {
      return
    }

    localStorage.clear()
  }
}

export class SessionStorage {
  static get(key: string) {
    if (typeof window === 'undefined') {
      return null
    }

    const value = sessionStorage.getItem(key)

    if (value) {
      return JSON.parse(value)
    }

    return null
  }

  static set(key: string, value: any) {
    if (typeof window === 'undefined') {
      return
    }

    sessionStorage.setItem(key, JSON.stringify(value))
  }

  static remove(key: string) {
    if (typeof window === 'undefined') {
      return
    }

    sessionStorage.removeItem(key)
  }

  static clear() {
    if (typeof window === 'undefined') {
      return
    }

    sessionStorage.clear()
  }
}
