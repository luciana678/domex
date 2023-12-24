export class LocalStorage {
  static get(key: string) {
    const value = window?.localStorage.getItem(key)

    if (value) {
      return JSON.parse(value)
    }

    return null
  }

  static set(key: string, value: any) {
    window?.localStorage.setItem(key, JSON.stringify(value))
  }

  static remove(key: string) {
    window?.localStorage.removeItem(key)
  }

  static removeWithFilter(key: string, filter: (item: any) => boolean) {
    const value = window?.localStorage.getItem(key)

    if (value) {
      const parsedValue = JSON.parse(value)
      const newValue = parsedValue.filter(filter)
      window?.localStorage.setItem(key, JSON.stringify(newValue))
    }
  }

  static clear() {
    window?.localStorage.clear()
  }
}

export class SessionStorage {
  static get(key: string) {
    const value = window?.sessionStorage.getItem(key)

    if (value) {
      return JSON.parse(value)
    }

    return null
  }

  static set(key: string, value: any) {
    window?.sessionStorage.setItem(key, JSON.stringify(value))
  }

  static remove(key: string) {
    window?.sessionStorage.removeItem(key)
  }

  static clear() {
    window?.sessionStorage.clear()
  }
}
