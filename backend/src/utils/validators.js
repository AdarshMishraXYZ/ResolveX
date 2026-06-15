const validateRegister = (data) => {
  const errors = []
  if (!data.name || data.name.trim() === '') errors.push('Name is required')
  if (!data.email || !data.email.includes('@')) errors.push('Valid email is required')
  if (!data.password || data.password.length < 6) errors.push('Password must be at least 6 characters')
  return errors
}

const validateComplaint = (data) => {
  const errors = []
  if (!data.title || data.title.trim() === '') errors.push('Title is required')
  if (!data.description || data.description.trim() === '') errors.push('Description is required')
  if (!data.category || data.category.trim() === '') errors.push('Category is required')
  return errors
}

module.exports = { validateRegister, validateComplaint }