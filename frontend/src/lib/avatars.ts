export const generateInitialsAvatar = async (name: string) => {
  try {
    const res = await fetch(`https://avatar.iran.liara.run/username?username=${name}`, {
      mode: 'no-cors',
    })

    if (!res.ok) throw new Error('Network response was not ok.')

    const blob = await res.blob()

    return URL.createObjectURL(blob)
  } catch (err) {
    console.error(err)
    return null
  }
}
